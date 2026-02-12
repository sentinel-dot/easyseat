import { apiClient } from "./client";
import { Venue, VenueWithStaff } from "../types";

export type VenuesParams = {
  type?: Venue["type"];
  date?: string;
  party_size?: number;
  time?: string;
  location?: string;
  sort?: "name" | "distance";
};

export async function getVenues(params?: VenuesParams) {
  if (!params || Object.keys(params).length === 0) {
    return apiClient<Venue[]>(`/venues`);
  }
  const search = new URLSearchParams();
  if (params.type) search.set("type", params.type);
  if (params.date) search.set("date", params.date);
  if (params.party_size != null && params.party_size >= 1) search.set("party_size", String(params.party_size));
  if (params.time) search.set("time", params.time);
  if (params.location?.trim()) search.set("location", params.location.trim());
  if (params.sort) search.set("sort", params.sort);
  const q = search.toString();
  return apiClient<Venue[]>(`/venues${q ? `?${q}` : ""}`);
}

export type PublicStats = { venueCount: number; bookingCountThisMonth: number };

export async function getPublicStats() {
  return apiClient<PublicStats>(`/venues/stats`);
}

export async function getVenueById(id: number)
{
    return apiClient<VenueWithStaff>(`/venues/${id}`);
}