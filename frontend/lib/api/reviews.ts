import { apiClient } from './client';

export interface Review {
    id: number;
    customer_id: number;
    venue_id: number;
    booking_id: number;
    rating: number;
    comment: string | null;
    is_verified: boolean;
    response: string | null;
    response_at: string | null;
    created_at: string;
    updated_at: string;
    customer_name?: string;
    venue_name?: string;
}

export interface CreateReviewRequest {
    venue_id: number;
    booking_id: number;
    rating: number;
    comment?: string;
}

/**
 * Get all reviews for a venue (public)
 */
export async function getVenueReviews(venueId: number) {
    return apiClient<Review[]>(`/venues/${venueId}/reviews`, {
        method: 'GET',
    });
}

/**
 * Get average rating for a venue (public)
 */
export async function getVenueAverageRating(venueId: number) {
    return apiClient<{ average: number; count: number }>(`/venues/${venueId}/reviews/rating`, {
        method: 'GET',
    });
}

/**
 * Check if customer can review a venue
 */
export async function canReviewVenue(venueId: number) {
    return apiClient<{
        canReview: boolean;
        completedBookingId?: number;
        reason?: string;
    }>(`/venues/${venueId}/reviews/can-review`, {
        method: 'GET',
        credentials: 'include',
    });
}

/**
 * Get all customer's reviews
 */
export async function getCustomerReviews() {
    return apiClient<Review[]>('/customer/reviews', {
        method: 'GET',
        credentials: 'include',
    });
}

/**
 * Create a new review
 */
export async function createReview(data: CreateReviewRequest) {
    return apiClient<Review>('/customer/reviews', {
        method: 'POST',
        body: JSON.stringify(data),
        credentials: 'include',
    });
}

/**
 * Update a review
 */
export async function updateReview(reviewId: number, updates: { rating?: number; comment?: string }) {
    return apiClient<Review>(`/customer/reviews/${reviewId}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
        credentials: 'include',
    });
}

/**
 * Delete a review
 */
export async function deleteReview(reviewId: number) {
    return apiClient<{ message: string }>(`/customer/reviews/${reviewId}`, {
        method: 'DELETE',
        credentials: 'include',
    });
}
