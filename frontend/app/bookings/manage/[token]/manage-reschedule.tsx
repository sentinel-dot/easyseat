"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateBooking } from "@/lib/api/bookings";
import { getAvailableSlots } from "@/lib/api/availability";
import { Button } from "@/components/shared/button";
import {
  today,
  addDays,
  formatDateForApi,
  formatDateDisplay,
  formatTimeDisplay,
} from "@/lib/utils/date";
import type { TimeSlot } from "@/lib/types";

type Props = {
  token: string;
  bookingId: number;
  venueId: number;
  serviceId: number;
  currentDate: string;
  currentStartTime: string;
  currentEndTime: string;
  partySize: number;
  status: string;
  bookingAdvanceDays?: number;
  venueName?: string;
  serviceName?: string;
};

export function ManageRescheduleModal({
  token,
  bookingId,
  venueId,
  serviceId,
  currentDate,
  currentStartTime,
  currentEndTime,
  partySize,
  status,
  bookingAdvanceDays = 30,
  venueName,
  serviceName,
}: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [date, setDate] = useState(currentDate);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const canReschedule = status === "pending" || status === "confirmed";
  const minDate = formatDateForApi(today());
  const maxDate = formatDateForApi(addDays(today(), bookingAdvanceDays));

  // Slots laden wenn Datum gewählt wird
  useEffect(() => {
    if (!isOpen || !date) return;
    loadSlotsForDate(date);
  }, [date, isOpen]);

  const loadSlotsForDate = async (dateValue: string) => {
    setLoadingSlots(true);
    setSlots([]);
    setSelectedSlot(null);
    try {
      const data = await getAvailableSlots(venueId, serviceId, dateValue, {
        partySize,
        excludeBookingId: bookingId, // Wichtig: eigene Buchung nicht als "blockiert" zählen
      });
      const available = (data.time_slots ?? []).filter((s) => s.available);
      setSlots(available);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedSlot) return;

    // Keine Änderung
    if (
      date === currentDate &&
      selectedSlot.start_time === currentStartTime &&
      selectedSlot.end_time === currentEndTime
    ) {
      toast.info("Keine Änderung vorgenommen.");
      setIsOpen(false);
      return;
    }

    setSubmitting(true);
    try {
      const res = await updateBooking(token, {
        booking_date: date,
        start_time: selectedSlot.start_time,
        end_time: selectedSlot.end_time,
      });
      if (res.success) {
        toast.success("Termin wurde verschoben.");
        router.refresh();
        setIsOpen(false);
      } else {
        toast.error(res.message ?? "Verschieben fehlgeschlagen.");
      }
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpen = () => {
    setDate(currentDate);
    setSlots([]);
    setSelectedSlot(null);
    setIsOpen(true);
  };

  const handleClose = () => {
    if (submitting) return;
    setIsOpen(false);
  };

  if (!canReschedule) return null;

  return (
    <>
      <Button variant="outline" onClick={handleOpen} className="mt-4">
        Termin verschieben
      </Button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <div
            className="w-full max-w-lg rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-lg)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="border-b border-[var(--color-border)] px-6 py-4">
              <h2 className="text-lg font-semibold text-[var(--color-text)]">
                Termin verschieben
              </h2>
              {venueName && serviceName && (
                <p className="mt-1 text-sm text-[var(--color-muted)]">
                  {serviceName} · {venueName}
                </p>
              )}
            </div>

            {/* Body */}
            <div className="space-y-4 px-6 py-5">
              {/* Aktueller Termin */}
              <div className="rounded-lg bg-[var(--color-page)] p-3 text-sm">
                <p className="font-medium text-[var(--color-muted)]">
                  Aktueller Termin
                </p>
                <p className="mt-1 text-[var(--color-text)]">
                  {formatDateDisplay(currentDate)} ·{" "}
                  {formatTimeDisplay(currentStartTime)}
                </p>
              </div>

              {/* Datum wählen */}
              <div>
                <label
                  htmlFor="reschedule-date"
                  className="mb-1.5 block text-sm font-medium text-[var(--color-text)]"
                >
                  Neues Datum wählen
                </label>
                <input
                  id="reschedule-date"
                  type="date"
                  min={minDate}
                  max={maxDate}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                />
              </div>

              {/* Slots */}
              {date && (
                <div>
                  <p className="mb-2 text-sm font-medium text-[var(--color-text)]">
                    Verfügbare Zeiten am {formatDateDisplay(date)}
                  </p>
                  {loadingSlots ? (
                    <div className="flex items-center justify-center rounded-lg border border-[var(--color-border)] py-8">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-accent)]" />
                    </div>
                  ) : slots.length === 0 ? (
                    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-page)] p-4 text-center text-sm text-[var(--color-muted)]">
                      Keine freien Zeiten an diesem Tag.
                    </div>
                  ) : (
                    <div className="grid max-h-64 grid-cols-3 gap-2 overflow-y-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-page)] p-3 sm:grid-cols-4">
                      {slots.map((slot) => {
                        const isSelected =
                          selectedSlot?.start_time === slot.start_time;
                        return (
                          <button
                            key={slot.start_time}
                            type="button"
                            onClick={() => setSelectedSlot(slot)}
                            className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                              isSelected
                                ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                                : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-muted)]"
                            }`}
                          >
                            {formatTimeDisplay(slot.start_time)}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 border-t border-[var(--color-border)] px-6 py-4">
              <Button
                variant="ghost"
                onClick={handleClose}
                disabled={submitting}
                className="flex-1"
              >
                Abbrechen
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!selectedSlot || submitting}
                isLoading={submitting}
                className="flex-1"
              >
                Verschieben
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
