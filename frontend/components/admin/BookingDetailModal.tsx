"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { updateBookingStatus } from "@/lib/api/dashboard";
import type { BookingWithDetails } from "@/lib/types";
import { getStatusLabel, getStatusColor } from "@/lib/utils/bookingStatus";
import { Button } from "@/components/shared/button";
import { Input } from "@/components/shared/input";

const STATUS_OPTIONS = [
  { value: "pending", label: "Ausstehend" },
  { value: "confirmed", label: "Bestätigt" },
  { value: "cancelled", label: "Storniert" },
  { value: "completed", label: "Abgeschlossen" },
  { value: "no_show", label: "Nicht erschienen" },
] as const;

type Props = {
  booking: BookingWithDetails | null;
  open: boolean;
  onClose: () => void;
  onUpdated?: () => void;
};

function formatDate(d: string) {
  return new Date(d + "T12:00:00").toLocaleDateString("de-DE", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function BookingDetailModal({
  booking,
  open,
  onClose,
  onUpdated,
}: Props) {
  const [status, setStatus] = useState<string>("");
  const [statusReason, setStatusReason] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (booking) {
      setStatus(booking.status);
      setStatusReason(booking.cancellation_reason ?? "");
    }
  }, [booking]);

  if (!open) return null;

  const isPast =
    booking &&
    new Date(`${booking.booking_date}T${booking.end_time}`).getTime() <= Date.now();
  const reasonRequired =
    booking &&
    status !== booking.status &&
    !(booking.status === "pending" && status === "confirmed");

  const handleSave = async () => {
    if (!booking || status === booking.status) {
      onClose();
      return;
    }
    if (reasonRequired && !statusReason.trim()) {
      toast.error("Bitte einen Grund angeben.");
      return;
    }
    setSaving(true);
    try {
      const res = await updateBookingStatus(
        booking.id,
        status,
        reasonRequired ? statusReason.trim() || undefined : undefined
      );
      if (res.success) {
        toast.success("Status aktualisiert.");
        onUpdated?.();
        onClose();
      } else {
        toast.error(res.message ?? "Aktualisierung fehlgeschlagen.");
      }
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmNow = async () => {
    if (!booking || booking.status !== "pending") return;
    setSaving(true);
    try {
      const res = await updateBookingStatus(booking.id, "confirmed");
      if (res.success) {
        toast.success("Buchung bestätigt.");
        onUpdated?.();
        onClose();
      } else {
        toast.error(res.message ?? "Aktualisierung fehlgeschlagen.");
      }
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleBackdrop}
    >
      <div
        className="w-full max-w-lg rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-lg)] max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-4">
          <h2 className="font-display text-xl font-semibold text-[var(--color-text)]">
            Buchungsdetails
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-[var(--color-muted)] hover:bg-[var(--color-page)] hover:text-[var(--color-text)]"
            aria-label="Schließen"
          >
            <span className="text-xl leading-none">×</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {!booking ? (
            <p className="text-[var(--color-muted)]">Keine Buchung ausgewählt.</p>
          ) : (
            <>
              <div>
                <p className="font-medium text-[var(--color-text)]">
                  {booking.customer_name}
                </p>
                <p className="text-sm text-[var(--color-muted)]">
                  {booking.customer_email}
                  {booking.customer_phone && ` · ${booking.customer_phone}`}
                </p>
              </div>

              <div className="text-sm">
                <p className="text-[var(--color-text)]">
                  {booking.service_name}
                  {booking.staff_member_name && ` · ${booking.staff_member_name}`}
                </p>
                <p className="text-[var(--color-muted)]">
                  {formatDate(booking.booking_date)} · {booking.start_time}–
                  {booking.end_time}
                  {booking.party_size > 0 && ` · ${booking.party_size} Pers.`}
                </p>
                {booking.special_requests && (
                  <p className="mt-1 text-[var(--color-muted)]">
                    Anmerkung: {booking.special_requests}
                  </p>
                )}
                {booking.total_amount != null && Number(booking.total_amount) > 0 && (
                  <p className="mt-1 text-[var(--color-text)]">
                    Betrag: {Number(booking.total_amount).toFixed(2)} €
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                  Status
                </label>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                  <select
                    value={status}
                    onChange={(e) => {
                      const newStatus = e.target.value;
                      setStatus(newStatus);
                      setStatusReason(
                        newStatus === "cancelled"
                          ? (booking?.cancellation_reason ?? "")
                          : ""
                      );
                    }}
                    className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] sm:flex-1"
                  >
                    {STATUS_OPTIONS.map((o) => (
                      <option
                        key={o.value}
                        value={o.value}
                        disabled={
                          !isPast && (o.value === "completed" || o.value === "no_show")
                        }
                      >
                        {o.label}
                      </option>
                    ))}
                  </select>
                  {booking.status === "pending" && (
                    <Button
                      type="button"
                      onClick={handleConfirmNow}
                      disabled={saving}
                      isLoading={saving}
                      className="shrink-0"
                    >
                      Jetzt bestätigen
                    </Button>
                  )}
                </div>
              </div>

              {booking?.status === "cancelled" && status !== "cancelled" && (
                <p className="text-sm text-[var(--color-accent)] bg-[var(--color-accent)]/10 rounded-lg px-3 py-2">
                  Stornierung aufheben – die Buchung wird reaktiviert. Bitte Grund angeben (z. B. Kunde kommt doch).
                </p>
              )}

              {reasonRequired && (
                <div>
                  <Input
                    label={
                      status === "cancelled"
                        ? "Stornierungsgrund (erforderlich)"
                        : "Grund (erforderlich)"
                    }
                    value={statusReason}
                    onChange={(e) => setStatusReason(e.target.value)}
                    placeholder={
                      status === "cancelled"
                        ? "z. B. Kunde hat abgesagt"
                        : booking?.status === "cancelled"
                          ? "z. B. Kunde kommt doch"
                          : "z. B. Termin durchgeführt, Kunde nicht erschienen"
                    }
                  />
                </div>
              )}

              {booking.status !== status && (
                <p className="text-sm text-[var(--color-muted)]">
                  Aktuell:{" "}
                  <span className={getStatusColor(booking.status)}>
                    {getStatusLabel(booking.status)}
                  </span>
                  {" → "}
                  <span className={getStatusColor(status)}>
                    {getStatusLabel(status)}
                  </span>
                </p>
              )}

              <Link
                href={`/admin/bookings/${booking.id}`}
                onClick={onClose}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-accent)] hover:underline mt-2"
              >
                Verlauf anzeigen
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </Link>
            </>
          )}
        </div>

        <div className="flex gap-3 border-t border-[var(--color-border)] px-6 py-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={saving}
            className="flex-1"
          >
            Schließen
          </Button>
          {booking && (
            <Button
              onClick={handleSave}
              isLoading={saving}
              disabled={
                saving ||
                status === booking.status ||
                (reasonRequired && !statusReason.trim())
              }
              className="flex-1"
            >
              Status speichern
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
