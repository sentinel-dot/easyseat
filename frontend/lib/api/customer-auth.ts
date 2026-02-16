import { apiClient } from './client';

export interface CustomerPublic {
    id: number;
    email: string;
    name: string;
    phone: string | null;
    loyalty_points: number;
    email_verified: boolean;
}

export interface CustomerRegisterRequest {
    email: string;
    password: string;
    name: string;
    phone?: string;
}

export interface CustomerLoginRequest {
    email: string;
    password: string;
}

export interface CustomerLoginResponse {
    token: string;
    customer: CustomerPublic;
}

/**
 * Register a new customer account.
 * The backend automatically links all past bookings with the same email to the new account.
 */
export async function register(data: CustomerRegisterRequest) {
    return apiClient<CustomerLoginResponse>('/auth/customer/register', {
        method: 'POST',
        body: JSON.stringify(data),
        credentials: 'include', // Important for cookies
    });
}

/**
 * Login customer
 */
export async function login(data: CustomerLoginRequest) {
    return apiClient<CustomerLoginResponse>('/auth/customer/login', {
        method: 'POST',
        body: JSON.stringify(data),
        credentials: 'include', // Important for cookies
    });
}

/**
 * Logout customer
 */
export async function logout() {
    return apiClient('/auth/customer/logout', {
        method: 'POST',
        credentials: 'include',
    });
}

/**
 * Get current customer profile
 */
export async function getCurrentCustomer() {
    return apiClient<CustomerPublic>('/auth/customer/me', {
        method: 'GET',
        credentials: 'include',
    });
}

/**
 * Verify email with token
 */
export async function verifyEmail(token: string) {
    return apiClient<{ message: string }>('/auth/customer/verify-email', {
        method: 'POST',
        body: JSON.stringify({ token }),
    });
}

/**
 * Request password reset
 */
export async function requestPasswordReset(email: string) {
    return apiClient<{ message: string }>('/auth/customer/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
    });
}

/**
 * Reset password with token
 */
export async function resetPassword(token: string, newPassword: string) {
    return apiClient<{ message: string }>('/auth/customer/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword }),
    });
}

/**
 * Change password for authenticated customer
 */
export async function changePassword(currentPassword: string, newPassword: string) {
    return apiClient<{ message: string }>('/auth/customer/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
        credentials: 'include',
    });
}

/**
 * Resend verification email
 */
export async function resendVerificationEmail() {
    return apiClient<{ message: string }>('/auth/customer/resend-verification', {
        method: 'POST',
        credentials: 'include',
    });
}
