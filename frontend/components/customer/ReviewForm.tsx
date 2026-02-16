"use client";

import { useState, useEffect } from "react";
import { useCustomerAuthOptional } from "@/contexts/CustomerAuthContext";
import { canReviewVenue, createReview } from "@/lib/api/reviews";
import { Button } from "@/components/shared/button";
import { toast } from "sonner";

type Props = {
  venueId: number;
  onSuccess?: () => void;
};

function StarInput({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <span className="inline-flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] rounded p-0.5 transition-transform hover:scale-110"
          aria-label={`${i} Stern${i > 1 ? "e" : ""}`}
        >
          <svg
            className="h-8 w-8 text-[var(--color-accent)]"
            fill={i <= value ? "currentColor" : "none"}
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
        </button>
      ))}
    </span>
  );
}

export function ReviewForm({ venueId, onSuccess }: Props) {
  const auth = useCustomerAuthOptional();
  const [canReview, setCanReview] = useState<{
    canReview: boolean;
    completedBookingId?: number;
    reason?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!auth?.isAuthenticated) {
      setLoading(false);
      setCanReview({ canReview: false });
      return;
    }
    canReviewVenue(venueId)
      .then((res) => {
        if (res.success && res.data) setCanReview(res.data);
      })
      .catch(() => setCanReview({ canReview: false }))
      .finally(() => setLoading(false));
  }, [auth?.isAuthenticated, venueId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canReview?.canReview || canReview.completedBookingId == null) return;
    setSubmitting(true);
    try {
      const res = await createReview({
        venue_id: venueId,
        booking_id: canReview.completedBookingId,
        rating,
        comment: comment.trim() || undefined,
      });
      if (res.success) {
        toast.success("Vielen Dank für Ihre Bewertung!");
        setSubmitted(true);
        onSuccess?.();
      } else {
        toast.error(res.message ?? "Bewertung konnte nicht gespeichert werden.");
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !auth?.isAuthenticated) return null;
  if (submitted) return null;
  if (!canReview?.canReview) {
    if (canReview?.reason) {
      return (
        <p className="mt-4 text-sm text-[var(--color-muted)]">
          {canReview.reason}
        </p>
      );
    }
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <h3 className="text-base font-semibold text-[var(--color-text)]">
        Bewertung schreiben
      </h3>
      <p className="mt-1 text-sm text-[var(--color-muted)]">
        Sie hatten hier einen abgeschlossenen Termin. Wie war Ihr Besuch?
      </p>
      <div className="mt-4">
        <span className="block text-sm font-medium text-[var(--color-text)] mb-2">Sterne</span>
        <StarInput value={rating} onChange={setRating} />
      </div>
      <div className="mt-4">
        <label htmlFor="review-comment" className="block text-sm font-medium text-[var(--color-text)] mb-2">
          Kommentar (optional)
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-page)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          placeholder="Ihre Erfahrung in wenigen Worten …"
        />
      </div>
      <Button type="submit" isLoading={submitting} disabled={submitting} className="mt-4">
        Bewertung absenden
      </Button>
    </form>
  );
}
