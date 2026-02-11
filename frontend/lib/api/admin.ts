import { AdminUser, LoginResponse, AdminStats, BookingWithDetails, Service, AvailabilityRule, CreateBookingData, Booking, Venue } from '../types';
import { NETWORK_ERROR_MESSAGE, isNetworkError } from './client';

/** Im Browser Same-Origin (/api) für Cookie-Auth, sonst direkte Backend-URL. */
function getAdminApiBase(): string {
    if (typeof window !== 'undefined') return '/api';
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
}

/**
 * Admin API client – Auth nur per HttpOnly-Cookie (credentials: 'include').
 */
async function adminApiClient<T>(
    endpoint: string,
    options?: RequestInit
): Promise<{ success: boolean; data?: T; message?: string; pagination?: { total: number; limit: number; offset: number } }> {
    try {
        const response = await fetch(`${getAdminApiBase()}${endpoint}`, {
            ...options,
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error((data && typeof data.message === 'string') ? data.message : 'API request failed');
        }

        return data;
    } catch (error) {
        if (isNetworkError(error)) {
            throw new Error(NETWORK_ERROR_MESSAGE);
        }
        throw error;
    }
}

/**
 * Login – Backend setzt HttpOnly-Cookie, Response enthält nur { user }.
 */
export async function login(email: string, password: string): Promise<{ success: boolean; data?: { user: AdminUser }; message?: string }> {
    try {
        const response = await fetch(`${getAdminApiBase()}/auth/login`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        return data;
    } catch (error) {
        return {
            success: false,
            message: isNetworkError(error) ? NETWORK_ERROR_MESSAGE : ((error as Error).message || 'Login fehlgeschlagen')
        };
    }
}

/**
 * Logout
 */
export async function logout(): Promise<void> {
    try {
        await adminApiClient('/auth/logout', { method: 'POST' });
    } catch {
        // Ignore – Cookie wird vom Backend gelöscht
    }
}

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<{ success: boolean; data?: AdminUser }> {
    return adminApiClient<AdminUser>('/auth/me');
}

/**
 * Get bookings with filters
 */
export async function getBookings(filters?: {
    startDate?: string;
    endDate?: string;
    status?: string;
    serviceId?: number;
    search?: string;
    limit?: number;
    offset?: number;
}): Promise<{ 
    success: boolean; 
    data?: BookingWithDetails[]; 
    pagination?: { total: number; limit: number; offset: number };
    message?: string;
}> {
    const params = new URLSearchParams();
    
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.serviceId) params.append('serviceId', filters.serviceId.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const queryString = params.toString();
    return adminApiClient<BookingWithDetails[]>(`/admin/bookings${queryString ? `?${queryString}` : ''}`);
}

/**
 * Update booking status
 */
export async function updateBookingStatus(
    bookingId: number,
    status: string,
    reason?: string
): Promise<{ success: boolean; data?: BookingWithDetails; message?: string }> {
    return adminApiClient<BookingWithDetails>(`/admin/bookings/${bookingId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, reason }),
    });
}

/**
 * Get dashboard stats
 */
export async function getStats(): Promise<{ success: boolean; data?: AdminStats; message?: string }> {
    return adminApiClient<AdminStats>('/admin/stats');
}

/**
 * Get services
 */
export async function getServices(): Promise<{ success: boolean; data?: Service[]; message?: string }> {
    return adminApiClient<Service[]>('/admin/services');
}

/**
 * Update service
 */
export async function updateService(
    serviceId: number,
    updates: {
        name?: string;
        description?: string;
        duration_minutes?: number;
        price?: number;
        is_active?: boolean;
    }
): Promise<{ success: boolean; data?: Service; message?: string }> {
    return adminApiClient<Service>(`/admin/services/${serviceId}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
    });
}

/**
 * Get availability rules
 */
export async function getAvailabilityRules(): Promise<{ success: boolean; data?: AvailabilityRule[]; message?: string }> {
    return adminApiClient<AvailabilityRule[]>('/admin/availability');
}

/**
 * Update availability rule
 */
export async function updateAvailabilityRule(
    ruleId: number,
    updates: {
        start_time?: string;
        end_time?: string;
        is_active?: boolean;
    }
): Promise<{ success: boolean; message?: string }> {
    return adminApiClient(`/admin/availability/${ruleId}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
    });
}

/**
 * Create manual booking (bypasses booking_advance_hours check)
 */
export async function createManualBooking(
    bookingData: Omit<CreateBookingData, 'venue_id'>
): Promise<{ success: boolean; data?: Booking; message?: string }> {
    return adminApiClient<Booking>('/admin/bookings', {
        method: 'POST',
        body: JSON.stringify(bookingData),
    });
}

/**
 * Get venue settings
 */
export async function getVenueSettings(): Promise<{ success: boolean; data?: Venue; message?: string }> {
    return adminApiClient<Venue>('/admin/venue/settings');
}

/**
 * Update venue settings (booking policies)
 */
export async function updateVenueSettings(
    updates: {
        booking_advance_hours?: number;
        cancellation_hours?: number;
    }
): Promise<{ success: boolean; message?: string }> {
    return adminApiClient('/admin/venue/settings', {
        method: 'PATCH',
        body: JSON.stringify(updates),
    });
}

/**
 * Change the current admin user's password
 */
export async function changePassword(
    currentPassword: string,
    newPassword: string
): Promise<{ success: boolean; message?: string }> {
    return adminApiClient('/admin/me/password', {
        method: 'PATCH',
        body: JSON.stringify({
            currentPassword,
            newPassword,
        }),
    });
}
