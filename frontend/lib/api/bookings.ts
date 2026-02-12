import { apiClient } from "./client";
import { Booking, CreateBookingData } from "../types";

export async function createBooking(data: CreateBookingData) {
  return apiClient<Booking>('/bookings', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getBookingByToken(token: string) {
  return apiClient<Booking>(`/bookings/manage/${token}`);
}

export type UpdateBookingData = Partial<{
  booking_date: string;
  start_time: string;
  end_time: string;
  party_size: number;
  staff_member_id: number;
  special_requests: string;
}>;

export async function updateBooking(token: string, data: UpdateBookingData) {
  return apiClient<Booking>(`/bookings/manage/${token}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function cancelBooking(token: string, reason?: string) {
  return apiClient<Booking>(`/bookings/manage/${token}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ reason: reason ?? undefined }),
  });
}