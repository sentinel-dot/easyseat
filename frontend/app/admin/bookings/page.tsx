"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { getBookings, updateBookingStatus } from "@/lib/api/admin";
import type { BookingWithDetails } from "@/lib/types";
import { getStatusLabel, getStatusColor } from "@/lib/utils/bookingStatus";
import { Button } from "@/components/shared/button";
import { Card } from "@/components/shared/card";
import { PageLoader } from "@/components/shared/loading-spinner";
import { ErrorMessage } from "@/components/shared/error-message";

const STATUS_OPTIONS = [
  { value: "", label: "Alle" },
  { value: "pending", label: "Ausstehend" },
  { value: "confirmed", label: "Bestätigt" },
  { value: "cancelled", label: "Storniert" },
  { value: "completed", label: "Abgeschlossen" },
  { value: "no_show", label: "Nicht erschienen" },
] as const;

export default function AdminBookingsPage() {
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status") ?? "";

  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState(statusParam);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const loadBookings = useCallback(() => {
    setLoading(true);
    setError(null);
    const params: { status?: string } = {};
    if (statusFilter) params.status = statusFilter;
    getBookings({ ...params, limit: 100 })
      .then((res) => {
        if (res.success && res.data) setBookings(res.data);
        else setError(res.message ?? "Fehler beim Laden.");
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const handleStatusChange = async (
    bookingId: number,
    newStatus: string,
    reason?: string
  ) => {
    setUpdatingId(bookingId);
    try {
      const res = await updateBookingStatus(bookingId, newStatus, reason);
      if (res.success) {
        toast.success("Status aktualisiert.");
        loadBookings();
      } else {
        toast.error(res.message ?? "Aktualisierung fehlgeschlagen.");
      }
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (d: string) =>
    new Date(d + "T12:00:00").toLocaleDateString("de-DE", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  const formatTime = (t: string) => t;

  if (error) {
    return (
      <ErrorMessage message={error} onRetry={() => loadBookings()} />
    );
  }

  return (
    <>
      <h1 className="font-display text-2xl text-[var(--color-text)]">
        Buchungen
      </h1>
      <p className="mt-1 text-sm text-[var(--color-muted)]">
        Buchungsanfragen bestätigen oder Status ändern.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-[var(--color-muted)]">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value || "all"} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {loading ? (
        <PageLoader />
      ) : bookings.length === 0 ? (
        <p className="mt-8 text-center text-[var(--color-muted)]">
          Keine Buchungen gefunden.
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {bookings.map((b) => (
            <li key={b.id}>
              <Card className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-medium text-[var(--color-text)]">
                    {b.customer_name}
                  </p>
                  <p className="text-sm text-[var(--color-muted)]">
                    {b.customer_email}
                    {b.customer_phone && ` · ${b.customer_phone}`}
                  </p>
                  <p className="mt-1 text-sm text-[var(--color-text)]">
                    {b.service_name}
                    {b.staff_member_name && ` · ${b.staff_member_name}`}
                  </p>
                  <p className="text-sm text-[var(--color-muted)]">
                    {formatDate(b.booking_date)} · {formatTime(b.start_time)}–
                    {formatTime(b.end_time)}
                    {b.party_size > 0 && ` · ${b.party_size} Pers.`}
                  </p>
                  <span
                    className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(b.status)}`}
                  >
                    {getStatusLabel(b.status)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {b.status === "pending" && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(b.id, "confirmed")}
                      disabled={updatingId === b.id}
                      isLoading={updatingId === b.id}
                    >
                      Bestätigen
                    </Button>
                  )}
                  {b.status === "pending" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(b.id, "cancelled")}
                      disabled={updatingId === b.id}
                    >
                      Ablehnen
                    </Button>
                  )}
                  {b.status === "confirmed" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(b.id, "completed")}
                      disabled={updatingId === b.id}
                    >
                      Abgeschlossen
                    </Button>
                  )}
                  {(b.status === "pending" || b.status === "confirmed") && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => handleStatusChange(b.id, "cancelled")}
                      disabled={updatingId === b.id}
                    >
                      Stornieren
                    </Button>
                  )}
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
