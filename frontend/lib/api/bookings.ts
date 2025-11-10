import { apiClient } from "./client";
import { Booking, CreateBookingData } from "../types";
import { Eagle_Lake } from "next/font/google";

export async function createBooking(data: CreateBookingData)
{
    return apiClient<Booking>('/bookings', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function getBookingByToken(token: string)
{
    return apiClient<Booking>(`/bookings/manage/${token}`);
}

export async function cancelBooking(token: string, email: string)
{
    return apiClient<void>(`/bookings/manage/${token}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ customer_email: email }),
    });
}