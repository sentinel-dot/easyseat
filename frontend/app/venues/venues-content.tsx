"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getVenues } from "@/lib/api/venues";
import type { Venue } from "@/lib/types";
import {
  VENUE_TYPES_ORDER,
  getVenueTypeLabel,
} from "@/lib/utils/venueType";
import { CardHover } from "@/components/shared/card";
import { ErrorMessage } from "@/components/shared/error-message";

export function VenuesContent() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Venue["type"] | "all">("all");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getVenues();
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
  }, []);

  if (loading) {
    return (
      <div className="mt-10 flex justify-center py-14">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-accent)]" />
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

  const filtered =
    filter === "all" ? venues : venues.filter((v) => v.type === filter);

  return (
    <div className="mt-10">
      <div className="mb-8 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
            filter === "all"
              ? "bg-[var(--color-accent)] text-white shadow-[var(--shadow-sm)]"
              : "border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-muted)]/30 hover:text-[var(--color-accent-strong)]"
          }`}
        >
          Alle
        </button>
        {VENUE_TYPES_ORDER.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setFilter(type)}
            className={`rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
              filter === type
                ? "bg-[var(--color-accent)] text-white shadow-[var(--shadow-sm)]"
                : "border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-muted)]/30 hover:text-[var(--color-accent-strong)]"
            }`}
          >
            {getVenueTypeLabel(type)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-16 text-center shadow-[var(--shadow-sm)]">
          <p className="text-[var(--color-muted)]">
            {filter === "all"
              ? "Noch keine Orte eingetragen."
              : `Keine Orte in der Kategorie „${getVenueTypeLabel(filter)}“.`}
          </p>
        </div>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((venue) => (
            <li key={venue.id}>
              <Link href={`/venues/${venue.id}`} className="block h-full">
                <CardHover className="h-full">
                  <span className="inline-block rounded-full bg-[var(--color-accent-muted)] px-2.5 py-0.5 text-xs font-semibold text-[var(--color-accent-strong)]">
                    {getVenueTypeLabel(venue.type)}
                  </span>
                  <h2 className="mt-3 font-display text-xl font-semibold text-[var(--color-text)]">
                    {venue.name}
                  </h2>
                  {venue.city && (
                    <p className="mt-1 text-sm text-[var(--color-muted)]">
                      {venue.city}
                      {venue.address && ` · ${venue.address}`}
                    </p>
                  )}
                  {venue.description && (
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--color-text-soft)]">
                      {venue.description}
                    </p>
                  )}
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-accent)]">
                    Jetzt buchen
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </CardHover>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
