"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  listCustomers,
  updateCustomer,
  setCustomerPassword,
  adjustCustomerLoyaltyPoints,
  type CustomerWithStats,
} from "@/lib/api/admin";
import { Card } from "@/components/shared/card";
import { Button } from "@/components/shared/button";
import { Input } from "@/components/shared/input";
import { PageLoader } from "@/components/shared/loading-spinner";
import { ErrorMessage } from "@/components/shared/error-message";

type StatusFilter = "all" | "active" | "inactive";

const STATUS_FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Alle" },
  { value: "active", label: "Aktiv" },
  { value: "inactive", label: "Inaktiv" },
];

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerWithStats[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [modal, setModal] = useState<"edit" | "password" | "points" | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<CustomerWithStats | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email_verified: false, is_active: true });
  const [passwordForm, setPasswordForm] = useState({ newPassword: "", confirm: "" });
  const [pointsForm, setPointsForm] = useState({ pointsChange: 0, reason: "" });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    const active =
      statusFilter === "all" ? undefined : statusFilter === "active";
    listCustomers({
      search: searchTerm || undefined,
      active,
      limit: 200,
    })
      .then((res) => {
        if (res.success && res.data) {
          setCustomers(res.data);
          setTotal(res.total ?? res.data.length);
        } else setError(res.message ?? "Fehler beim Laden.");
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [statusFilter]);

  useEffect(() => {
    if (searchTerm === "") {
      load();
      return;
    }
    const t = setTimeout(() => load(), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const openEdit = (c: CustomerWithStats) => {
    setEditingCustomer(c);
    setForm({
      name: c.name,
      phone: c.phone ?? "",
      email_verified: c.email_verified,
      is_active: c.is_active,
    });
    setModal("edit");
  };

  const openPassword = (c: CustomerWithStats) => {
    setEditingCustomer(c);
    setPasswordForm({ newPassword: "", confirm: "" });
    setModal("password");
  };

  const openPoints = (c: CustomerWithStats) => {
    setEditingCustomer(c);
    setPointsForm({ pointsChange: 0, reason: "" });
    setModal("points");
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;
    setSaving(true);
    try {
      const res = await updateCustomer(editingCustomer.id, {
        name: form.name,
        phone: form.phone || undefined,
        email_verified: form.email_verified,
        is_active: form.is_active,
      });
      if (res.success) {
        toast.success("Kunde aktualisiert.");
        setModal(null);
        setEditingCustomer(null);
        load();
      } else toast.error(res.message ?? "Fehler.");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirm) {
      toast.error("Passwörter stimmen nicht überein.");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error("Passwort mindestens 8 Zeichen.");
      return;
    }
    if (!editingCustomer) return;
    setSaving(true);
    try {
      const res = await setCustomerPassword(editingCustomer.id, passwordForm.newPassword);
      if (res.success) {
        toast.success("Passwort geändert.");
        setModal(null);
        setEditingCustomer(null);
      } else toast.error(res.message ?? "Fehler.");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handlePointsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;
    if (pointsForm.pointsChange === 0) {
      toast.error("Bitte einen Wert ungleich 0 eingeben.");
      return;
    }
    if (!pointsForm.reason.trim()) {
      toast.error("Bitte einen Grund angeben.");
      return;
    }
    setSaving(true);
    try {
      const res = await adjustCustomerLoyaltyPoints(
        editingCustomer.id,
        pointsForm.pointsChange,
        pointsForm.reason
      );
      if (res.success) {
        toast.success("Bonuspunkte angepasst.");
        setModal(null);
        setEditingCustomer(null);
        load();
      } else toast.error(res.message ?? "Fehler.");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader />;
  if (error) {
    return <ErrorMessage message={error} onRetry={() => load()} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[var(--color-text)]">
            Kunden
          </h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Kunden anzeigen, bearbeiten und Bonuspunkte verwalten.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-[var(--color-muted)]">Status:</span>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)]"
        >
          {STATUS_FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Suche Name, E-Mail, Telefon…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] w-64"
        />
        <span className="text-sm text-[var(--color-muted)]">
          {customers.length} Kunden
        </span>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="pb-2 font-medium text-[var(--color-muted)]">E-Mail</th>
                <th className="pb-2 font-medium text-[var(--color-muted)]">Name</th>
                <th className="pb-2 font-medium text-[var(--color-muted)]">Telefon</th>
                <th className="pb-2 font-medium text-[var(--color-muted)]">Punkte</th>
                <th className="pb-2 font-medium text-[var(--color-muted)]">Buchungen</th>
                <th className="pb-2 font-medium text-[var(--color-muted)]">Verifiziert</th>
                <th className="pb-2 font-medium text-[var(--color-muted)]">Status</th>
                <th className="pb-2 font-medium text-[var(--color-muted)]">Aktion</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="py-2 text-[var(--color-text)]">{c.email}</td>
                  <td className="py-2 font-medium text-[var(--color-text)]">{c.name}</td>
                  <td className="py-2 text-[var(--color-muted)]">{c.phone ?? "–"}</td>
                  <td className="py-2 text-[var(--color-text)]">{c.loyalty_points}</td>
                  <td className="py-2 text-[var(--color-muted)]">
                    {c.total_bookings} ({c.completed_bookings} abgeschl.)
                  </td>
                  <td className="py-2">
                    {c.email_verified ? (
                      <span className="inline-flex items-center justify-center text-green-600 dark:text-green-400" title="Verifiziert">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center text-red-500 dark:text-red-400" title="Nicht verifiziert">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </span>
                    )}
                  </td>
                  <td className="py-2">
                    <span className={c.is_active ? "text-green-600 dark:text-green-400" : "text-[var(--color-muted)]"}>
                      {c.is_active ? "Aktiv" : "Inaktiv"}
                    </span>
                  </td>
                  <td className="py-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(c)}>
                      Bearbeiten
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-2"
                      onClick={() => openPassword(c)}
                    >
                      Passwort
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-2"
                      onClick={() => openPoints(c)}
                    >
                      Punkte
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {customers.length === 0 && (
          <p className="py-8 text-center text-[var(--color-muted)]">
            Keine Kunden gefunden.
          </p>
        )}
      </Card>

      {modal === "edit" && editingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-md p-6">
            <h2 className="font-display text-lg font-semibold text-[var(--color-text)]">
              Kunde bearbeiten
            </h2>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{editingCustomer.email}</p>
            <form onSubmit={handleEditSubmit} className="mt-4 space-y-3">
              <Input
                label="Name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
              <Input
                label="Telefon"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.email_verified}
                  onChange={(e) => setForm((f) => ({ ...f, email_verified: e.target.checked }))}
                  className="rounded border-[var(--color-border)]"
                />
                <span className="text-sm text-[var(--color-text)]">E-Mail verifiziert</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                  className="rounded border-[var(--color-border)]"
                />
                <span className="text-sm text-[var(--color-text)]">Aktiv</span>
              </label>
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

      {modal === "password" && editingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-md p-6">
            <h2 className="font-display text-lg font-semibold text-[var(--color-text)]">
              Passwort setzen
            </h2>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{editingCustomer.email}</p>
            <form onSubmit={handlePasswordSubmit} className="mt-4 space-y-3">
              <Input
                label="Neues Passwort"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))
                }
                required
                minLength={8}
              />
              <Input
                label="Passwort bestätigen"
                type="password"
                value={passwordForm.confirm}
                onChange={(e) =>
                  setPasswordForm((f) => ({ ...f, confirm: e.target.value }))
                }
                required
                minLength={8}
              />
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

      {modal === "points" && editingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-md p-6">
            <h2 className="font-display text-lg font-semibold text-[var(--color-text)]">
              Bonuspunkte anpassen
            </h2>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              {editingCustomer.name} – aktuell {editingCustomer.loyalty_points} Punkte
            </p>
            <form onSubmit={handlePointsSubmit} className="mt-4 space-y-3">
              <Input
                label="Punkteänderung (+ / −)"
                type="number"
                value={pointsForm.pointsChange || ""}
                onChange={(e) =>
                  setPointsForm((f) => ({
                    ...f,
                    pointsChange: parseInt(e.target.value, 10) || 0,
                  }))
                }
                placeholder="z.B. 50 oder -20"
              />
              <Input
                label="Grund"
                value={pointsForm.reason}
                onChange={(e) =>
                  setPointsForm((f) => ({ ...f, reason: e.target.value }))
                }
                placeholder="z.B. Kulanz, Korrektur"
                required
              />
              <div className="flex gap-2 pt-2">
                <Button type="submit" variant="primary" disabled={saving}>
                  {saving ? "Speichern…" : "Anpassen"}
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
