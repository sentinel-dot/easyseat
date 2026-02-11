import { AdminUser, LoginResponse, AdminStats, BookingWithDetails, Service, AvailabilityRule, CreateBookingData, Booking, Venue } from '../types';
import { NETWORK_ERROR_MESSAGE, isNetworkError } from './client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

// Token storage key
const TOKEN_KEY = 'admin_token';
const USER_KEY = 'admin_user';

/**
 * Get stored auth token
 */
export function getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
}

/**
 * Get stored user
 */
export function getStoredUser(): AdminUser | null {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
}

/**
 * Store auth data
 */
function storeAuth(token: string, user: AdminUser): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * Clear auth data
 */
export function clearAuth(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
    return !!getToken();
}

/**
 * Admin API client with auth header
 */
async function adminApiClient<T>(
    endpoint: string,
    options?: RequestInit
): Promise<{ success: boolean; data?: T; message?: string; pagination?: { total: number; limit: number; offset: number } }> {
    const token = getToken();
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...options?.headers,
            },
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                clearAuth();
            }
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
 * Login
 */
export async function login(email: string, password: string): Promise<{ success: boolean; data?: LoginResponse; message?: string }> {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (data.success && data.data) {
            storeAuth(data.data.token, data.data.user);
        }

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
        // Ignore errors on logout
    }
    clearAuth();
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
