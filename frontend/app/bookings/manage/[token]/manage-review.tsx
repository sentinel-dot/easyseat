"use client";

import Link from "next/link";
import { useCustomerAuthOptional } from "@/contexts/CustomerAuthContext";
import { ReviewForm } from "@/components/customer/ReviewForm";

type Props = {
  venueId: number;
  venueName?: string;
  status: string;
};

export function ManageBookingReview({ venueId, venueName, status }: Props) {
  const auth = useCustomerAuthOptional();

  if (status !== "completed") return null;

  return (
    <div className="mt-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-sm)]">
      <h2 className="text-lg font-semibold text-[var(--color-text)]">
        Bewertung
      </h2>
      {auth?.isAuthenticated ? (
        <div className="mt-2">
          <ReviewForm venueId={venueId} venueName={venueName} onSuccess={() => {}} />
        </div>
      ) : (
        <>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Diese Buchung ist abgeschlossen. Melden Sie sich an, um eine
            Bewertung zu schreiben, oder besuchen Sie die Seite des Ortes.
          </p>
        <Link
          href={`/venues/${venueId}`}
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-accent)] transition-colors hover:text-[var(--color-accent-hover)]"
        >
          {venueName ?? "Ort"} besuchen und bewerten
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </Link>
        </>
      )}
    </div>
  );
}
