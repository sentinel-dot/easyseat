"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { getVenues } from "@/lib/api/venues";
import type { Venue } from "@/lib/types";
import {
  VENUE_TYPES_ORDER,
  getVenueTypeLabel,
} from "@/lib/utils/venueType";
import { ErrorMessage } from "@/components/shared/error-message";

const VALID_VENUE_TYPES: Venue["type"][] = ["restaurant", "hair_salon", "beauty_salon", "massage", "other"];

function typeFromParam(param: string | null): Venue["type"] | "all" {
  if (!param) return "all";
  return VALID_VENUE_TYPES.includes(param as Venue["type"]) ? (param as Venue["type"]) : "all";
}

export function VenuesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filter = useMemo(() => typeFromParam(searchParams.get("type")), [searchParams]);

  const setFilter = (newFilter: Venue["type"] | "all") => {
    const params = new URLSearchParams(searchParams.toString());
    if (newFilter === "all") params.delete("type");
    else params.set("type", newFilter);
    const q = params.toString();
    router.push(q ? `/venues?${q}` : "/venues", { scroll: false });
  };

  const queryString = [
    searchParams.get("date") && `date=${encodeURIComponent(searchParams.get("date")!)}`,
    searchParams.get("time") && `time=${encodeURIComponent(searchParams.get("time")!)}`,
    searchParams.get("party_size") && `party_size=${encodeURIComponent(searchParams.get("party_size")!)}`,
    searchParams.get("type") && `type=${encodeURIComponent(searchParams.get("type")!)}`,
  ]
    .filter(Boolean)
    .join("&");
  const venueQuery = queryString ? `?${queryString}` : "";

  const dateParam = searchParams.get("date");
  const timeParam = searchParams.get("time");
  const partySizeParam = searchParams.get("party_size");
  const partySizeNum =
    partySizeParam != null && partySizeParam !== "" && /^\d+$/.test(partySizeParam)
      ? Math.min(20, Math.max(1, parseInt(partySizeParam, 10)))
      : undefined;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const params: Parameters<typeof getVenues>[0] = {};
        if (filter !== "all") params.type = filter;
        if (dateParam) params.date = dateParam;
        if (timeParam) params.time = timeParam;
        if (partySizeNum != null) params.party_size = partySizeNum;
        const res = await getVenues(Object.keys(params).length > 0 ? params : undefined);
        if (!cancelled && res.success && res.data) {
          setVenues(Array.isArray(res.data) ? res.data : []);
        } else if (!res.success && res.message) {
          setError(res.message);
        }
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [filter, dateParam, timeParam, partySizeNum]);

  if (loading) {
    return (
      <div className="mt-10 flex justify-center py-14">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-accent)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-10">
        <ErrorMessage
          message={error}
          onRetry={() => {
            setError(null);
            setLoading(true);
            window.location.reload();
          }}
        />
      </div>
    );
  }

  return (
    <div className="mt-8">
      {/* Filter-Pills – wechseln aktualisiert URL und lädt gefilterte Liste vom Server */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
            filter === "all"
              ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
              : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:border-[var(--color-border-strong)]"
          }`}
        >
          Alle
        </button>
        {VENUE_TYPES_ORDER.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setFilter(type)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              filter === type
                ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:border-[var(--color-border-strong)]"
            }`}
          >
            {getVenueTypeLabel(type)}
          </button>
        ))}
      </div>

      {venues.length === 0 ? (
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] py-16 text-center">
          <p className="text-[var(--color-muted)]">
            {filter === "all"
              ? "Noch keine Orte eingetragen."
              : `Keine Orte in der Kategorie „${getVenueTypeLabel(filter)}“.`}
          </p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {venues.map((venue) => (
            <li key={venue.id} className="flex">
              <Link
                href={`/venues/${venue.id}${venueQuery}`}
                className="card-hover flex h-full w-full flex-col overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]"
              >
                {/* Venue-Bild oder Platzhalter */}
                {venue.image_url ? (
                  <div className="relative h-36 w-full shrink-0 overflow-hidden bg-[var(--color-page)]">
                    <img
                      src={venue.image_url}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                ) : (
                  <div className="h-36 shrink-0 bg-[var(--color-page)]" aria-hidden />
                )}
                <div className="flex min-h-0 flex-1 flex-col p-4">
                  <span className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                    {getVenueTypeLabel(venue.type)}
                  </span>
                  <h2 className="mt-1 text-lg font-semibold text-[var(--color-text)]">
                    {venue.name}
                  </h2>
                  {venue.city && (
                    <p className="mt-0.5 text-sm text-[var(--color-muted)]">
                      {venue.city}
                      {venue.address && ` · ${venue.address}`}
                    </p>
                  )}
                  {/* Feste Höhe für Beschreibung, damit alle Karten gleich hoch sind */}
                  <p className="mt-2 min-h-[2.5rem] text-sm text-[var(--color-text-soft)] line-clamp-2">
                    {venue.description ?? "\u00A0"}
                  </p>
                  <span className="mt-4 inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-[var(--color-accent)]">
                    {venue.type === "restaurant" ? "Tisch reservieren" : "Termin buchen"}
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
