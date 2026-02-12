"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getBookingAuditLog } from "@/lib/api/dashboard";
import type { BookingAuditLogEntry } from "@/lib/types";
import { getStatusLabel } from "@/lib/utils/bookingStatus";
import { Card, CardTitle } from "@/components/shared/card";
import { PageLoader } from "@/components/shared/loading-spinner";
import { ErrorMessage } from "@/components/shared/error-message";

function formatAuditTime(iso: string) {
  return new Date(iso).toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatAuditAction(entry: BookingAuditLogEntry): string {
  if (
    entry.action === "status_change" &&
    (entry.old_status || entry.new_status)
  ) {
    const from = entry.old_status ? getStatusLabel(entry.old_status) : "–";
    const to = entry.new_status ? getStatusLabel(entry.new_status) : "–";
    return `Status: ${from} → ${to}`;
  }
  if (entry.action === "cancel") return "Stornierung";
  if (entry.action === "update") return "Details geändert";
  return entry.action;
}

export default function BookingVerlaufPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";
  const idNum = parseInt(id, 10);
  const [auditLog, setAuditLog] = useState<BookingAuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAudit = useCallback(async () => {
    if (!id || Number.isNaN(idNum) || idNum < 1) {
      setError("Ungültige Buchungs-ID");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await getBookingAuditLog(idNum);
      if (res.success && res.data) {
        setAuditLog(res.data);
      } else {
        setError(res.message ?? "Verlauf nicht geladen");
        setAuditLog([]);
      }
    } catch (e) {
      setError((e as Error).message);
      setAuditLog([]);
    } finally {
      setLoading(false);
    }
  }, [id, idNum]);

  useEffect(() => {
    loadAudit();
  }, [loadAudit]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <PageLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <ErrorMessage
          message={error}
          onRetry={() => router.push("/admin/bookings")}
        />
        <Link
          href="/admin/bookings"
          className="text-sm font-medium text-[var(--color-accent)] hover:underline"
        >
          ← Zurück zur Buchungsliste
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <nav className="text-sm text-[var(--color-muted)]">
        <Link
          href="/admin/bookings"
          className="hover:text-[var(--color-accent)]"
        >
          Buchungen
        </Link>
        <span className="mx-2">/</span>
        <span className="text-[var(--color-text)]">
          Verlauf · Buchung #{id}
        </span>
      </nav>

      <Card className="p-6 md:p-8 w-full">
        <CardTitle className="text-lg mb-1">Verlauf</CardTitle>
        <p className="text-sm text-[var(--color-muted)] mb-6">
          Alle Änderungen an Buchung #{id} (Status, Stornierung, Details).
        </p>
        {auditLog.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)] py-6">
            Noch keine Einträge.
          </p>
        ) : (
          <ul className="space-y-0 w-full">
            {auditLog.map((entry, index) => (
              <li
                key={entry.id}
                className={`flex gap-6 md:gap-8 lg:gap-10 ${
                  index < auditLog.length - 1
                    ? "pb-6 mb-6 border-b border-[var(--color-border)]"
                    : ""
                }`}
              >
                <div className="flex flex-col items-center shrink-0">
                  <div className="h-3 w-3 rounded-full bg-[var(--color-accent-muted)]" />
                  {index < auditLog.length - 1 && (
                    <div className="w-px flex-1 min-h-[2.5rem] mt-1 bg-[var(--color-border)]" />
                  )}
                </div>
                <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-1 pt-0.5">
                  <div className="text-xs text-[var(--color-muted)] sm:col-span-2 lg:col-span-1">
                    {formatAuditTime(entry.created_at)}
                  </div>
                  <div className="font-medium text-[var(--color-text)] sm:col-span-2 lg:col-span-1">
                    {formatAuditAction(entry)}
                  </div>
                  {entry.actor_label && (
                    <div className="text-sm text-[var(--color-text-soft)] lg:col-span-1">
                      {entry.actor_label}
                    </div>
                  )}
                  {entry.reason && (
                    <div className="text-sm text-[var(--color-muted)] italic sm:col-span-2 lg:col-span-4">
                      „{entry.reason}"
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
