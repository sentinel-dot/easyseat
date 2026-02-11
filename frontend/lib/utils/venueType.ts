import type { Venue } from "@/lib/types";

export const VENUE_TYPE_LABELS: Record<Venue["type"], string> = {
  restaurant: "Restaurant",
  hair_salon: "Friseur",
  beauty_salon: "Kosmetik",
  massage: "Massage",
  other: "Sonstiges",
};

export const VENUE_TYPES_ORDER: Venue["type"][] = [
  "restaurant",
  "hair_salon",
  "beauty_salon",
  "massage",
  "other",
];

export function getVenueTypeLabel(type: Venue["type"]): string {
  return VENUE_TYPE_LABELS[type] ?? type;
}
