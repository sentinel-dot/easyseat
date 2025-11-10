import { apiClient } from "./client";
import { Venue, VenueWithStaff } from "../types";

export async function getVenues()
{
    return apiClient<Venue[]>('/venues');
}

export async function getVenueById(id: number)
{
    return apiClient<VenueWithStaff>(`/venues/${id}`);
}