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

  const loadSlots = async () => {
    if (!service || !date) return;
    setLoadingSlots(true);
    setSlots([]);
    setSelectedSlot(null);
    try {
      const data = await getAvailableSlots(venue.id, service.id, date);
      const available = (data.time_slots ?? []).filter((s) => s.available);
      setSlots(available);
      setStep("time");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleDateSelect = () => {
    if (!date) return;
    loadSlots();
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
      <p className="text-sm text-[var(--color-muted)]">
        Derzeit sind keine buchbaren Leistungen hinterlegt.
      </p>
    );
  }

  return (
    <div className="mt-4 space-y-6">
      {step === "service" && (
        <>
          <p className="text-sm text-[var(--color-muted)]">
            Wählen Sie eine Leistung.
          </p>
          <ul className="space-y-2">
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
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-left transition-colors hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-muted)]/30"
                >
                  <span className="font-medium text-[var(--color-text)]">
                    {s.name}
                  </span>
                  {s.duration_minutes > 0 && (
                    <span className="ml-2 text-sm text-[var(--color-muted)]">
                      {s.duration_minutes} Min.
                    </span>
                  )}
                  {s.price != null && Number(s.price) > 0 && (
                    <span className="ml-2 text-sm text-[var(--color-accent)]">
                      {Number(s.price).toFixed(2)} €
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {step === "date" && service && (
        <>
          <p className="text-sm text-[var(--color-muted)]">
            Wählen Sie ein Datum für „{service.name}”.
          </p>
          <div className="flex gap-2">
            <input
              type="date"
              min={minDate}
              max={maxDate}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            />
            <Button
              onClick={handleDateSelect}
              disabled={!date || loadingSlots}
              isLoading={loadingSlots}
            >
              Zeiten anzeigen
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setService(null);
              setStep("service");
            }}
          >
            ← Andere Leistung
          </Button>
        </>
      )}

      {step === "time" && service && (
        <>
          <p className="text-sm text-[var(--color-muted)]">
            {date && formatDateDisplay(date)} – wählen Sie eine Uhrzeit.
          </p>
          {slots.length === 0 ? (
            <p className="text-sm text-[var(--color-muted)]">
              Keine freien Zeiten an diesem Tag. Bitte anderes Datum wählen.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {slots.map((slot) => (
                <button
                  key={`${slot.start_time}-${slot.end_time}-${slot.staff_member_id ?? ""}`}
                  type="button"
                  onClick={() => {
                    setSelectedSlot(slot);
                    setStep("details");
                  }}
                  className="rounded-lg border border-[var(--color-border)] py-2 text-sm font-medium text-[var(--color-text)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-muted)]/30"
                >
                  {formatTimeDisplay(slot.start_time)}
                </button>
              ))}
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setDate("");
              setSlots([]);
              setStep("date");
            }}
          >
            ← Anderes Datum
          </Button>
        </>
      )}

      {step === "details" && service && selectedSlot && (
        <>
          <p className="text-sm text-[var(--color-muted)]">
            {formatDateDisplay(date)}, {formatTimeDisplay(selectedSlot.start_time)}{" "}
            · {service.name}
          </p>
          <div className="space-y-4">
            <Input
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={fieldErrors.name}
              placeholder="Ihr Name"
              required
            />
            <Input
              label="E-Mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={fieldErrors.email}
              placeholder="ihre@email.de"
              required
            />
            {!!venue.require_phone && (
              <Input
                label="Telefon"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                error={fieldErrors.phone}
                placeholder="+49 …"
              />
            )}
            {showPartySize && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
                  Anzahl Gäste
                </label>
                <select
                  value={partySize}
                  onChange={(e) => setPartySize(Number(e.target.value))}
                  className="w-full h-11 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                >
                  {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? "Gast" : "Gäste"}
                    </option>
                  ))}
                </select>
                {fieldErrors.partySize && (
                  <p className="mt-1 text-sm text-red-600">
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
                placeholder="Allergien, Wünsche …"
                rows={2}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedSlot(null);
                setStep("time");
              }}
            >
              ← Zurück
            </Button>
            <Button
              onClick={handleSubmit}
              isLoading={submitting}
              className="flex-1"
            >
              Buchungsanfrage senden
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
