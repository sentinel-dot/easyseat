"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { VenueWithStaff, Service, TimeSlot } from "@/lib/types";
import { getAvailableSlots } from "@/lib/api/availability";
import { createBooking } from "@/lib/api/bookings";
import { useCustomerAuthOptional } from "@/contexts/CustomerAuthContext";
import {
  today,
  addDays,
  formatDateForApi,
  formatDateDisplay,
  formatTimeDisplay,
} from "@/lib/utils/date";
import { Button } from "@/components/shared/button";
import { Input } from "@/components/shared/input";

type Step = "service" | "date" | "time" | "details";

const STEPS: { key: Step; label: string }[] = [
  { key: "service", label: "Leistung" },
  { key: "date", label: "Datum" },
  { key: "time", label: "Uhrzeit" },
  { key: "details", label: "Ihre Daten" },
];

const DEFAULT_PARTY_SIZE = 2;

type BookingWidgetProps = {
  venue: VenueWithStaff;
  initialDate?: string;
  initialTime?: string;
  initialPartySize?: number;
};

export function BookingWidget({ venue, initialDate, initialTime, initialPartySize }: BookingWidgetProps) {
  const router = useRouter();
  const auth = useCustomerAuthOptional();
  const { customer, isAuthenticated } = auth ?? { customer: null, isAuthenticated: false };
  const services = (venue.services ?? []).filter((s) => s.is_active !== false);

  const [step, setStep] = useState<Step>("service");
  const [service, setService] = useState<Service | null>(null);
  const [date, setDate] = useState(initialDate ?? "");
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Eingeloggt: Name, E-Mail und Telefon aus Kundenprofil übernehmen
  useEffect(() => {
    if (customer) {
      setName(customer.name ?? "");
      setEmail(customer.email ?? "");
      setPhone(customer.phone ?? "");
    }
  }, [customer]);
  const [partySize, setPartySize] = useState(
    initialPartySize != null ? Math.min(8, Math.max(1, initialPartySize)) : DEFAULT_PARTY_SIZE
  );
  const [specialRequests, setSpecialRequests] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const minDate = formatDateForApi(today());
  const maxDate = formatDateForApi(
    addDays(today(), venue.booking_advance_days ?? 30)
  );

  const showPartySize = venue.type === "restaurant";
  const currentStepIndex = STEPS.findIndex((s) => s.key === step);

  useEffect(() => {
    if (!initialTime || slots.length === 0) return;
    const target =
      initialTime.length === 5 ? initialTime : `${initialTime.slice(0, 2)}:${initialTime.slice(2, 4)}`;
    const match = slots.find((s) => s.start_time === target);
    if (match) setSelectedSlot(match);
    else {
      const parts = target.split(":");
      const th = parseInt(parts[0], 10);
      const tm = parseInt(parts[1], 10) || 0;
      const targetMins = th * 60 + tm;
      let best = slots[0];
      let bestDiff = Infinity;
      for (const s of slots) {
        const [h, m] = s.start_time.split(":").map((x) => parseInt(x, 10));
        const diff = Math.abs(h * 60 + m - targetMins);
        if (diff < bestDiff) {
          bestDiff = diff;
          best = s;
        }
      }
      setSelectedSlot(best);
    }
  }, [initialTime, slots]);

  useEffect(() => {
    if (step !== "date" || !date || !service) return;
    loadSlotsForDate(date);
  }, [step, date, service]);

  const loadSlotsForDate = async (dateValue: string) => {
    if (!service || !dateValue) return;
    setLoadingSlots(true);
    setSlots([]);
    setSelectedSlot(null);
    setStep("time");
    try {
      const slotOptions: { partySize?: number; timeWindowStart?: string; timeWindowEnd?: string } = {};
      if (showPartySize) slotOptions.partySize = partySize;
      else slotOptions.partySize = 1;
      if (initialTime && initialTime.length >= 4) {
        const [h, m] = initialTime.length === 5 ? initialTime.split(":") : [initialTime.slice(0, 2), initialTime.slice(2, 4) || "0"];
        const centerMins = parseInt(h, 10) * 60 + parseInt(m || "0", 10);
        const startMins = Math.max(0, centerMins - 60);
        const endMins = Math.min(24 * 60 - 1, centerMins + 60);
        slotOptions.timeWindowStart = `${Math.floor(startMins / 60)}:${String(startMins % 60).padStart(2, "0")}`;
        slotOptions.timeWindowEnd = `${Math.floor(endMins / 60)}:${String(endMins % 60).padStart(2, "0")}`;
      }
      const data = await getAvailableSlots(venue.id, service.id, dateValue, slotOptions);
      const available = (data.time_slots ?? []).filter((s) => s.available);
      setSlots(available);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoadingSlots(false);
    }
  };

  const validateDetails = (): boolean => {
    const err: Record<string, string> = {};
    if (!isAuthenticated) {
      if (!name.trim()) err.name = "Bitte Namen angeben.";
      if (!email.trim()) err.email = "Bitte E-Mail angeben.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        err.email = "Bitte gültige E-Mail angeben.";
    }
    if (venue.require_phone && !phone.trim())
      err.phone = "Bitte Telefonnummer angeben.";
    if (showPartySize && (partySize < 1 || partySize > 8))
      err.partySize = "Anzahl zwischen 1 und 8 wählen. Für mehr Gäste bitte anrufen.";
    setFieldErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async () => {
    if (!service || !selectedSlot || !date) return;
    if (!validateDetails()) return;

    setSubmitting(true);
    try {
      const res = await createBooking({
        venue_id: venue.id,
        service_id: service.id,
        staff_member_id: selectedSlot.staff_member_id ?? undefined,
        customer_name: name.trim(),
        customer_email: email.trim(),
        customer_phone: venue.require_phone ? phone.trim() : undefined,
        booking_date: date,
        start_time: selectedSlot.start_time,
        end_time: selectedSlot.end_time,
        party_size: showPartySize ? partySize : 1,
        special_requests: specialRequests.trim() || undefined,
      });

      if (res.success && res.data?.booking_token) {
        toast.success("Buchungsanfrage wurde gesendet.");
        const params = new URLSearchParams({ token: res.data.booking_token });
        if (email.trim()) params.set("email", email.trim());
        router.push(`/bookings/confirmation?${params.toString()}`);
        return;
      }
      toast.error(res.message ?? "Buchung fehlgeschlagen.");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (services.length === 0) {
    return (
      <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-page)] p-5 text-center">
        <p className="text-sm text-[var(--color-muted)]">
          Derzeit sind keine buchbaren Leistungen hinterlegt.
        </p>
        <p className="mt-1 text-xs text-[var(--color-muted)]">
          Bitte später erneut vorbeischauen oder den Betrieb direkt kontaktieren.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Fortschritt: Schritte 1–4 */}
      <nav aria-label="Buchungsschritte" className="flex items-center gap-1">
        {STEPS.map((s, i) => {
          const isActive = s.key === step;
          const isPast = i < currentStepIndex;
          return (
            <div key={s.key} className="flex flex-1 flex-col items-center gap-1">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                  isActive
                    ? "bg-[var(--color-accent)] text-white"
                    : isPast
                      ? "bg-[var(--color-accent-muted)] text-[var(--color-accent-strong)]"
                      : "bg-[var(--color-page)] text-[var(--color-muted)]"
                }`}
                aria-current={isActive ? "step" : undefined}
              >
                {isPast ? (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  i + 1
                )}
              </span>
              <span
                className={`hidden text-[10px] font-medium sm:block ${
                  isActive ? "text-[var(--color-accent-strong)]" : "text-[var(--color-muted)]"
                }`}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </nav>

      {/* Ihre Auswahl (rosa Box) – immer oben, füllt sich schrittweise */}
      {step !== "service" && service && (
        <div className="rounded-md border border-[var(--color-accent-muted)] bg-[var(--color-accent-muted)]/40 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-accent-strong)]">
            Ihre Auswahl
          </p>
          <p className="mt-1 font-semibold text-[var(--color-text)]">
            {service.name}
            {service.duration_minutes > 0 && ` · ${service.duration_minutes} Min.`}
          </p>
          {date && step !== "date" && (
            <p className="mt-0.5 text-sm text-[var(--color-text-soft)]">
              {formatDateDisplay(date)}
              {selectedSlot && `, ${formatTimeDisplay(selectedSlot.start_time)}`}
            </p>
          )}
        </div>
      )}

      {/* Schritt: Leistung */}
      {step === "service" && (
        <div className="space-y-4">
          <p className="text-sm text-[var(--color-muted)]">
            Wählen Sie die gewünschte Leistung.
          </p>
          <ul className="space-y-2" role="list">
            {services.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => {
                    setService(s);
                    setDate("");
                    setSlots([]);
                    setSelectedSlot(null);
                    setStep("date");
                  }}
                  className="flex w-full items-center justify-between gap-3 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3.5 text-left transition-colors hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-muted)]/30 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2"
                >
                  <span className="font-semibold text-[var(--color-text)]">{s.name}</span>
                  <span className="flex shrink-0 items-center gap-2 text-sm text-[var(--color-muted)]">
                    {s.duration_minutes > 0 && <span>{s.duration_minutes} Min.</span>}
                    {s.price != null && Number(s.price) > 0 && (
                      <span className="font-semibold text-[var(--color-accent)]">
                        {Number(s.price).toFixed(2)} €
                      </span>
                    )}
                    <svg className="h-5 w-5 text-[var(--color-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Schritt: Datum */}
      {step === "date" && service && (
        <div className="space-y-4">
          <p className="text-sm text-[var(--color-muted)]">
            Wählen Sie ein Datum für <strong className="text-[var(--color-text)]">{service.name}</strong> – die verfügbaren Zeiten erscheinen automatisch.
          </p>
          <div>
            <label className="sr-only" htmlFor="booking-date">Datum</label>
            <input
              id="booking-date"
              type="date"
              min={minDate}
              max={maxDate}
              value={date}
              onChange={(e) => {
                const newDate = e.target.value;
                setDate(newDate);
                if (newDate) loadSlotsForDate(newDate);
              }}
              className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-0"
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setService(null);
              setDate("");
              setStep("service");
            }}
            className="w-full sm:w-auto"
          >
            ← Andere Leistung wählen
          </Button>
        </div>
      )}

      {/* Schritt: Uhrzeit */}
      {step === "time" && service && (
        <div className="space-y-4">
          <p className="text-sm text-[var(--color-muted)]">
            {date && formatDateDisplay(date)} – wählen Sie eine freie Uhrzeit.
          </p>
          {loadingSlots ? (
            <div className="flex flex-col items-center justify-center rounded-md border border-[var(--color-border)] bg-[var(--color-page)] py-10">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-accent)]" aria-hidden />
              <p className="mt-3 text-sm text-[var(--color-muted)]">Verfügbare Zeiten werden geladen…</p>
            </div>
          ) : slots.length === 0 ? (
            <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-page)] p-6 text-center">
              <p className="font-medium text-[var(--color-text)]">Keine freien Zeiten an diesem Tag</p>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                Bitte wählen Sie ein anderes Datum.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => {
                  setDate("");
                  setSlots([]);
                  setStep("date");
                }}
              >
                Anderes Datum wählen
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2" role="listbox" aria-label="Verfügbare Uhrzeiten">
                {slots.map((slot) => {
                  const isSelected =
                    selectedSlot?.start_time === slot.start_time &&
                    selectedSlot?.staff_member_id === slot.staff_member_id;
                  return (
                    <button
                      key={`${slot.start_time}-${slot.end_time}-${slot.staff_member_id ?? ""}`}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        setSelectedSlot(slot);
                        setStep("details");
                      }}
                      className={`rounded-md py-2.5 text-sm font-semibold transition-colors ${
                        isSelected
                          ? "border border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                          : "border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-muted)]/40"
                      }`}
                    >
                      {formatTimeDisplay(slot.start_time)}
                    </button>
                  );
                })}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setDate("");
                  setSlots([]);
                  setStep("date");
                }}
                className="w-full sm:w-auto"
              >
                ← Anderes Datum
              </Button>
            </>
          )}
        </div>
      )}

      {/* Schritt: Ihre Daten */}
      {step === "details" && service && selectedSlot && (
        <div className="space-y-5">
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-text)]">Ihre Angaben</h3>
            {isAuthenticated ? (
              <p className="mt-0.5 text-xs text-[var(--color-muted)]">
                Es werden Ihre Kontodaten verwendet. Änderungen im Profil möglich.
              </p>
            ) : (
              <p className="mt-0.5 text-xs text-[var(--color-muted)]">
                Mit * markierte Felder sind Pflicht.
              </p>
            )}
          </div>

          <div className="space-y-4">
            {isAuthenticated ? (
              <>
                <Input
                  label="Name"
                  value={name}
                  disabled
                  className="bg-[var(--color-page)] cursor-not-allowed opacity-90"
                />
                <Input
                  label="E-Mail"
                  type="email"
                  value={email}
                  disabled
                  className="bg-[var(--color-page)] cursor-not-allowed opacity-90"
                />
              </>
            ) : (
              <>
                <Input
                  label="Name *"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  error={fieldErrors.name}
                  placeholder="Max Mustermann"
                  required
                />
                <Input
                  label="E-Mail *"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={fieldErrors.email}
                  placeholder="max@beispiel.de"
                  required
                />
              </>
            )}
            {!!venue.require_phone && (
              <Input
                label="Telefon *"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                error={fieldErrors.phone}
                placeholder="+49 123 456789"
              />
            )}
            {showPartySize && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
                  Anzahl Gäste *
                </label>
                <select
                  value={partySize}
                  onChange={(e) => setPartySize(Number(e.target.value))}
                  className="w-full h-11 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-0"
                >
                  {Array.from({ length: 8 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? "Gast" : "Gäste"}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-[var(--color-muted)]">
                  Für mehr als 8 Gäste bitte anrufen.
                </p>
                {fieldErrors.partySize && (
                  <p className="mt-1.5 text-sm text-[var(--color-error)]">
                    {fieldErrors.partySize}
                  </p>
                )}
              </div>
            )}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--color-muted)]">
                Anmerkungen (optional)
              </label>
              <textarea
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="z. B. Allergien, Wünsche zum Tisch …"
                rows={3}
                className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-0"
              />
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row">
            <Button
              variant="outline"
              className="sm:shrink-0"
              onClick={() => {
                setSelectedSlot(null);
                setStep("time");
              }}
            >
              ← Uhrzeit ändern
            </Button>
            <Button
              onClick={handleSubmit}
              isLoading={submitting}
              className="flex-1"
            >
              Kostenlos anfragen
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
