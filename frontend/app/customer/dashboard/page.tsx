"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import { getBookings } from "@/lib/api/customers";
import { getFavorites } from "@/lib/api/favorites";
import { getLoyaltyBalance } from "@/lib/api/loyalty";
import { getStatusLabel, getStatusColor } from "@/lib/utils/bookingStatus";
import { EmailVerificationBanner } from "@/components/customer/EmailVerificationBanner";
import { VerifiedBadge } from "@/components/customer/VerifiedBadge";
import type { Booking } from "@/lib/api/customers";
import type { CustomerFavorite } from "@/lib/api/favorites";

export default function CustomerDashboardPage() {
  const { customer } = useCustomerAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [favorites, setFavorites] = useState<CustomerFavorite[]>([]);
  const [points, setPoints] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [bookingsRes, favRes, pointsRes] = await Promise.all([
          getBookings(true),
          getFavorites(),
          getLoyaltyBalance(),
        ]);
        if (bookingsRes.success && bookingsRes.data) setBookings(bookingsRes.data);
        if (favRes.success && favRes.data) setFavorites(favRes.data);
        if (pointsRes.success && pointsRes.data) setPoints(pointsRes.data.points);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const upcomingBookings = bookings.slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[var(--color-text)] sm:text-3xl">
            Hallo, {customer?.name ?? "Gast"}
          </h1>
          <p className="mt-1 text-[var(--color-muted)]">
            Hier ist Ihre Übersicht.
          </p>
        </div>
        {customer?.email_verified === true && <VerifiedBadge verified={true} />}
      </div>

      {/* Email Verification Banner */}
      {customer && !customer.email_verified && (
        <div className="mt-6">
          <EmailVerificationBanner email={customer.email} />
        </div>
      )}

      {loading ? (
        <div className="mt-8 h-32 animate-pulse rounded-xl bg-[var(--color-border)]/50" />
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/customer/bookings"
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-sm)] transition-colors hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-muted)]/20"
          >
            <span className="text-sm font-medium text-[var(--color-muted)]">Meine Buchungen</span>
            <p className="mt-1 text-2xl font-semibold text-[var(--color-text)]">{bookings.length}</p>
            <span className="mt-1 block text-sm text-[var(--color-accent)]">Ansehen →</span>
          </Link>
          <Link
            href="/customer/favorites"
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-sm)] transition-colors hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-muted)]/20"
          >
            <span className="text-sm font-medium text-[var(--color-muted)]">Favoriten</span>
            <p className="mt-1 text-2xl font-semibold text-[var(--color-text)]">{favorites.length}</p>
            <span className="mt-1 block text-sm text-[var(--color-accent)]">Ansehen →</span>
          </Link>
          <Link
            href="/customer/loyalty"
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-sm)] transition-colors hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-muted)]/20"
          >
            <span className="text-sm font-medium text-[var(--color-muted)]">Treuepunkte</span>
            <p className="mt-1 text-2xl font-semibold text-[var(--color-text)]">{points ?? 0}</p>
            <span className="mt-1 block text-sm text-[var(--color-accent)]">Ansehen →</span>
          </Link>
        </div>
      )}

      {!loading && upcomingBookings.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-[var(--color-text)]">Kommende Buchungen</h2>
          <ul className="mt-4 space-y-3">
            {upcomingBookings.map((b) => {
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
                          <p className="mt-0.5 text-sm text-[var(--color-muted)]">{b.service_name}</p>
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
          <Link
            href="/customer/bookings"
            className="mt-4 inline-block text-sm font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]"
          >
            Alle Buchungen anzeigen
          </Link>
        </section>
      )}

      <div className="mt-10">
        <Link
          href="/venues"
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-page)]"
        >
          <span>Neue Buchung</span>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
