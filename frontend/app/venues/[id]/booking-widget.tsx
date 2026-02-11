"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { VenueWithStaff, Service, TimeSlot } from "@/lib/types";
import { getAvailableSlots } from "@/lib/api/availability";
import { createBooking } from "@/lib/api/bookings";
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

export function BookingWidget({ venue }: { venue: VenueWithStaff }) {
  const router = useRouter();
  const services = (venue.services ?? []).filter((s) => s.is_active !== false);

  const [step, setStep] = useState<Step>("service");
  const [service, setService] = useState<Service | null>(null);
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [partySize, setPartySize] = useState(DEFAULT_PARTY_SIZE);
  const [specialRequests, setSpecialRequests] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const minDate = formatDateForApi(today());
  const maxDate = formatDateForApi(
    addDays(today(), venue.booking_advance_days ?? 30)
  );

  const showPartySize = venue.type === "restaurant";
  const currentStepIndex = STEPS.findIndex((s) => s.key === step);

  const loadSlotsForDate = async (dateValue: string) => {
    if (!service || !dateValue) return;
    setLoadingSlots(true);
    setSlots([]);
    setSelectedSlot(null);
    setStep("time");
    try {
      const data = await getAvailableSlots(venue.id, service.id, dateValue);
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
    if (!name.trim()) err.name = "Bitte Namen angeben.";
    if (!email.trim()) err.email = "Bitte E-Mail angeben.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      err.email = "Bitte gültige E-Mail angeben.";
    if (venue.require_phone && !phone.trim())
      err.phone = "Bitte Telefonnummer angeben.";
    if (showPartySize && (partySize < 1 || partySize > 20))
      err.partySize = "Anzahl zwischen 1 und 20 wählen.";
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
        router.push(`/bookings/confirmation?token=${res.data.booking_token}`);
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
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-page)] p-5 text-center">
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

      {/* Zusammenfassung ab Schritt 2 */}
      {(step !== "service" && service) && (
        <div className="rounded-xl bg-[var(--color-page)] px-4 py-3 text-sm">
          <span className="font-medium text-[var(--color-text)]">{service.name}</span>
          {service.duration_minutes > 0 && (
            <span className="text-[var(--color-muted)]"> · {service.duration_minutes} Min.</span>
          )}
          {service.price != null && Number(service.price) > 0 && (
            <span className="font-medium text-[var(--color-accent)]">
              {" "}· {Number(service.price).toFixed(2)} €
            </span>
          )}
          {date && step !== "date" && (
            <span className="block mt-1 text-[var(--color-muted)]">
              {formatDateDisplay(date)}
              {selectedSlot && ` · ${formatTimeDisplay(selectedSlot.start_time)}`}
            </span>
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
                  className="flex w-full items-center justify-between gap-3 rounded-xl border-2 border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-4 text-left transition-all hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-muted)]/30 hover:shadow-[var(--shadow-sm)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2"
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
              className="w-full rounded-xl border-2 border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-0"
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
            <div className="flex flex-col items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-page)] py-10">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-accent)]" aria-hidden />
              <p className="mt-3 text-sm text-[var(--color-muted)]">Verfügbare Zeiten werden geladen…</p>
            </div>
          ) : slots.length === 0 ? (
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-page)] p-6 text-center">
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
                      className={`rounded-xl py-3 text-sm font-semibold transition-all ${
                        isSelected
                          ? "border-2 border-[var(--color-accent)] bg-[var(--color-accent)] text-white shadow-[var(--shadow-sm)]"
                          : "border-2 border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-muted)]/40"
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
          {/* Zusammenfassung der Auswahl */}
          <div className="rounded-xl border-2 border-[var(--color-accent-muted)] bg-[var(--color-accent-muted)]/40 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-accent-strong)]">
              Ihre Auswahl
            </p>
            <p className="mt-1 font-semibold text-[var(--color-text)]">
              {service.name}
              {service.duration_minutes > 0 && ` · ${service.duration_minutes} Min.`}
            </p>
            <p className="mt-0.5 text-sm text-[var(--color-text-soft)]">
              {date && formatDateDisplay(date)}, {formatTimeDisplay(selectedSlot.start_time)}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[var(--color-text)]">Ihre Angaben</h3>
            <p className="mt-0.5 text-xs text-[var(--color-muted)]">
              Mit * markierte Felder sind Pflicht.
            </p>
          </div>

          <div className="space-y-4">
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
                  className="w-full h-11 rounded-xl border-2 border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-0"
                >
                  {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? "Gast" : "Gäste"}
                    </option>
                  ))}
                </select>
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
                className="w-full rounded-xl border-2 border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-0"
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
