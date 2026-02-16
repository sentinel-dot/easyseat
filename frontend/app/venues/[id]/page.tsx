import Link from "next/link";
import { notFound } from "next/navigation";
import { getVenueById } from "@/lib/api/venues";
import { getVenueTypeLabel } from "@/lib/utils/venueType";
import { SiteLayout } from "@/components/layout/site-layout";
import { BookingWidget } from "./booking-widget";
import { FavoriteButton } from "@/components/customer/FavoriteButton";
import { ReviewsList } from "@/components/customer/ReviewsList";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const res = await getVenueById(Number(id));
  if (!res.success || !res.data) return { title: "Ort – easyseat" };
  return {
    title: `${res.data.name} – easyseat`,
    description: res.data.description ?? `Jetzt bei ${res.data.name} buchen.`,
  };
}

export default async function VenuePage({ params, searchParams }: Props) {
  const { id } = await params;
  const search = (await searchParams) ?? {};
  const initialDate = typeof search.date === "string" ? search.date : undefined;
  const initialTime = typeof search.time === "string" ? search.time : undefined;
  const initialPartySize =
    typeof search.party_size === "string" && /^\d+$/.test(search.party_size)
      ? Math.min(20, Math.max(1, Number(search.party_size)))
      : undefined;
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
        <div className="mx-auto max-w-6xl px-4 py-2.5 sm:px-6">
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

      {/* Hero-Bild (falls vorhanden) */}
      {venue.image_url && (
        <div className="relative h-48 w-full overflow-hidden bg-[var(--color-page)] sm:h-56 md:h-64">
          <img
            src={venue.image_url}
            alt=""
            className="h-full w-full object-cover object-center"
            sizes="(max-width: 768px) 100vw, 1152px"
          />
        </div>
      )}

      {/* Header: Name, Kategorie, Adresse */}
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                {getVenueTypeLabel(venue.type)}
              </span>
              <h1 className="mt-1 text-2xl font-bold text-[var(--color-text)] sm:text-3xl">
                {venue.name}
              </h1>
            </div>
            <FavoriteButton venueId={venue.id} className="shrink-0" />
          </div>
          {(venue.address || venue.city) && (
            <p className="mt-2 flex items-center gap-2 text-sm text-[var(--color-muted)]">
              <svg className="h-4 w-4 shrink-0 text-[var(--color-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
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
        <div className="grid gap-8 lg:grid-cols-3 lg:gap-10">
          <div className="space-y-8 lg:col-span-2">
            {venue.description && (
              <section aria-labelledby="about-heading">
                <h2 id="about-heading" className="text-lg font-semibold text-[var(--color-text)]">
                  Über uns
                </h2>
                <p className="mt-2 text-[var(--color-text-soft)] leading-relaxed">
                  {venue.description}
                </p>
              </section>
            )}

            {venue.opening_hours && venue.opening_hours.length > 0 && (
              <section aria-labelledby="hours-heading">
                <h2 id="hours-heading" className="text-lg font-semibold text-[var(--color-text)]">
                  Öffnungszeiten
                </h2>
                <div className="mt-3 overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
                  <ul className="divide-y divide-[var(--color-border)]">
                    {[1, 2, 3, 4, 5, 6, 0].map((d) => {
                      const isToday = d === todayDay;
                      return (
                        <li
                          key={d}
                          className={`flex items-center justify-between px-4 py-3 text-sm ${isToday ? "bg-[var(--color-accent-muted)]/40 font-medium text-[var(--color-text)]" : "text-[var(--color-muted)]"}`}
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

            <ReviewsList venueId={venue.id} />
          </div>

          <div className="lg:col-span-1">
            <aside
              className="sticky top-20 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)]"
              aria-label="Termin buchen"
            >
              <div className="border-b border-[var(--color-border)] px-4 py-3">
                <h2 className="text-lg font-semibold text-[var(--color-text)]">
                  {venue.type === "restaurant" ? "Tisch reservieren" : "Termin buchen"}
                </h2>
                <p className="mt-0.5 text-sm text-[var(--color-muted)]">
                  {venue.type === "restaurant"
                    ? "Datum, Uhrzeit und Gästeanzahl wählen."
                    : "Leistung, Datum und Uhrzeit wählen."}
                </p>
              </div>
              <div className="p-4">
                <BookingWidget
                venue={venue}
                initialDate={initialDate}
                initialTime={initialTime}
                initialPartySize={initialPartySize}
              />
              </div>
            </aside>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
