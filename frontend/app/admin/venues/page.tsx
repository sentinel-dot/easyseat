"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import {
  listVenues,
  createVenue,
  updateVenue,
} from "@/lib/api/admin";
import type { Venue } from "@/lib/types";
import { Card } from "@/components/shared/card";
import { Button } from "@/components/shared/button";
import { Input } from "@/components/shared/input";
import { PageLoader } from "@/components/shared/loading-spinner";
import { ErrorMessage } from "@/components/shared/error-message";

const VENUE_TYPES: { value: Venue["type"]; label: string }[] = [
  { value: "restaurant", label: "Restaurant" },
  { value: "hair_salon", label: "Friseur" },
  { value: "beauty_salon", label: "Kosmetik" },
  { value: "massage", label: "Massage" },
  { value: "other", label: "Sonstiges" },
];

export default function AdminVenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: "",
    type: "other" as Venue["type"],
    email: "",
    phone: "",
    address: "",
    city: "",
    postal_code: "",
    country: "DE",
    description: "",
    image_url: "",
    website_url: "",
    booking_advance_days: 30,
    booking_advance_hours: 48,
    cancellation_hours: 24,
    is_active: true,
  });
  const [saving, setSaving] = useState(false);

  const loadVenues = () => {
    setLoading(true);
    setError(null);
    listVenues()
      .then((res) => {
        if (res.success && res.data) setVenues(res.data);
        else setError(res.message ?? "Fehler beim Laden.");
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadVenues();
  }, []);

  const openCreate = () => {
    setForm({
      name: "",
      type: "other",
      email: "",
      phone: "",
      address: "",
      city: "",
      postal_code: "",
      country: "DE",
      description: "",
      image_url: "",
      website_url: "",
      booking_advance_days: 30,
      booking_advance_hours: 48,
      cancellation_hours: 24,
      is_active: true,
    });
    setEditingId(null);
    setModal("create");
  };

  const openEdit = async (v: Venue) => {
    setEditingId(v.id);
    setForm({
      name: v.name,
      type: v.type,
      email: v.email,
      phone: v.phone ?? "",
      address: v.address ?? "",
      city: v.city ?? "",
      postal_code: v.postal_code ?? "",
      country: v.country ?? "DE",
      description: v.description ?? "",
      image_url: v.image_url ?? "",
      website_url: v.website_url ?? "",
      booking_advance_days: v.booking_advance_days ?? 30,
      booking_advance_hours: v.booking_advance_hours ?? 48,
      cancellation_hours: v.cancellation_hours ?? 24,
      is_active: v.is_active ?? true,
    });
    setModal("edit");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modal === "create") {
        const res = await createVenue({
          name: form.name,
          type: form.type,
          email: form.email,
          phone: form.phone || undefined,
          address: form.address || undefined,
          city: form.city || undefined,
          postal_code: form.postal_code || undefined,
          country: form.country,
          description: form.description || undefined,
          image_url: form.image_url || undefined,
          website_url: form.website_url || undefined,
          booking_advance_days: form.booking_advance_days,
          booking_advance_hours: form.booking_advance_hours,
          cancellation_hours: form.cancellation_hours,
          is_active: form.is_active,
        });
        if (res.success) {
          toast.success("Venue erstellt.");
          setModal(null);
          loadVenues();
        } else toast.error(res.message ?? "Fehler.");
      } else if (modal === "edit" && editingId) {
        const res = await updateVenue(editingId, {
          name: form.name,
          type: form.type,
          email: form.email,
          phone: form.phone || undefined,
          address: form.address || undefined,
          city: form.city || undefined,
          postal_code: form.postal_code || undefined,
          country: form.country,
          description: form.description || undefined,
          image_url: form.image_url || undefined,
          website_url: form.website_url || undefined,
          booking_advance_days: form.booking_advance_days,
          booking_advance_hours: form.booking_advance_hours,
          cancellation_hours: form.cancellation_hours,
          is_active: form.is_active,
        });
        if (res.success) {
          toast.success("Venue aktualisiert.");
          setModal(null);
          setEditingId(null);
          loadVenues();
        } else toast.error(res.message ?? "Fehler.");
      }
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader />;
  if (error) {
    return (
      <ErrorMessage message={error} onRetry={() => loadVenues()} />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[var(--color-text)]">
            Venues
          </h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Alle Betriebe anlegen und bearbeiten.
          </p>
        </div>
        <Button variant="primary" onClick={openCreate}>
          Venue anlegen
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="pb-2 font-medium text-[var(--color-muted)]">ID</th>
                <th className="pb-2 font-medium text-[var(--color-muted)]">Name</th>
                <th className="pb-2 font-medium text-[var(--color-muted)]">Typ</th>
                <th className="pb-2 font-medium text-[var(--color-muted)]">E-Mail</th>
                <th className="pb-2 font-medium text-[var(--color-muted)]">Status</th>
                <th className="pb-2 font-medium text-[var(--color-muted)]">Aktion</th>
              </tr>
            </thead>
            <tbody>
              {venues.map((v) => (
                <tr key={v.id} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="py-2 text-[var(--color-muted)]">{v.id}</td>
                  <td className="py-2 font-medium text-[var(--color-text)]">{v.name}</td>
                  <td className="py-2 text-[var(--color-muted)]">{VENUE_TYPES.find((t) => t.value === v.type)?.label ?? v.type}</td>
                  <td className="py-2 text-[var(--color-text)]">{v.email}</td>
                  <td className="py-2">
                    <span className={v.is_active ? "text-green-600" : "text-[var(--color-muted)]"}>
                      {v.is_active ? "Aktiv" : "Inaktiv"}
                    </span>
                  </td>
                  <td className="py-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(v)}>
                      Bearbeiten
                    </Button>
                    <Link href={`/venues/${v.id}`} target="_blank" className="ml-2 text-sm text-[var(--color-accent)] hover:underline">
                      Öffnen
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {venues.length === 0 && (
          <p className="py-8 text-center text-[var(--color-muted)]">Noch keine Venues.</p>
        )}
      </Card>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="max-h-[90vh] w-full max-w-lg overflow-y-auto p-6">
            <h2 className="font-display text-lg font-semibold text-[var(--color-text)]">
              {modal === "create" ? "Venue anlegen" : "Venue bearbeiten"}
            </h2>
            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <Input
                label="Name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Typ</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as Venue["type"] }))}
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-text)]"
                >
                  {VENUE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <Input
                label="E-Mail"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
              />
              <Input
                label="Telefon"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
              <Input
                label="Adresse"
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="PLZ"
                  value={form.postal_code}
                  onChange={(e) => setForm((f) => ({ ...f, postal_code: e.target.value }))}
                />
                <Input
                  label="Stadt"
                  value={form.city}
                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                />
              </div>
              <Input
                label="Land"
                value={form.country}
                onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
              />
              <Input
                label="Bild-URL"
                type="url"
                value={form.image_url}
                onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
                placeholder="https://…"
              />
              <Input
                label="Website"
                value={form.website_url}
                onChange={(e) => setForm((f) => ({ ...f, website_url: e.target.value }))}
              />
              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="Buchung Vorlauf (Tage)"
                  type="number"
                  min={1}
                  value={form.booking_advance_days}
                  onChange={(e) => setForm((f) => ({ ...f, booking_advance_days: Number(e.target.value) || 30 }))}
                />
                <Input
                  label="Buchung Vorlauf (Std)"
                  type="number"
                  min={0}
                  value={form.booking_advance_hours}
                  onChange={(e) => setForm((f) => ({ ...f, booking_advance_hours: Number(e.target.value) || 48 }))}
                />
                <Input
                  label="Storno (Std)"
                  type="number"
                  min={0}
                  value={form.cancellation_hours}
                  onChange={(e) => setForm((f) => ({ ...f, cancellation_hours: Number(e.target.value) || 24 }))}
                />
              </div>
              {modal === "edit" && (
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                    className="rounded border-[var(--color-border)]"
                  />
                  <span className="text-sm text-[var(--color-text)]">Aktiv</span>
                </label>
              )}
              <div className="flex gap-2 pt-2">
                <Button type="submit" variant="primary" disabled={saving}>
                  {saving ? "Speichern…" : "Speichern"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setModal(null)}>
                  Abbrechen
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
