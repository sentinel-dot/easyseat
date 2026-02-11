"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getVenues } from "@/lib/api/venues";
import type { Venue } from "@/lib/types";
import {
  VENUE_TYPES_ORDER,
  getVenueTypeLabel,
} from "@/lib/utils/venueType";
import { Card } from "@/components/shared/card";
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
      <div className="mt-8 flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-accent)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8">
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
    filter === "all"
      ? venues
      : venues.filter((v) => v.type === filter);

  return (
    <div className="mt-8">
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            filter === "all"
              ? "bg-[var(--color-accent)] text-white"
              : "bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] hover:border-[var(--color-accent)]"
          }`}
        >
          Alle
        </button>
        {VENUE_TYPES_ORDER.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setFilter(type)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              filter === type
                ? "bg-[var(--color-accent)] text-white"
                : "bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] hover:border-[var(--color-accent)]"
            }`}
          >
            {getVenueTypeLabel(type)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-[var(--color-muted)]">
          {filter === "all"
            ? "Noch keine Orte eingetragen."
            : `Keine Orte in der Kategorie „${getVenueTypeLabel(filter)}“.`}
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((venue) => (
            <li key={venue.id}>
              <Link href={`/venues/${venue.id}`} className="block h-full">
                <Card className="h-full transition-shadow hover:shadow-md">
                  <span className="text-xs font-medium text-[var(--color-accent)]">
                    {getVenueTypeLabel(venue.type)}
                  </span>
                  <h2 className="mt-1 font-display text-lg text-[var(--color-text)]">
                    {venue.name}
                  </h2>
                  {venue.city && (
                    <p className="mt-1 text-sm text-[var(--color-muted)]">
                      {venue.city}
                      {venue.address && ` · ${venue.address}`}
                    </p>
                  )}
                  {venue.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-[var(--color-muted)]">
                      {venue.description}
                    </p>
                  )}
                  <span className="mt-3 inline-block text-sm font-medium text-[var(--color-accent)]">
                    Jetzt buchen →
                  </span>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
