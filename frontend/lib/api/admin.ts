import type { AdminUser, LoginResponse, Venue } from "../types";
import { NETWORK_ERROR_MESSAGE, isNetworkError } from "./client";

/** Im Browser Same-Origin (/api) für Cookie-Auth, sonst direkte Backend-URL. */
function getAdminApiBase(): string {
  if (typeof window !== "undefined") return "/api";
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
}

/**
 * Admin API client – Auth nur per HttpOnly-Cookie (credentials: 'include').
 * Nur System-Admin-Endpunkte (/admin/*). Venue-Dashboard nutzt dashboard.ts (/dashboard/*).
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
