"use client";

import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { apiClient } from "@/lib/api/client";
import { Button } from "@/components/shared/button";
import { Input } from "@/components/shared/input";
import { getStatusLabel, getStatusColor } from "@/lib/utils/bookingStatus";
import type { Booking } from "@/lib/types";

/**
 * TODO (Post-MVP): E-Mail-Verifizierung per Code hinzufügen
 * 
 * Aktuell: Jeder kann die E-Mail eingeben und alle Buchungen sehen (potenzielles Datenschutzproblem).
 * 
 * Zukünftige Implementierung:
 * 1. User gibt E-Mail ein
 * 2. Backend sendet Verifizierungs-Code (6-stellig) per E-Mail
 * 3. User gibt Code ein
 * 4. Bei Erfolg: Temporäre Session (z.B. JWT mit 15 Min Laufzeit) oder Magic-Link
 * 
 * Alternativ: Komplett auf Magic-Link umstellen (wie bei vielen modernen Apps)
 * - User gibt E-Mail ein → Backend sendet Link → Link öffnet /bookings/my-bookings?token=xyz
 */

export function MyBookingsContent() {
  const [email, setEmail] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!email.trim()) {
      toast.error("Bitte E-Mail-Adresse eingeben.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error("Bitte gültige E-Mail-Adresse eingeben.");
      return;
    }

    setLoading(true);
    setSearched(false);
    try {
      const res = await apiClient<Booking[]>(`/bookings/customer/${encodeURIComponent(email.trim())}`);
      if (res.success && res.data) {
        setBookings(res.data);
        setSearched(true);
        if (res.data.length === 0) {
          toast.info("Keine Buchungen gefunden.");
        }
      } else {
        toast.error(res.message ?? "Fehler beim Laden der Buchungen.");
      }
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="mt-6 space-y-6">
      {/* Suchfeld */}
      <div className="flex gap-3">
        <Input
          type="email"
          placeholder="ihre@email.de"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1"
          label=""
        />
        <Button onClick={handleSearch} isLoading={loading} disabled={loading}>
          Suchen
        </Button>
      </div>

      {/* Ergebnisse */}
      {searched && bookings.length === 0 && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center">
          <p className="text-[var(--color-muted)]">
            Keine Buchungen für diese E-Mail-Adresse gefunden.
          </p>
        </div>
      )}

      {bookings.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-[var(--color-muted)]">
            {bookings.length} Buchung{bookings.length !== 1 ? "en" : ""} gefunden
          </p>
          <ul className="space-y-3">
            {bookings.map((b) => {
              const dateDisplay = b.booking_date
                ? new Date(b.booking_date + "T12:00:00").toLocaleDateString("de-DE", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "";
              const timeDisplay =
                b.start_time && b.end_time ? `${b.start_time} – ${b.end_time}` : "";

              return (
                <li key={b.id}>
                  <Link
                    href={`/bookings/manage/${b.booking_token}`}
                    className="block rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-sm)] transition-colors hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-muted)]/30"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        {b.venue_name && (
                          <p className="font-semibold text-[var(--color-text)]">
                            {b.venue_name}
                          </p>
                        )}
                        {b.service_name && (
                          <p className="mt-0.5 text-sm text-[var(--color-muted)]">
                            {b.service_name}
                            {b.staff_member_name && ` · ${b.staff_member_name}`}
                          </p>
                        )}
                        <p className="mt-2 text-sm text-[var(--color-text)]">
                          {dateDisplay} · {timeDisplay}
                        </p>
                      </div>
                      <span
                        className={`inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(b.status)}`}
                      >
                        {getStatusLabel(b.status)}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="pt-4 text-center">
        <Link
          href="/venues"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-accent)] transition-colors hover:text-[var(--color-accent-hover)]"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Zurück zu den Orten
        </Link>
      </div>
    </div>
  );
}
