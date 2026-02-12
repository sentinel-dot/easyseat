"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAdminStats } from "@/lib/api/admin";
import type { GlobalStats } from "@/lib/api/admin";
import { Card, CardTitle } from "@/components/shared/card";
import { PageLoader } from "@/components/shared/loading-spinner";
import { ErrorMessage } from "@/components/shared/error-message";
import { Button } from "@/components/shared/button";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getAdminStats()
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-[var(--color-text)]">
          Admin – Systemübersicht
        </h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Venues, Admins und Buchungen systemweit verwalten.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/admin/venues">
          <Button variant="primary" size="sm">
            Venues verwalten
          </Button>
        </Link>
        <Link href="/admin/users">
          <Button variant="outline" size="sm">
            Benutzer verwalten
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-l-4 border-l-[var(--color-accent)]">
          <CardTitle className="text-base font-medium text-[var(--color-muted)]">
            Venues
          </CardTitle>
          <p className="mt-1 text-2xl font-semibold text-[var(--color-text)]">
            {stats.venues.active} / {stats.venues.total} aktiv
          </p>
        </Card>
        <Card>
          <CardTitle className="text-base font-medium text-[var(--color-muted)]">
            Admins
          </CardTitle>
          <p className="mt-1 text-2xl font-semibold text-[var(--color-text)]">
            {stats.admins.active} / {stats.admins.total} aktiv
          </p>
        </Card>
        <Card>
          <CardTitle className="text-base font-medium text-[var(--color-muted)]">
            Buchungen (gesamt)
          </CardTitle>
          <p className="mt-1 text-2xl font-semibold text-[var(--color-text)]">
            {stats.bookings.total}
          </p>
          <p className="mt-0.5 text-sm text-[var(--color-muted)]">
            Diesen Monat: {stats.bookings.thisMonth}
          </p>
        </Card>
        <Card>
          <CardTitle className="text-base font-medium text-[var(--color-muted)]">
            Status
          </CardTitle>
          <div className="mt-2 space-y-1 text-sm">
            <p className="flex justify-between">
              <span className="text-[var(--color-muted)]">Ausstehend</span>
              <span className="font-medium">{stats.bookings.pending}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-[var(--color-muted)]">Bestätigt</span>
              <span className="font-medium">{stats.bookings.confirmed}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-[var(--color-muted)]">Abgeschlossen</span>
              <span className="font-medium">{stats.bookings.completed}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-[var(--color-muted)]">Storniert</span>
              <span className="font-medium">{stats.bookings.cancelled}</span>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
