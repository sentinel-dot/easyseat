"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getBookings } from "@/lib/api/customers";
import { getStatusLabel, getStatusColor } from "@/lib/utils/bookingStatus";
import type { Booking } from "@/lib/api/customers";

export default function CustomerBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [onlyFuture, setOnlyFuture] = useState(false);

  useEffect(() => {
    setLoading(true);
    getBookings(onlyFuture)
      .then((res) => {
        if (res.success && res.data) setBookings(res.data);
      })
      .finally(() => setLoading(false));
  }, [onlyFuture]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <h1 className="font-display text-2xl font-semibold text-[var(--color-text)] sm:text-3xl">
        Meine Buchungen
      </h1>
      <p className="mt-1 text-[var(--color-muted)]">
        Alle Ihre Buchungen an einem Ort.
      </p>

      <div className="mt-6 flex gap-2">
        <button
          type="button"
          onClick={() => setOnlyFuture(false)}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            !onlyFuture
              ? "bg-[var(--color-accent)] text-white"
              : "bg-[var(--color-surface)] text-[var(--color-muted)] hover:bg-[var(--color-page)]"
          }`}
        >
          Alle
        </button>
        <button
          type="button"
          onClick={() => setOnlyFuture(true)}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            onlyFuture
              ? "bg-[var(--color-accent)] text-white"
              : "bg-[var(--color-surface)] text-[var(--color-muted)] hover:bg-[var(--color-page)]"
          }`}
        >
          Nur kommende
        </button>
      </div>

      {loading ? (
        <div className="mt-8 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-[var(--color-border)]/50" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="mt-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center">
          <p className="text-[var(--color-muted)]">Keine Buchungen gefunden.</p>
          <Link
            href="/venues"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]"
          >
            Jetzt buchen
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {bookings.map((b) => {
            const dateDisplay = b.booking_date
              ? new Date(b.booking_date + "T12:00:00").toLocaleDateString("de-DE", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "";
            const timeDisplay =
              b.start_time && b.end_time ? `${b.start_time} – ${b.end_time}` : "";
            return (
              <li key={b.id}>
                <Link
                  href={`/bookings/manage/${b.booking_token}`}
                  className="block rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-sm)] transition-colors hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-muted)]/30"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {b.venue_name && (
                        <p className="font-semibold text-[var(--color-text)]">{b.venue_name}</p>
                      )}
                      {b.service_name && (
                        <p className="mt-0.5 text-sm text-[var(--color-muted)]">
                          {b.service_name}
                          {b.staff_member_name && ` · ${b.staff_member_name}`}
                        </p>
                      )}
                      <p className="mt-2 text-sm text-[var(--color-text)]">
                        {dateDisplay} · {timeDisplay}
                      </p>
                    </div>
                    <span
                      className={`inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(b.status)}`}
                    >
                      {getStatusLabel(b.status)}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
