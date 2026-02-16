import { apiClient } from './client';

export interface LoyaltyTransaction {
    id: number;
    customer_id: number;
    booking_id: number | null;
    points: number;
    type: 'earned' | 'redeemed' | 'expired' | 'bonus';
    description: string | null;
    created_at: string;
}

export interface LoyaltyStats {
    totalPoints: number;
    totalEarned: number;
    totalRedeemed: number;
    completedBookings: number;
    reviewsWritten: number;
}

export interface PointsConfig {
    BOOKING_COMPLETED: number;
    BOOKING_WITH_REVIEW: number;
    WELCOME_BONUS: number;
    POINTS_PER_EURO: number;
}

/**
 * Get customer's loyalty stats
 */
export async function getLoyaltyStats() {
    return apiClient<LoyaltyStats>('/customer/loyalty', {
        method: 'GET',
        credentials: 'include',
    });
}

/**
 * Get customer's loyalty points balance
 */
export async function getLoyaltyBalance() {
    return apiClient<{ points: number }>('/customer/loyalty/balance', {
        method: 'GET',
        credentials: 'include',
    });
}

/**
 * Get customer's loyalty transaction history
 */
export async function getLoyaltyTransactions(limit = 50) {
    return apiClient<LoyaltyTransaction[]>(`/customer/loyalty/transactions?limit=${limit}`, {
        method: 'GET',
        credentials: 'include',
    });
}

/**
 * Get points configuration
 */
export async function getPointsConfig() {
    return apiClient<PointsConfig>('/customer/loyalty/config', {
        method: 'GET',
        credentials: 'include',
    });
}
