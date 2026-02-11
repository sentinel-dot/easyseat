import Link from "next/link";
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
  const dayNames = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
  const todayDay = new Date().getDay(); // 0 = Sun, 1 = Mon, ...

  return (
    <SiteLayout>
      {/* Breadcrumb */}
      <div className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
            <Link
              href="/venues"
              className="text-[var(--color-muted)] transition-colors hover:text-[var(--color-accent)]"
            >
              Orte
            </Link>
            <span className="text-[var(--color-border-strong)]" aria-hidden>/</span>
            <span className="font-medium text-[var(--color-text)]" aria-current="page">
              {venue.name}
            </span>
          </nav>
        </div>
      </div>

      {/* Hero: Name, Kategorie, Adresse */}
      <header className="border-b border-[var(--color-border)] bg-[var(--color-page)]">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
          <span className="inline-block rounded-full bg-[var(--color-accent-muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-accent-strong)]">
            {getVenueTypeLabel(venue.type)}
          </span>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-[var(--color-text)] sm:text-4xl">
            {venue.name}
          </h1>
          {(venue.address || venue.city) && (
            <p className="mt-3 flex items-center gap-2 text-[var(--color-muted)]">
              <svg className="h-5 w-5 shrink-0 text-[var(--color-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>
                {[venue.address, venue.postal_code, venue.city]
                  .filter(Boolean)
                  .join(", ")}
              </span>
            </p>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="grid gap-10 lg:grid-cols-3 lg:gap-12">
          {/* Hauptinhalt: Über uns, Öffnungszeiten */}
          <div className="space-y-10 lg:col-span-2">
            {venue.description && (
              <section aria-labelledby="about-heading">
                <h2 id="about-heading" className="font-display text-xl font-semibold text-[var(--color-text)]">
                  Über uns
                </h2>
                <p className="mt-3 leading-relaxed text-[var(--color-text-soft)]">
                  {venue.description}
                </p>
              </section>
            )}

            {venue.opening_hours && venue.opening_hours.length > 0 && (
              <section aria-labelledby="hours-heading">
                <h2 id="hours-heading" className="font-display text-xl font-semibold text-[var(--color-text)]">
                  Öffnungszeiten
                </h2>
                <div className="mt-4 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)]">
                  <ul className="divide-y divide-[var(--color-border)]">
                    {[1, 2, 3, 4, 5, 6, 0].map((d) => {
                      const isToday = d === todayDay;
                      return (
                        <li
                          key={d}
                          className={`flex items-center justify-between px-4 py-3.5 text-sm ${isToday ? "bg-[var(--color-accent-muted)]/30 font-medium text-[var(--color-text)]" : "text-[var(--color-muted)]"}`}
                        >
                          <span className="flex items-center gap-2">
                            <span className="w-24 text-[var(--color-text-soft)]">
                              {dayNames[d]}
                            </span>
                            {isToday && (
                              <span className="rounded bg-[var(--color-accent)] px-1.5 py-0.5 text-xs font-medium text-white">
                                Heute
                              </span>
                            )}
                          </span>
                          <span className={isToday ? "text-[var(--color-accent-strong)]" : ""}>
                            {openingByDay[d]?.join(", ") ?? "Geschlossen"}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </section>
            )}
          </div>

          {/* Buchungs-Widget: sticky, klarer Kasten */}
          <div className="lg:col-span-1">
            <aside
              className="sticky top-24 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-md)]"
              aria-label="Termin buchen"
            >
              <div className="border-b border-[var(--color-border)] px-5 py-4">
                <h2 className="font-display text-lg font-semibold text-[var(--color-text)]">
                  Termin buchen
                </h2>
                <p className="mt-0.5 text-sm text-[var(--color-muted)]">
                  Leistung wählen, Datum & Uhrzeit festlegen – in wenigen Schritten.
                </p>
              </div>
              <div className="p-5">
                <BookingWidget venue={venue} />
              </div>
            </aside>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
