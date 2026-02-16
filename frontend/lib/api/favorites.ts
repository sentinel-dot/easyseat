import { apiClient } from './client';

export interface Venue {
    id: number;
    name: string;
    type: 'restaurant' | 'hair_salon' | 'beauty_salon' | 'massage' | 'other';
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    postal_code?: string;
    country: string;
    description?: string;
    image_url?: string;
    website_url?: string;
    is_active: boolean;
}

export interface CustomerFavorite {
    id: number;
    customer_id: number;
    venue_id: number;
    created_at: string;
    venue: Venue;
}

/**
 * Get all customer favorites
 */
export async function getFavorites() {
    return apiClient<CustomerFavorite[]>('/customer/favorites', {
        method: 'GET',
        credentials: 'include',
    });
}

/**
 * Check if venue is favorited
 */
export async function isFavorite(venueId: number) {
    return apiClient<{ isFavorite: boolean }>(`/customer/favorites/${venueId}/check`, {
        method: 'GET',
        credentials: 'include',
    });
}

/**
 * Add venue to favorites
 */
export async function addFavorite(venueId: number) {
    return apiClient<CustomerFavorite>(`/customer/favorites/${venueId}`, {
        method: 'POST',
        credentials: 'include',
    });
}

/**
 * Remove venue from favorites
 */
export async function removeFavorite(venueId: number) {
    return apiClient<{ message: string }>(`/customer/favorites/${venueId}`, {
        method: 'DELETE',
        credentials: 'include',
    });
}
