"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getStats } from "@/lib/api/dashboard";
import type { AdminStats } from "@/lib/types";
import { Card, CardTitle } from "@/components/shared/card";
import { PageLoader } from "@/components/shared/loading-spinner";
import { ErrorMessage } from "@/components/shared/error-message";
import { Button } from "@/components/shared/button";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getStats()
      .then((res) => {
        if (cancelled) return;
        if (res.success && res.data) setStats(res.data);
        else setError(res.message ?? "Fehler beim Laden.");
      })
      .catch((e) => {
        if (!cancelled) setError((e as Error).message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <PageLoader />;
  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={() => window.location.reload()}
      />
    );
  }
  if (!stats) return null;

  const s = stats;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-[var(--color-text)]">
          Übersicht
        </h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Buchungen, Umsatz und Status Ihres Unternehmens auf einen Blick.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link href="/admin/bookings?status=pending">
          <Button variant="primary" size="sm">
            Ausstehende Buchungen
            {s.bookings.pending > 0 && (
              <span className="ml-2 rounded-full bg-white/25 px-2 py-0.5 text-xs">
                {s.bookings.pending}
              </span>
            )}
          </Button>
        </Link>
        <Link href="/admin/bookings">
          <Button variant="outline" size="sm">
            Alle Buchungen
          </Button>
        </Link>
        <Link href="/admin/calendar">
          <Button variant="outline" size="sm">
            Kalender
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-l-4 border-l-[var(--color-accent)]">
          <CardTitle className="text-base font-medium text-[var(--color-muted)]">
            Heute
          </CardTitle>
          <p className="mt-1 text-2xl font-semibold text-[var(--color-text)]">
            {s.bookings.today} Buchungen
          </p>
          <p className="mt-0.5 text-sm text-[var(--color-muted)]">
            {s.revenue.today.toFixed(2)} € Umsatz
          </p>
        </Card>
        <Card>
          <CardTitle className="text-base font-medium text-[var(--color-muted)]">
            Diese Woche
          </CardTitle>
          <p className="mt-1 text-2xl font-semibold text-[var(--color-text)]">
            {s.bookings.thisWeek} Buchungen
          </p>
          <p className="mt-0.5 text-sm text-[var(--color-muted)]">
            {s.revenue.thisWeek.toFixed(2)} € Umsatz
          </p>
        </Card>
        <Card>
          <CardTitle className="text-base font-medium text-[var(--color-muted)]">
            Dieser Monat
          </CardTitle>
          <p className="mt-1 text-2xl font-semibold text-[var(--color-text)]">
            {s.bookings.thisMonth} Buchungen
          </p>
          <p className="mt-0.5 text-sm text-[var(--color-muted)]">
            {s.revenue.thisMonth.toFixed(2)} € Umsatz
          </p>
        </Card>
        <Card>
          <CardTitle className="text-base font-medium text-[var(--color-muted)]">
            Statusverteilung
          </CardTitle>
          <div className="mt-2 space-y-1 text-sm">
            <p className="flex justify-between">
              <span className="text-[var(--color-muted)]">Ausstehend</span>
              <span className="font-medium text-[var(--color-text)]">{s.bookings.pending}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-[var(--color-muted)]">Bestätigt</span>
              <span className="font-medium text-[var(--color-text)]">{s.bookings.confirmed}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-[var(--color-muted)]">Abgeschlossen</span>
              <span className="font-medium text-[var(--color-text)]">{s.bookings.completed}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-[var(--color-muted)]">Storniert</span>
              <span className="font-medium text-[var(--color-text)]">{s.bookings.cancelled}</span>
            </p>
          </div>
        </Card>
      </div>

      {/* Pending alert */}
      {s.bookings.pending > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
          <p className="font-medium">
            Sie haben {s.bookings.pending} ausstehende Buchungsanfrage{s.bookings.pending !== 1 ? "n" : ""}.
          </p>
          <Link
            href="/admin/bookings?status=pending"
            className="mt-2 inline-flex items-center text-sm font-medium underline"
          >
            Jetzt bestätigen oder ablehnen
            <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}

      {/* Popular services */}
      {s.popularServices.length > 0 && (
        <Card>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Beliebte Leistungen</CardTitle>
            <Link
              href="/admin/services"
              className="text-sm font-medium text-[var(--color-accent)] hover:underline"
            >
              Alle Leistungen
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {s.popularServices.slice(0, 5).map((ps) => (
              <li
                key={ps.service_id}
                className="flex items-center justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-page)] px-3 py-2"
              >
                <span className="font-medium text-[var(--color-text)]">{ps.service_name}</span>
                <span className="text-sm text-[var(--color-muted)]">
                  {ps.booking_count} Buchungen · {ps.total_revenue.toFixed(2)} €
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Total revenue highlight */}
      <Card className="bg-[var(--color-accent-muted)]/50 border-[var(--color-accent)]/20">
        <CardTitle className="text-base text-[var(--color-accent-strong)]">
          Gesamtumsatz (alle Zeiten)
        </CardTitle>
        <p className="mt-2 text-3xl font-bold text-[var(--color-accent-strong)]">
          {s.revenue.total.toFixed(2)} €
        </p>
      </Card>
    </div>
  );
}
