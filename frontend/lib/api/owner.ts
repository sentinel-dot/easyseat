import type {
  AdminStats,
  BookingWithDetails,
  BookingAuditLogEntry,
  Service,
  AvailabilityRule,
  CreateBookingData,
  Booking,
  Venue,
} from "@/lib/types";
import { NETWORK_ERROR_MESSAGE, isNetworkError } from "./client";

function getOwnerApiBase(): string {
  if (typeof window !== "undefined") return "/api";
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
}

async function ownerApiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<{
  success: boolean;
  data?: T;
  message?: string;
  pagination?: { total: number; limit: number; offset: number };
}> {
  try {
    const response = await fetch(`${getOwnerApiBase()}${endpoint}`, {
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
  if (filters?.startDate) params.append("startDate", filters.startDate);
  if (filters?.endDate) params.append("endDate", filters.endDate);
  if (filters?.status) params.append("status", filters.status);
  if (filters?.serviceId != null) params.append("serviceId", String(filters.serviceId));
  if (filters?.search) params.append("search", filters.search);
  if (filters?.limit != null) params.append("limit", String(filters.limit));
  if (filters?.offset != null) params.append("offset", String(filters.offset));
  const queryString = params.toString();
  return ownerApiClient<BookingWithDetails[]>(
    `/owner/bookings${queryString ? `?${queryString}` : ""}`
  );
}

export async function getBooking(bookingId: number): Promise<{
  success: boolean;
  data?: BookingWithDetails;
  message?: string;
}> {
  return ownerApiClient<BookingWithDetails>(
    `/owner/bookings/${bookingId}`
  );
}

export async function getBookingAuditLog(
  bookingId: number
): Promise<{
  success: boolean;
  data?: BookingAuditLogEntry[];
  message?: string;
}> {
  return ownerApiClient<BookingAuditLogEntry[]>(
    `/owner/bookings/${bookingId}/audit`
  );
}

export async function updateBookingStatus(
  bookingId: number,
  status: string,
  reason?: string
): Promise<{ success: boolean; data?: BookingWithDetails; message?: string }> {
  return ownerApiClient<BookingWithDetails>(
    `/owner/bookings/${bookingId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status, reason }),
    }
  );
}

export async function getStats(): Promise<{
  success: boolean;
  data?: AdminStats;
  message?: string;
}> {
  return ownerApiClient<AdminStats>("/owner/stats");
}

export async function getServices(): Promise<{
  success: boolean;
  data?: Service[];
  message?: string;
}> {
  return ownerApiClient<Service[]>("/owner/services");
}

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
  return ownerApiClient<Service>(`/owner/services/${serviceId}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
}

export async function getAvailabilityRules(): Promise<{
  success: boolean;
  data?: AvailabilityRule[];
  message?: string;
}> {
  return ownerApiClient<AvailabilityRule[]>("/owner/availability");
}

export async function updateAvailabilityRule(
  ruleId: number,
  updates: {
    start_time?: string;
    end_time?: string;
    is_active?: boolean;
  }
): Promise<{ success: boolean; message?: string }> {
  return ownerApiClient(`/owner/availability/${ruleId}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
}

export async function createManualBooking(
  bookingData: Omit<CreateBookingData, "venue_id">
): Promise<{ success: boolean; data?: Booking; message?: string }> {
  return ownerApiClient<Booking>("/owner/bookings", {
    method: "POST",
    body: JSON.stringify(bookingData),
  });
}

export async function getVenueSettings(): Promise<{
  success: boolean;
  data?: Venue;
  message?: string;
}> {
  return ownerApiClient<Venue>("/owner/venue/settings");
}

export async function updateVenueSettings(updates: {
  booking_advance_hours?: number;
  cancellation_hours?: number;
  image_url?: string | null;
}): Promise<{ success: boolean; message?: string }> {
  return ownerApiClient("/owner/venue/settings", {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; message?: string }> {
  return ownerApiClient("/owner/me/password", {
    method: "PATCH",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}
