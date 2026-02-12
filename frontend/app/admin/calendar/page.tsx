"use client";

import { useEffect, useState, useCallback } from "react";
import { getBookings } from "@/lib/api/dashboard";
import type { BookingWithDetails } from "@/lib/types";
import { getStatusColorBlock } from "@/lib/utils/bookingStatus";
import { Card } from "@/components/shared/card";
import { Button } from "@/components/shared/button";
import { PageLoader } from "@/components/shared/loading-spinner";
import { ErrorMessage } from "@/components/shared/error-message";
import { BookingDetailModal } from "@/components/admin/BookingDetailModal";

function getMonthYear(d: Date) {
  return { year: d.getFullYear(), month: d.getMonth() };
}

function getMonthStart(year: number, month: number) {
  return new Date(year, month, 1);
}

function getMonthEnd(year: number, month: number) {
  return new Date(year, month + 1, 0);
}

function toYMD(d: Date) {
  return d.toISOString().slice(0, 10);
}

const WEEKDAY_LABELS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

export default function AdminCalendarPage() {
  const [viewDate, setViewDate] = useState(() => new Date());
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailBooking, setDetailBooking] = useState<BookingWithDetails | null>(null);

  const { year, month } = getMonthYear(viewDate);
  const start = getMonthStart(year, month);
  const end = getMonthEnd(year, month);
  const startStr = toYMD(start);
  const endStr = toYMD(end);

  const loadBookings = useCallback(() => {
    setLoading(true);
    setError(null);
    getBookings({ startDate: startStr, endDate: endStr, limit: 500 })
      .then((res) => {
        if (res.success && res.data) setBookings(res.data);
        else setError(res.message ?? "Fehler beim Laden.");
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, [startStr, endStr]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const prevMonth = () => {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1));
  };

  const nextMonth = () => {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1));
  };

  const today = new Date();
  const isCurrentMonth = viewDate.getFullYear() === today.getFullYear() && viewDate.getMonth() === today.getMonth();

  const bookingsByDate: Record<string, BookingWithDetails[]> = {};
  bookings.forEach((b) => {
    const d = b.booking_date;
    if (!bookingsByDate[d]) bookingsByDate[d] = [];
    bookingsByDate[d].push(b);
  });

  const firstDay = new Date(year, month, 1);
  const firstWeekday = firstDay.getDay();
  const offset = firstWeekday === 0 ? 6 : firstWeekday - 1;
  const daysInMonth = end.getDate();
  const totalCells = Math.ceil((offset + daysInMonth) / 7) * 7;
  const days: (number | null)[] = [];
  for (let i = 0; i < offset; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);
  while (days.length < totalCells) days.push(null);

  const monthLabel = viewDate.toLocaleDateString("de-DE", { month: "long", year: "numeric" });

  if (error) {
    return <ErrorMessage message={error} onRetry={loadBookings} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[var(--color-text)]">
            Kalender
          </h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Monatsansicht aller Buchungen.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={prevMonth}>
            ← Zurück
          </Button>
          <span className="min-w-[180px] text-center font-medium text-[var(--color-text)] capitalize">
            {monthLabel}
          </span>
          <Button variant="outline" size="sm" onClick={nextMonth}>
            Weiter →
          </Button>
          {!isCurrentMonth && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewDate(new Date())}
            >
              Heute
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <PageLoader />
      ) : (
        <>
          <Card className="overflow-hidden p-0">
            <div className="grid grid-cols-7 border-b border-[var(--color-border)] bg-[var(--color-page)]">
              {WEEKDAY_LABELS.map((label) => (
                <div
                  key={label}
                  className="py-2 text-center text-xs font-medium text-[var(--color-muted)]"
                >
                  {label}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {days.map((day, i) => {
                if (day === null) {
                  return <div key={`empty-${i}`} className="h-[140px] border border-[var(--color-border)]/50 bg-[var(--color-page)]/50" />;
                }
                const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const dayBookings = bookingsByDate[dateStr] ?? [];
                const isToday =
                  today.getFullYear() === year &&
                  today.getMonth() === month &&
                  today.getDate() === day;
                return (
                  <div
                    key={dateStr}
                    className={`flex h-[140px] flex-col border border-[var(--color-border)]/50 p-1 ${
                      isToday ? "bg-[var(--color-accent-muted)]/30" : "bg-[var(--color-surface)]"
                    }`}
                  >
                    <div
                      className={`shrink-0 text-sm font-medium ${
                        isToday ? "text-[var(--color-accent-strong)]" : "text-[var(--color-text)]"
                      }`}
                    >
                      {day}
                    </div>
                    <div className="mt-1 min-h-0 flex-1 space-y-1 overflow-y-auto">
                      {dayBookings.map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => setDetailBooking(b)}
                          className={`block w-full rounded px-1.5 py-0.5 text-left text-xs truncate ${getStatusColorBlock(b.status)} text-white hover:opacity-90`}
                          title={`${b.customer_name} · ${b.start_time} · ${b.service_name ?? ""}`}
                        >
                          {b.start_time} {b.customer_name}
                        </button>
                      ))}
                    </div>
                    {dayBookings.length > 4 && (
                      <div className="shrink-0 border-t border-[var(--color-border)]/50 pt-0.5 text-center text-[10px] text-[var(--color-muted)]">
                        {dayBookings.length} Buchungen · ↓ scrollen
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="inline-flex items-center gap-1.5 text-sm text-[var(--color-muted)]">
              <span className="h-3 w-3 rounded bg-yellow-500" /> Ausstehend
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm text-[var(--color-muted)]">
              <span className="h-3 w-3 rounded bg-green-500" /> Bestätigt
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm text-[var(--color-muted)]">
              <span className="h-3 w-3 rounded bg-blue-500" /> Abgeschlossen
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm text-[var(--color-muted)]">
              <span className="h-3 w-3 rounded bg-red-500" /> Storniert
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm text-[var(--color-muted)]">
              <span className="h-3 w-3 rounded bg-gray-500" /> Nicht erschienen
            </span>
          </div>

          <BookingDetailModal
            booking={detailBooking}
            open={!!detailBooking}
            onClose={() => setDetailBooking(null)}
            onUpdated={loadBookings}
          />
        </>
      )}
    </div>
  );
}
