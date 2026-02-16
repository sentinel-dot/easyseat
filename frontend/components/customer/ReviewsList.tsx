"use client";

import { useEffect, useState, useCallback } from "react";
import { getVenueReviews, getVenueAverageRating } from "@/lib/api/reviews";
import { ReviewForm } from "./ReviewForm";
import type { Review } from "@/lib/api/reviews";

type Props = {
  venueId: number;
};

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5 text-[var(--color-accent)]" aria-label={`${rating} von 5 Sternen`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className="h-4 w-4"
          fill={i <= rating ? "currentColor" : "none"}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      ))}
    </span>
  );
}

export function ReviewsList({ venueId }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [average, setAverage] = useState<{ average: number; count: number } | null>(null);
  const [loading, setLoading] = useState(true);

  const loadReviews = useCallback(() => {
    setLoading(true);
    Promise.all([getVenueReviews(venueId), getVenueAverageRating(venueId)])
      .then(([reviewsRes, ratingRes]) => {
        if (reviewsRes.success && reviewsRes.data) setReviews(reviewsRes.data);
        if (ratingRes.success && ratingRes.data) setAverage(ratingRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [venueId]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  if (loading) {
    return (
      <section aria-labelledby="reviews-heading" className="mt-8">
        <h2 id="reviews-heading" className="text-lg font-semibold text-[var(--color-text)]">
          Bewertungen
        </h2>
        <div className="mt-4 h-24 animate-pulse rounded-xl bg-[var(--color-border)]/50" />
      </section>
    );
  }

  if (reviews.length === 0 && (!average || average.count === 0)) {
    return (
      <section aria-labelledby="reviews-heading" className="mt-8">
        <h2 id="reviews-heading" className="text-lg font-semibold text-[var(--color-text)]">
          Bewertungen
        </h2>
        <p className="mt-4 text-sm text-[var(--color-muted)]">Noch keine Bewertungen.</p>
        <ReviewForm venueId={venueId} onSuccess={loadReviews} />
      </section>
    );
  }

  return (
    <section aria-labelledby="reviews-heading" className="mt-8">
      <h2 id="reviews-heading" className="text-lg font-semibold text-[var(--color-text)]">
        Bewertungen
      </h2>
      {average && average.count > 0 && (
        <div className="mt-4 flex items-center gap-3">
          <StarRating rating={Math.round(average.average)} />
          <span className="text-sm text-[var(--color-muted)]">
            {average.average.toFixed(1)} ({average.count} {average.count === 1 ? "Bewertung" : "Bewertungen"})
          </span>
        </div>
      )}
      <ul className="mt-4 space-y-4">
        {reviews.slice(0, 10).map((r) => (
          <li
            key={r.id}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <StarRating rating={r.rating} />
              {(r as Review & { customer_name?: string }).customer_name && (
                <span className="text-sm text-[var(--color-muted)]">
                  {(r as Review & { customer_name?: string }).customer_name}
                </span>
              )}
            </div>
            {r.comment && (
              <p className="mt-2 text-sm text-[var(--color-text-soft)] leading-relaxed">{r.comment}</p>
            )}
            <p className="mt-2 text-xs text-[var(--color-muted)]">
              {new Date(r.created_at).toLocaleDateString("de-DE", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </li>
        ))}
      </ul>
      {reviews.length > 10 && (
        <p className="mt-4 text-sm text-[var(--color-muted)]">
          und {reviews.length - 10} weitere Bewertungen
        </p>
      )}
      <ReviewForm venueId={venueId} onSuccess={loadReviews} />
    </section>
  );
}
