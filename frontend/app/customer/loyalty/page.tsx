"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getLoyaltyStats, getLoyaltyTransactions } from "@/lib/api/loyalty";
import type { LoyaltyStats, LoyaltyTransaction } from "@/lib/api/loyalty";

const typeLabels: Record<string, string> = {
  earned: "Buchung",
  bonus: "Bonus",
  redeemed: "Eingelöst",
  expired: "Abgelaufen",
};

export default function CustomerLoyaltyPage() {
  const [stats, setStats] = useState<LoyaltyStats | null>(null);
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getLoyaltyStats(), getLoyaltyTransactions(30)])
      .then(([statsRes, txRes]) => {
        if (statsRes.success && statsRes.data) setStats(statsRes.data);
        if (txRes.success && txRes.data) setTransactions(txRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <h1 className="font-display text-2xl font-semibold text-[var(--color-text)] sm:text-3xl">
        Treuepunkte
      </h1>
      <p className="mt-1 text-[var(--color-muted)]">
        Sammeln Sie Punkte bei jeder abgeschlossenen Buchung und bei Bewertungen.
      </p>

      {loading ? (
        <div className="mt-8 h-40 animate-pulse rounded-xl bg-[var(--color-border)]/50" />
      ) : stats ? (
        <>
          <div className="mt-8 rounded-xl border-2 border-[var(--color-accent)] bg-[var(--color-accent-muted)]/30 p-6 text-center">
            <p className="text-sm font-medium text-[var(--color-muted)]">Aktueller Kontostand</p>
            <p className="mt-2 text-4xl font-bold text-[var(--color-accent)]">{stats.totalPoints}</p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">Punkte</p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              <p className="text-sm text-[var(--color-muted)]">Gesamt verdient</p>
              <p className="mt-1 text-xl font-semibold text-[var(--color-text)]">{stats.totalEarned}</p>
            </div>
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              <p className="text-sm text-[var(--color-muted)]">Eingelöst</p>
              <p className="mt-1 text-xl font-semibold text-[var(--color-text)]">{stats.totalRedeemed}</p>
            </div>
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              <p className="text-sm text-[var(--color-muted)]">Abgeschlossene Buchungen</p>
              <p className="mt-1 text-xl font-semibold text-[var(--color-text)]">{stats.completedBookings}</p>
            </div>
          </div>

          <p className="mt-8 text-sm text-[var(--color-muted)]">
            Sie erhalten Punkte für jede abgeschlossene Buchung und zusätzliche Punkte für Bewertungen.
            Einlösoptionen werden in Kürze verfügbar sein.
          </p>
        </>
      ) : null}

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-[var(--color-text)]">Letzte Transaktionen</h2>
        {loading ? (
          <div className="mt-4 space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-[var(--color-border)]/50" />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--color-muted)]">Noch keine Transaktionen.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {transactions.map((tx) => (
              <li
                key={tx.id}
                className="flex items-center justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm"
              >
                <div>
                  <span className="font-medium text-[var(--color-text)]">
                    {typeLabels[tx.type] ?? tx.type}
                  </span>
                  {tx.description && (
                    <p className="text-xs text-[var(--color-muted)]">{tx.description}</p>
                  )}
                </div>
                <span
                  className={`font-semibold ${
                    tx.points > 0 ? "text-[var(--color-success)]" : "text-[var(--color-muted)]"
                  }`}
                >
                  {tx.points > 0 ? "+" : ""}{tx.points}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-10">
        <Link
          href="/venues"
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]"
        >
          Weitere Buchungen – mehr Punkte
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
