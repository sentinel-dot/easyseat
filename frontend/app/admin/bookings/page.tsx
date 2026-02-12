"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { getBookings, updateBookingStatus, getServices, createManualBooking } from "@/lib/api/dashboard";
import type { BookingWithDetails } from "@/lib/types";
import type { Service } from "@/lib/types";
import { getStatusLabel, getStatusColor } from "@/lib/utils/bookingStatus";
import { Button } from "@/components/shared/button";
import { Card } from "@/components/shared/card";
import { BookingDetailModal } from "@/components/admin/BookingDetailModal";
import { Input } from "@/components/shared/input";
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

const today = new Date().toISOString().slice(0, 10);

export default function AdminBookingsPage() {
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status") ?? "";

  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState(statusParam);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [search, setSearch] = useState("");
  const [serviceFilter, setServiceFilter] = useState<string>("");
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const limit = 20;
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [detailBooking, setDetailBooking] = useState<BookingWithDetails | null>(null);
  const [reasonDialog, setReasonDialog] = useState<{
    bookingId: number;
    newStatus: string;
    label: string;
  } | null>(null);
  const [reasonInput, setReasonInput] = useState("");
  const [manualOpen, setManualOpen] = useState(false);
  const [manualSaving, setManualSaving] = useState(false);
  const [manualForm, setManualForm] = useState({
    service_id: 0,
    booking_date: today,
    start_time: "10:00",
    end_time: "11:00",
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    party_size: 0,
  });

  const loadServices = useCallback(() => {
    getServices().then((res) => {
      if (res.success && res.data) setServices(res.data);
    });
  }, []);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const loadBookings = useCallback(() => {
    setLoading(true);
    setError(null);
    const params: { status?: string; startDate?: string; endDate?: string; search?: string; serviceId?: number; limit: number; offset: number } = {
      limit,
      offset,
    };
    if (statusFilter) params.status = statusFilter;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (search.trim()) params.search = search.trim();
    if (serviceFilter) params.serviceId = Number(serviceFilter);
    getBookings(params)
      .then((res) => {
        if (res.success && res.data) {
          setBookings(res.data);
          setTotal(res.pagination?.total ?? res.data.length);
        } else setError(res.message ?? "Fehler beim Laden.");
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, [statusFilter, startDate, endDate, search, serviceFilter, offset]);

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
        setReasonDialog(null);
        setReasonInput("");
      } else {
        toast.error(res.message ?? "Aktualisierung fehlgeschlagen.");
      }
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUpdatingId(null);
    }
  };

  const openReasonDialog = (
    bookingId: number,
    newStatus: string,
    label: string
  ) => {
    setReasonDialog({ bookingId, newStatus, label });
    setReasonInput("");
  };

  const submitReasonDialog = () => {
    if (!reasonDialog) return;
    const reason = reasonInput.trim();
    if (!reason) {
      toast.error("Bitte einen Grund angeben.");
      return;
    }
    handleStatusChange(reasonDialog.bookingId, reasonDialog.newStatus, reason);
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.service_id || !manualForm.customer_name.trim() || !manualForm.customer_email.trim()) {
      toast.error("Service, Name und E-Mail sind Pflicht.");
      return;
    }
    const service = services.find((s) => s.id === manualForm.service_id);
    if (!service) return;
    setManualSaving(true);
    try {
      const res = await createManualBooking({
        service_id: manualForm.service_id,
        booking_date: manualForm.booking_date,
        start_time: manualForm.start_time,
        end_time: manualForm.end_time,
        customer_name: manualForm.customer_name.trim(),
        customer_email: manualForm.customer_email.trim(),
        customer_phone: manualForm.customer_phone.trim() || undefined,
        party_size: manualForm.party_size || 0,
      });
      if (res.success) {
        toast.success("Buchung angelegt.");
        setManualOpen(false);
        setManualForm({
          service_id: services[0]?.id ?? 0,
          booking_date: today,
          start_time: "10:00",
          end_time: "11:00",
          customer_name: "",
          customer_email: "",
          customer_phone: "",
          party_size: 0,
        });
        loadBookings();
      } else {
        toast.error(res.message ?? "Anlegen fehlgeschlagen.");
      }
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setManualSaving(false);
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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[var(--color-text)]">
            Buchungen
          </h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Buchungsanfragen bestätigen, Status ändern oder manuelle Buchungen anlegen.
          </p>
        </div>
        <Button
          onClick={() => {
            setManualForm((f) => ({ ...f, service_id: services[0]?.id ?? 0 }));
            setManualOpen(true);
          }}
        >
          Manuelle Buchung anlegen
        </Button>
      </div>

      {/* Filter */}
      <Card className="p-4">
        <div className="flex flex-wrap items-end gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-[var(--color-muted)]">Status</span>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setOffset(0); }}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] min-w-[140px]"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value || "all"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-[var(--color-muted)]">Von Datum</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setOffset(0); }}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-[var(--color-muted)]">Bis Datum</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setOffset(0); }}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            />
          </label>
          {services.length > 0 && (
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-[var(--color-muted)]">Leistung</span>
              <select
                value={serviceFilter}
                onChange={(e) => { setServiceFilter(e.target.value); setOffset(0); }}
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] min-w-[160px]"
              >
                <option value="">Alle</option>
                {services.map((s) => (
                  <option key={s.id} value={String(s.id)}>{s.name}</option>
                ))}
              </select>
            </label>
          )}
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-[var(--color-muted)]">Suche (Name, E-Mail, Tel.)</span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (setOffset(0), loadBookings())}
              placeholder="Suchen…"
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] w-48"
            />
          </label>
          <Button variant="secondary" size="sm" onClick={() => { setOffset(0); loadBookings(); }}>
            Anwenden
          </Button>
        </div>
      </Card>

      {loading ? (
        <PageLoader />
      ) : bookings.length === 0 ? (
        <Card className="py-12 text-center text-[var(--color-muted)]">
          Keine Buchungen gefunden. Passe die Filter an oder lege eine manuelle Buchung an.
        </Card>
      ) : (
        <>
          <p className="text-sm text-[var(--color-muted)]">
            {offset + 1}–{Math.min(offset + limit, total)} von {total} Buchungen
          </p>
          <ul className="space-y-4">
            {bookings.map((b) => (
              <li key={b.id}>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setDetailBooking(b)}
                  onKeyDown={(e) => e.key === "Enter" && setDetailBooking(b)}
                  className="flex flex-col gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-sm)] transition-all sm:flex-row sm:items-start sm:justify-between cursor-pointer hover:ring-2 hover:ring-[var(--color-accent)]/30 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50"
                >
                  <div className="min-w-0">
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
                  <div className="flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
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
                    {b.status === "confirmed" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          openReasonDialog(b.id, "completed", "Abgeschlossen")
                        }
                        disabled={
                          updatingId === b.id ||
                          new Date(`${b.booking_date}T${b.end_time}`).getTime() > Date.now()
                        }
                        title={
                          new Date(`${b.booking_date}T${b.end_time}`).getTime() > Date.now()
                            ? "Nur für vergangene Termine"
                            : undefined
                        }
                      >
                        Abgeschlossen
                      </Button>
                    )}
                    {(b.status === "pending" || b.status === "confirmed") && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() =>
                          openReasonDialog(b.id, "cancelled", "Stornierung")
                        }
                        disabled={updatingId === b.id}
                      >
                        Stornieren
                      </Button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <BookingDetailModal
            booking={detailBooking}
            open={!!detailBooking}
            onClose={() => setDetailBooking(null)}
            onUpdated={loadBookings}
          />

          {reasonDialog && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
              onClick={() => setReasonDialog(null)}
            >
              <div
                className="w-full max-w-md rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-lg)]"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="font-display text-lg font-semibold text-[var(--color-text)]">
                  Grund für {reasonDialog.label} (erforderlich)
                </h3>
                <textarea
                  value={reasonInput}
                  onChange={(e) => setReasonInput(e.target.value)}
                  placeholder="z. B. Kunde hat abgesagt, Termin durchgeführt, …"
                  rows={3}
                  className="mt-3 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  autoFocus
                />
                <div className="mt-4 flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setReasonDialog(null);
                      setReasonInput("");
                    }}
                  >
                    Abbrechen
                  </Button>
                  <Button
                    onClick={submitReasonDialog}
                    disabled={!reasonInput.trim() || updatingId !== null}
                    isLoading={updatingId === reasonDialog.bookingId}
                  >
                    Bestätigen
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              disabled={offset === 0}
              onClick={() => setOffset((o) => Math.max(0, o - limit))}
            >
              Zurück
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={offset + limit >= total}
              onClick={() => setOffset((o) => o + limit)}
            >
              Weiter
            </Button>
          </div>
        </>
      )}

      {/* Modal: Manuelle Buchung */}
      {manualOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-lg)]">
            <h2 className="font-display text-xl font-semibold text-[var(--color-text)]">
              Manuelle Buchung anlegen
            </h2>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              z. B. für Laufkundschaft oder Nachbuchung.
            </p>
            <form onSubmit={handleManualSubmit} className="mt-6 space-y-4">
              <label className="block text-sm font-medium text-[var(--color-text)]">
                Leistung
              </label>
              <select
                required
                value={manualForm.service_id || ""}
                onChange={(e) => setManualForm((f) => ({ ...f, service_id: Number(e.target.value) }))}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              >
                <option value="">Bitte wählen</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.duration_minutes} Min.)
                  </option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Datum"
                  type="date"
                  value={manualForm.booking_date}
                  onChange={(e) => setManualForm((f) => ({ ...f, booking_date: e.target.value }))}
                  required
                />
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-[var(--color-text)]">Uhrzeit</label>
                  <div className="flex gap-2">
                    <input
                      type="time"
                      value={manualForm.start_time}
                      onChange={(e) => setManualForm((f) => ({ ...f, start_time: e.target.value }))}
                      className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                    />
                    <span className="self-center text-[var(--color-muted)]">–</span>
                    <input
                      type="time"
                      value={manualForm.end_time}
                      onChange={(e) => setManualForm((f) => ({ ...f, end_time: e.target.value }))}
                      className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                    />
                  </div>
                </div>
              </div>
              <Input
                label="Kundenname"
                value={manualForm.customer_name}
                onChange={(e) => setManualForm((f) => ({ ...f, customer_name: e.target.value }))}
                placeholder="Max Mustermann"
                required
              />
              <Input
                label="E-Mail"
                type="email"
                value={manualForm.customer_email}
                onChange={(e) => setManualForm((f) => ({ ...f, customer_email: e.target.value }))}
                placeholder="kunde@beispiel.de"
                required
              />
              <Input
                label="Telefon (optional)"
                type="tel"
                value={manualForm.customer_phone}
                onChange={(e) => setManualForm((f) => ({ ...f, customer_phone: e.target.value }))}
                placeholder="+49 …"
              />
              <Input
                label="Anzahl Personen"
                type="number"
                min={0}
                value={manualForm.party_size || ""}
                onChange={(e) => setManualForm((f) => ({ ...f, party_size: parseInt(e.target.value, 10) || 0 }))}
              />
              <div className="flex gap-3 pt-2">
                <Button type="submit" isLoading={manualSaving} className="flex-1">
                  Buchung anlegen
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setManualOpen(false)}
                  disabled={manualSaving}
                >
                  Abbrechen
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
