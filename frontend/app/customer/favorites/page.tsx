"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getFavorites } from "@/lib/api/favorites";
import type { CustomerFavorite } from "@/lib/api/favorites";
import { getVenueTypeLabel } from "@/lib/utils/venueType";

export default function CustomerFavoritesPage() {
  const [favorites, setFavorites] = useState<CustomerFavorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFavorites()
      .then((res) => {
        if (res.success && res.data) setFavorites(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <h1 className="font-display text-2xl font-semibold text-[var(--color-text)] sm:text-3xl">
        Favoriten
      </h1>
      <p className="mt-1 text-[var(--color-muted)]">
        Ihre gespeicherten Orte.
      </p>

      {loading ? (
        <div className="mt-8 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-[var(--color-border)]/50" />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="mt-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center">
          <p className="text-[var(--color-muted)]">Noch keine Favoriten gespeichert.</p>
          <Link
            href="/venues"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]"
          >
            Orte entdecken
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((fav) => (
            <li key={fav.id}>
              <Link
                href={`/venues/${fav.venue_id}`}
                className="block overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)] transition-colors hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-muted)]/20"
              >
                {fav.venue?.image_url && (
                  <div className="aspect-video w-full overflow-hidden bg-[var(--color-page)]">
                    <img
                      src={fav.venue.image_url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <span className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                    {fav.venue && getVenueTypeLabel(fav.venue.type)}
                  </span>
                  <h2 className="mt-1 font-semibold text-[var(--color-text)]">
                    {fav.venue?.name ?? `Venue #${fav.venue_id}`}
                  </h2>
                  {(fav.venue?.address || fav.venue?.city) && (
                    <p className="mt-1 text-sm text-[var(--color-muted)]">
                      {[fav.venue?.address, fav.venue?.postal_code, fav.venue?.city]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  )}
                  <span className="mt-3 block text-sm font-medium text-[var(--color-accent)]">
                    Buchen →
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
