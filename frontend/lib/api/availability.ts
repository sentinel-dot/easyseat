import { apiClient } from './client';
import { DayAvailability } from '@/lib/types';

/**
 * Lädt verfügbare Zeitslots für einen Tag.
 * Backend: GET /availability/slots?venueId=&serviceId=&date=&partySize=&timeWindowStart=&timeWindowEnd=
 * partySize: bei Restaurants nur Slots mit remaining_capacity >= partySize.
 * timeWindowStart/End: optional (HH:MM), z.B. 18:00–20:00 für Suche "ca. 19:00".
 */
export async function getAvailableSlots(
  venueId: number,
  serviceId: number,
  date: string,
  options?: { staffMemberId?: number; partySize?: number; timeWindowStart?: string; timeWindowEnd?: string; excludeBookingId?: number }
): Promise<DayAvailability> {
  const params = new URLSearchParams({
    venueId: venueId.toString(),
    serviceId: serviceId.toString(),
    date,
  });
  if (options?.staffMemberId != null) {
    params.append('staffMemberId', options.staffMemberId.toString());
  }
  if (options?.partySize != null && options.partySize >= 1) {
    params.append('partySize', options.partySize.toString());
  }
  if (options?.timeWindowStart) params.append('timeWindowStart', options.timeWindowStart);
  if (options?.timeWindowEnd) params.append('timeWindowEnd', options.timeWindowEnd);
  if (options?.excludeBookingId != null) {
    params.append('excludeBookingId', options.excludeBookingId.toString());
  }
  const result = await apiClient<DayAvailability>(
    `/availability/slots?${params.toString()}`
  );
  if (!result.success || result.data == null) {
    throw new Error(result.message ?? 'Zeitslots konnten nicht geladen werden');
  }
  return result.data;
}
