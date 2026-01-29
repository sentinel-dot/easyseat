import { apiClient } from './client';
import { DayAvailability } from '@/lib/types';

/**
 * Lädt verfügbare Zeitslots für einen Tag.
 * Backend: GET /availability/slots?venueId=&serviceId=&date=
 */
export async function getAvailableSlots(
  venueId: number,
  serviceId: number,
  date: string,
  staffMemberId?: number
): Promise<DayAvailability> {
  const params = new URLSearchParams({
    venueId: venueId.toString(),
    serviceId: serviceId.toString(),
    date,
  });
  if (staffMemberId != null) {
    params.append('staffMemberId', staffMemberId.toString());
  }
  const result = await apiClient<DayAvailability>(
    `/availability/slots?${params.toString()}`
  );
  if (!result.success || result.data == null) {
    throw new Error(result.message ?? 'Zeitslots konnten nicht geladen werden');
  }
  return result.data;
}
