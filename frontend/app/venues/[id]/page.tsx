import { notFound } from "next/navigation";
import { getVenueById } from "@/lib/api/venues";
import { getVenueTypeLabel } from "@/lib/utils/venueType";
import { SiteLayout } from "@/components/layout/site-layout";
import { BookingWidget } from "./booking-widget";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const res = await getVenueById(Number(id));
  if (!res.success || !res.data) return { title: "Ort – easyseat" };
  return {
    title: `${res.data.name} – easyseat`,
    description: res.data.description ?? `Jetzt bei ${res.data.name} buchen.`,
  };
}

export default async function VenuePage({ params }: Props) {
  const { id } = await params;
  const venueId = Number(id);
  if (Number.isNaN(venueId)) notFound();

  const res = await getVenueById(venueId);
  if (!res.success || !res.data) notFound();
  const venue = res.data;

  if (venue.is_active === false) notFound();

  const openingByDay = (venue.opening_hours ?? []).reduce(
    (acc, slot) => {
      const key = slot.day_of_week;
      if (!acc[key]) acc[key] = [];
      acc[key].push(`${slot.start_time}–${slot.end_time}`);
      return acc;
    },
    {} as Record<number, string[]>
  );
  const dayNames = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <span className="text-sm font-medium text-[var(--color-accent)]">
              {getVenueTypeLabel(venue.type)}
            </span>
            <h1 className="mt-1 font-display text-3xl text-[var(--color-text)]">
              {venue.name}
            </h1>
            {(venue.address || venue.city) && (
              <p className="mt-2 text-[var(--color-muted)]">
                {[venue.address, venue.postal_code, venue.city]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            )}
            {venue.description && (
              <p className="mt-4 text-[var(--color-text)]">{venue.description}</p>
            )}

            {venue.opening_hours && venue.opening_hours.length > 0 && (
              <div className="mt-6">
                <h2 className="font-display text-lg text-[var(--color-text)]">
                  Öffnungszeiten
                </h2>
                <ul className="mt-2 space-y-1 text-sm text-[var(--color-muted)]">
                  {[1, 2, 3, 4, 5, 6, 0].map((d) => (
                    <li key={d} className="flex gap-3">
                      <span className="w-8">{dayNames[d]}</span>
                      <span>
                        {openingByDay[d]?.join(", ") ?? "Geschlossen"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
              <h2 className="font-display text-xl text-[var(--color-text)]">
                Jetzt buchen
              </h2>
              <BookingWidget venue={venue} />
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
