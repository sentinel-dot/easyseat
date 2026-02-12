import { apiClient } from "./client";
import { Venue, VenueWithStaff } from "../types";

export async function getVenues(params?: {
  type?: Venue["type"];
  date?: string;
  party_size?: number;
  time?: string;
}) {
  if (!params || Object.keys(params).length === 0) {
    return apiClient<Venue[]>(`/venues`);
  }
  const search = new URLSearchParams();
  if (params.type) search.set("type", params.type);
  if (params.date) search.set("date", params.date);
  if (params.party_size != null && params.party_size >= 1) search.set("party_size", String(params.party_size));
  if (params.time) search.set("time", params.time);
  const q = search.toString();
  return apiClient<Venue[]>(`/venues${q ? `?${q}` : ""}`);
}

export async function getVenueById(id: number)
{
    return apiClient<VenueWithStaff>(`/venues/${id}`);
}