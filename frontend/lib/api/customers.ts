import { apiClient } from './client';
import { CustomerPublic } from './customer-auth';

export interface CustomerPreferences {
    customer_id: number;
    default_party_size: number;
    preferred_time_slot: string | null;
    notification_email: boolean;
    notification_sms: boolean;
    language: string;
    created_at: string;
    updated_at: string;
}

export interface Booking {
    id: number;
    customer_id?: number | null;
    booking_token: string;
    venue_id: number;
    service_id: number;
    staff_member_id?: number | null;
    customer_name: string;
    customer_email: string;
    customer_phone?: string | null;
    booking_date: string;
    start_time: string;
    end_time: string;
    party_size: number;
    special_requests?: string | null;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
    total_amount?: number | null;
    venue_name?: string;
    service_name?: string;
    staff_member_name?: string;
    created_at: string;
    updated_at: string;
}

/**
 * Get customer profile
 */
export async function getProfile() {
    return apiClient<CustomerPublic>('/customer/profile', {
        method: 'GET',
        credentials: 'include',
    });
}

/**
 * Update customer profile
 */
export async function updateProfile(updates: { name?: string; phone?: string }) {
    return apiClient<CustomerPublic>('/customer/profile', {
        method: 'PATCH',
        body: JSON.stringify(updates),
        credentials: 'include',
    });
}

/**
 * Delete customer account
 */
export async function deleteAccount() {
    return apiClient<{ message: string }>('/customer/profile', {
        method: 'DELETE',
        credentials: 'include',
    });
}

/**
 * Get customer preferences
 */
export async function getPreferences() {
    return apiClient<CustomerPreferences>('/customer/preferences', {
        method: 'GET',
        credentials: 'include',
    });
}

/**
 * Update customer preferences
 */
export async function updatePreferences(updates: Partial<Omit<CustomerPreferences, 'customer_id' | 'created_at' | 'updated_at'>>) {
    return apiClient<CustomerPreferences>('/customer/preferences', {
        method: 'PATCH',
        body: JSON.stringify(updates),
        credentials: 'include',
    });
}

/**
 * Get customer's booking history (authenticated)
 */
export async function getBookings(onlyFuture = false) {
    const query = onlyFuture ? '?onlyFuture=true' : '';
    return apiClient<Booking[]>(`/customer/bookings${query}`, {
        method: 'GET',
        credentials: 'include',
    });
}

/**
 * Quick rebook a previous booking
 */
export async function quickRebook(
    bookingId: number,
    data: {
        booking_date: string;
        start_time: string;
        end_time: string;
        party_size?: number;
    }
) {
    return apiClient<Booking>(`/customer/bookings/${bookingId}/quick-rebook`, {
        method: 'POST',
        body: JSON.stringify(data),
        credentials: 'include',
    });
}
