"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getStats } from "@/lib/api/dashboard";
import type { AdminStats } from "@/lib/types";
import { Card, CardTitle } from "@/components/shared/card";
import { PageLoader } from "@/components/shared/loading-spinner";
import { ErrorMessage } from "@/components/shared/error-message";

export default function AdminStatsPage() {
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
      <ErrorMessage message={error} onRetry={() => window.location.reload()} />
    );
  }
  if (!stats) return null;

  const s = stats;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[var(--color-text)]">
            Statistik
          </h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Detaillierte Auswertungen zu Buchungen und Umsatz.
          </p>
        </div>
        <Link href="/admin">
          <span className="text-sm font-medium text-[var(--color-accent)] hover:underline">
            ← Zur Übersicht
          </span>
        </Link>
      </div>

      {/* Buchungsstatus */}
      <Card>
        <CardTitle className="text-lg">Buchungsstatus (Gesamt)</CardTitle>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-page)] p-4">
            <p className="text-sm text-[var(--color-muted)]">Ausstehend</p>
            <p className="text-2xl font-semibold text-[var(--color-text)]">{s.bookings.pending}</p>
          </div>
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-page)] p-4">
            <p className="text-sm text-[var(--color-muted)]">Bestätigt</p>
            <p className="text-2xl font-semibold text-[var(--color-text)]">{s.bookings.confirmed}</p>
          </div>
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-page)] p-4">
            <p className="text-sm text-[var(--color-muted)]">Abgeschlossen</p>
            <p className="text-2xl font-semibold text-[var(--color-text)]">{s.bookings.completed}</p>
          </div>
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-page)] p-4">
            <p className="text-sm text-[var(--color-muted)]">Storniert</p>
            <p className="text-2xl font-semibold text-[var(--color-text)]">{s.bookings.cancelled}</p>
          </div>
        </div>
      </Card>

      {/* Umsatz */}
      <Card>
        <CardTitle className="text-lg">Umsatz (abgeschlossene Buchungen)</CardTitle>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-page)] p-4">
            <p className="text-sm text-[var(--color-muted)]">Heute</p>
            <p className="text-2xl font-semibold text-[var(--color-text)]">{s.revenue.today.toFixed(2)} €</p>
          </div>
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-page)] p-4">
            <p className="text-sm text-[var(--color-muted)]">Diese Woche</p>
            <p className="text-2xl font-semibold text-[var(--color-text)]">{s.revenue.thisWeek.toFixed(2)} €</p>
          </div>
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-page)] p-4">
            <p className="text-sm text-[var(--color-muted)]">Dieser Monat</p>
            <p className="text-2xl font-semibold text-[var(--color-text)]">{s.revenue.thisMonth.toFixed(2)} €</p>
          </div>
          <div className="rounded-lg border border-[var(--color-accent)]/30 bg-[var(--color-accent-muted)]/50 p-4">
            <p className="text-sm text-[var(--color-accent-strong)]">Gesamt</p>
            <p className="text-2xl font-bold text-[var(--color-accent-strong)]">{s.revenue.total.toFixed(2)} €</p>
          </div>
        </div>
      </Card>

      {/* Beliebte Leistungen */}
      {s.popularServices.length > 0 && (
        <Card>
          <CardTitle className="text-lg">Beliebte Leistungen (abgeschlossene Buchungen)</CardTitle>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-[var(--color-muted)]">
                  <th className="pb-2 pr-4 font-medium">Leistung</th>
                  <th className="pb-2 pr-4 font-medium text-right">Buchungen</th>
                  <th className="pb-2 font-medium text-right">Umsatz</th>
                </tr>
              </thead>
              <tbody>
                {s.popularServices.map((ps) => (
                  <tr key={ps.service_id} className="border-b border-[var(--color-border)]/50">
                    <td className="py-3 pr-4 font-medium text-[var(--color-text)]">{ps.service_name}</td>
                    <td className="py-3 pr-4 text-right text-[var(--color-muted)]">{ps.booking_count}</td>
                    <td className="py-3 text-right font-medium text-[var(--color-text)]">
                      {ps.total_revenue.toFixed(2)} €
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Beliebte Uhrzeiten */}
      {s.popularTimeSlots.length > 0 && (
        <Card>
          <CardTitle className="text-lg">Beliebteste Uhrzeiten (Stunde)</CardTitle>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Nach Anzahl abgeschlossener Buchungen.
          </p>
          <div className="mt-4 flex flex-wrap gap-4">
            {s.popularTimeSlots.map((slot) => (
              <div
                key={slot.hour}
                className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-page)] px-4 py-2"
              >
                <span className="font-medium text-[var(--color-text)]">
                  {String(slot.hour).padStart(2, "0")}:00
                </span>
                <span className="text-sm text-[var(--color-muted)]">
                  {slot.booking_count} Buchungen
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
