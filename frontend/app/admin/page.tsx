"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getStats } from "@/lib/api/admin";
import type { AdminStats } from "@/lib/types";
import { Card, CardTitle } from "@/components/shared/card";
import { PageLoader } from "@/components/shared/loading-spinner";
import { ErrorMessage } from "@/components/shared/error-message";

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
    <>
      <h1 className="font-display text-2xl text-[var(--color-text)]">
        Übersicht
      </h1>
      <p className="mt-1 text-sm text-[var(--color-muted)]">
        Buchungen und Umsatz für Ihr Unternehmen.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardTitle className="text-base">Heute</CardTitle>
          <p className="mt-2 text-2xl font-medium text-[var(--color-text)]">
            {s.bookings.today} Buchungen
          </p>
          <p className="text-sm text-[var(--color-muted)]">
            {s.revenue.today.toFixed(2)} € Umsatz
          </p>
        </Card>
        <Card>
          <CardTitle className="text-base">Diese Woche</CardTitle>
          <p className="mt-2 text-2xl font-medium text-[var(--color-text)]">
            {s.bookings.thisWeek} Buchungen
          </p>
          <p className="text-sm text-[var(--color-muted)]">
            {s.revenue.thisWeek.toFixed(2)} € Umsatz
          </p>
        </Card>
        <Card>
          <CardTitle className="text-base">Dieser Monat</CardTitle>
          <p className="mt-2 text-2xl font-medium text-[var(--color-text)]">
            {s.bookings.thisMonth} Buchungen
          </p>
          <p className="text-sm text-[var(--color-muted)]">
            {s.revenue.thisMonth.toFixed(2)} € Umsatz
          </p>
        </Card>
        <Card>
          <CardTitle className="text-base">Status</CardTitle>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            Ausstehend: {s.bookings.pending} · Bestätigt: {s.bookings.confirmed}
            <br />
            Storniert: {s.bookings.cancelled} · Abgeschlossen:{" "}
            {s.bookings.completed}
          </p>
        </Card>
      </div>

      {s.bookings.pending > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
          <p className="font-medium">
            Sie haben {s.bookings.pending} ausstehende Buchungsanfrage
            {s.bookings.pending !== 1 ? "n" : ""}.
          </p>
          <Link
            href="/admin/bookings?status=pending"
            className="mt-2 inline-block text-sm font-medium underline"
          >
            Jetzt bestätigen →
          </Link>
        </div>
      )}

      {s.popularServices.length > 0 && (
        <div className="mt-8">
          <CardTitle>Beliebte Leistungen</CardTitle>
          <ul className="mt-3 space-y-2">
            {s.popularServices.slice(0, 5).map((ps) => (
              <li
                key={ps.service_id}
                className="flex justify-between text-sm text-[var(--color-muted)]"
              >
                <span>{ps.service_name}</span>
                <span>
                  {ps.booking_count} Buchungen · {ps.total_revenue.toFixed(2)} €
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
