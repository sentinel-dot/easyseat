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

export async function cancelBooking(token: string, reason?: string) {
  return apiClient<Booking>(`/bookings/manage/${token}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ reason: reason ?? undefined }),
  });
}