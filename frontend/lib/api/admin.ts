import type { AdminUser, LoginResponse, Venue } from "../types";
import { NETWORK_ERROR_MESSAGE, isNetworkError } from "./client";

/** Im Browser Same-Origin (/api) für Cookie-Auth, sonst direkte Backend-URL. */
function getAdminApiBase(): string {
  if (typeof window !== "undefined") return "/api";
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
}

/**
 * Admin API client – Auth nur per HttpOnly-Cookie (credentials: 'include').
 * Nur System-Admin-Endpunkte (/admin/*). Owner-Bereich nutzt owner.ts (/owner/*).
 */
async function adminApiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<{
  success: boolean;
  data?: T;
  message?: string;
  pagination?: { total: number; limit: number; offset: number };
}> {
  try {
    const response = await fetch(`${getAdminApiBase()}${endpoint}`, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data && typeof data.message === "string" ? data.message : "API request failed"
      );
    }

    return data;
  } catch (error) {
    if (isNetworkError(error)) {
      throw new Error(NETWORK_ERROR_MESSAGE);
    }
    throw error;
  }
}

// --- Auth (shared) ---

export async function login(
  email: string,
  password: string
): Promise<{ success: boolean; data?: { user: AdminUser }; message?: string }> {
  try {
    const response = await fetch(`${getAdminApiBase()}/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      message: isNetworkError(error)
        ? NETWORK_ERROR_MESSAGE
        : ((error as Error).message || "Login fehlgeschlagen"),
    };
  }
}

export async function logout(): Promise<void> {
  try {
    await adminApiClient("/auth/logout", { method: "POST" });
  } catch {
    // Ignore – Cookie wird vom Backend gelöscht
  }
}

export async function getCurrentUser(): Promise<{
  success: boolean;
  data?: AdminUser;
}> {
  return adminApiClient<AdminUser>("/auth/me");
}

// --- System-Admin (role admin): Stats, Venues, Admins ---

export interface GlobalStats {
  venues: { total: number; active: number };
  admins: { total: number; active: number };
  customers: { total: number; active: number };
  /** User-Anzahl pro Rolle (admin = System-Admin, owner, staff); optional für Abwärtskompatibilität */
  usersByRole?: { admin: number; owner: number; staff: number };
  bookings: {
    total: number;
    pending: number;
    confirmed: number;
    cancelled: number;
    completed: number;
    thisMonth: number;
  };
}

export interface AdminWithVenue extends AdminUser {
  venue_name: string | null;
  is_active: boolean;
  last_login: Date | null;
  created_at: Date;
}

export async function getAdminStats(): Promise<{
  success: boolean;
  data?: GlobalStats;
  message?: string;
}> {
  return adminApiClient<GlobalStats>("/admin/stats");
}

export async function listVenues(): Promise<{
  success: boolean;
  data?: Venue[];
  message?: string;
}> {
  return adminApiClient<Venue[]>("/admin/venues");
}

export async function getVenue(id: number): Promise<{
  success: boolean;
  data?: Venue;
  message?: string;
}> {
  return adminApiClient<Venue>(`/admin/venues/${id}`);
}

export async function createVenue(
  data: Partial<Venue> & { name: string; type: Venue["type"]; email: string }
): Promise<{ success: boolean; data?: Venue; message?: string }> {
  const res = await fetch(`${getAdminApiBase()}/admin/venues`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((r) => r.json());
  return res;
}

export async function updateVenue(
  id: number,
  data: Partial<Venue>
): Promise<{ success: boolean; data?: Venue; message?: string }> {
  return adminApiClient<Venue>(`/admin/venues/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function listAdmins(): Promise<{
  success: boolean;
  data?: AdminWithVenue[];
  message?: string;
}> {
  return adminApiClient<AdminWithVenue[]>("/admin/users");
}

export async function createAdmin(data: {
  email: string;
  password: string;
  name: string;
  venue_id?: number | null;
  role?: "owner" | "staff";
}): Promise<{ success: boolean; data?: AdminUser; message?: string }> {
  const res = await fetch(`${getAdminApiBase()}/admin/users`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((r) => r.json());
  return res;
}

export async function updateAdmin(
  id: number,
  data: {
    venue_id?: number | null;
    role?: "owner" | "staff";
    is_active?: boolean;
    name?: string;
  }
): Promise<{ success: boolean; data?: AdminUser; message?: string }> {
  return adminApiClient<AdminUser>(`/admin/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function setAdminPassword(
  adminId: number,
  newPassword: string
): Promise<{ success: boolean; message?: string }> {
  return adminApiClient(`/admin/users/${adminId}/password`, {
    method: "PATCH",
    body: JSON.stringify({ newPassword }),
  });
}

// --- Customer Management ---

export interface CustomerWithStats {
  id: number;
  email: string;
  name: string;
  phone?: string;
  loyalty_points: number;
  is_active: boolean;
  email_verified: boolean;
  last_login?: Date;
  created_at: Date;
  total_bookings: number;
  completed_bookings: number;
  cancelled_bookings: number;
  total_spent: number;
}

export async function listCustomers(params?: {
  search?: string;
  active?: boolean;
  limit?: number;
  offset?: number;
}): Promise<{
  success: boolean;
  data?: CustomerWithStats[];
  total?: number;
  message?: string;
}> {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.active !== undefined) query.set("active", String(params.active));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.offset) query.set("offset", String(params.offset));

  const endpoint = `/admin/customers${query.toString() ? `?${query.toString()}` : ""}`;
  return adminApiClient<CustomerWithStats[]>(endpoint);
}

export async function getCustomer(id: number): Promise<{
  success: boolean;
  data?: CustomerWithStats;
  message?: string;
}> {
  return adminApiClient<CustomerWithStats>(`/admin/customers/${id}`);
}

export async function updateCustomer(
  id: number,
  data: {
    name?: string;
    phone?: string;
    email_verified?: boolean;
    is_active?: boolean;
  }
): Promise<{ success: boolean; data?: CustomerWithStats; message?: string }> {
  return adminApiClient<CustomerWithStats>(`/admin/customers/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function setCustomerPassword(
  customerId: number,
  newPassword: string
): Promise<{ success: boolean; message?: string }> {
  return adminApiClient(`/admin/customers/${customerId}/password`, {
    method: "PATCH",
    body: JSON.stringify({ newPassword }),
  });
}

export async function adjustCustomerLoyaltyPoints(
  customerId: number,
  pointsChange: number,
  reason: string
): Promise<{
  success: boolean;
  data?: { newBalance: number };
  message?: string;
}> {
  return adminApiClient<{ newBalance: number }>(
    `/admin/customers/${customerId}/loyalty-points`,
    {
      method: "POST",
      body: JSON.stringify({ pointsChange, reason }),
    }
  );
}

// --- Loyalty Configuration ---

export interface LoyaltyConfig {
  BOOKING_COMPLETED: number;
  BOOKING_WITH_REVIEW: number;
  WELCOME_BONUS: number;
  EMAIL_VERIFIED_BONUS: number;
  POINTS_PER_EURO: number;
}

export async function getLoyaltyConfig(): Promise<{
  success: boolean;
  data?: LoyaltyConfig;
  message?: string;
}> {
  return adminApiClient<LoyaltyConfig>("/admin/loyalty/config");
}

export async function updateLoyaltyConfig(
  config: Partial<LoyaltyConfig>
): Promise<{
  success: boolean;
  data?: LoyaltyConfig;
  message?: string;
}> {
  return adminApiClient<LoyaltyConfig>("/admin/loyalty/config", {
    method: "PATCH",
    body: JSON.stringify(config),
  });
}
