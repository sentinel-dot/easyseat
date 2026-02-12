"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  listAdmins,
  listVenues,
  createAdmin,
  updateAdmin,
  setAdminPassword,
  type AdminWithVenue,
} from "@/lib/api/admin";
import type { Venue } from "@/lib/types";
import { Card } from "@/components/shared/card";
import { Button } from "@/components/shared/button";
import { Input } from "@/components/shared/input";
import { PageLoader } from "@/components/shared/loading-spinner";
import { ErrorMessage } from "@/components/shared/error-message";

const ROLES: { value: "owner" | "staff"; label: string }[] = [
  { value: "owner", label: "Owner" },
  { value: "staff", label: "Staff" },
];

const ROLE_LABELS: Record<string, string> = {
  admin: "System-Admin",
  owner: "Owner",
  staff: "Staff",
};

export default function SystemAdminsPage() {
  const [admins, setAdmins] = useState<AdminWithVenue[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<"create" | "edit" | "password" | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    venue_id: null as number | null,
    role: "owner" as AdminWithVenue["role"],
    is_active: true,
  });
  const [passwordForm, setPasswordForm] = useState({ newPassword: "", confirm: "" });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    Promise.all([listAdmins(), listVenues()])
      .then(([adminRes, venueRes]) => {
        if (adminRes.success && adminRes.data) setAdmins(adminRes.data);
        else setError(adminRes.message ?? "Fehler beim Laden.");
        if (venueRes.success && venueRes.data) setVenues(venueRes.data);
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setForm({
      email: "",
      password: "",
      name: "",
      venue_id: null,
      role: "owner",
      is_active: true,
    });
    setEditingId(null);
    setModal("create");
  };

  const openEdit = (a: AdminWithVenue) => {
    setEditingId(a.id);
    setForm({
      email: a.email,
      password: "",
      name: a.name,
      venue_id: a.venue_id,
      role: a.role,
      is_active: a.is_active,
    });
    setModal("edit");
  };

  const openPassword = (a: AdminWithVenue) => {
    setEditingId(a.id);
    setPasswordForm({ newPassword: "", confirm: "" });
    setModal("password");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modal === "create") {
        if (!form.password || form.password.length < 8) {
          toast.error("Passwort mindestens 8 Zeichen.");
          setSaving(false);
          return;
        }
        const res = await createAdmin({
          email: form.email,
          password: form.password,
          name: form.name,
          venue_id: form.venue_id,
          role: form.role === "owner" || form.role === "staff" ? form.role : "owner",
        });
        if (res.success) {
          toast.success("Admin erstellt.");
          setModal(null);
          load();
        } else toast.error(res.message ?? "Fehler.");
      } else if (modal === "edit" && editingId) {
        const res = await updateAdmin(editingId, {
          name: form.name,
          venue_id: form.venue_id,
          role: form.role === "owner" || form.role === "staff" ? form.role : undefined,
          is_active: form.is_active,
        });
        if (res.success) {
          toast.success("Admin aktualisiert.");
          setModal(null);
          setEditingId(null);
          load();
        } else toast.error(res.message ?? "Fehler.");
      }
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
    if (!editingId) return;
    setSaving(true);
    try {
      const res = await setAdminPassword(editingId, passwordForm.newPassword);
      if (res.success) {
        toast.success("Passwort geändert.");
        setModal(null);
        setEditingId(null);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[var(--color-text)]">
            Admins
          </h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Admin-Benutzer anlegen und Venues zuweisen.
          </p>
        </div>
        <Button variant="primary" onClick={openCreate}>
          Admin anlegen
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="pb-2 font-medium text-[var(--color-muted)]">E-Mail</th>
                <th className="pb-2 font-medium text-[var(--color-muted)]">Name</th>
                <th className="pb-2 font-medium text-[var(--color-muted)]">Rolle</th>
                <th className="pb-2 font-medium text-[var(--color-muted)]">Venue</th>
                <th className="pb-2 font-medium text-[var(--color-muted)]">Status</th>
                <th className="pb-2 font-medium text-[var(--color-muted)]">Aktion</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => (
                <tr key={a.id} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="py-2 text-[var(--color-text)]">{a.email}</td>
                  <td className="py-2 font-medium text-[var(--color-text)]">{a.name}</td>
                  <td className="py-2 text-[var(--color-muted)]">
                    {ROLE_LABELS[a.role] ?? a.role}
                  </td>
                  <td className="py-2 text-[var(--color-text)]">{a.venue_name ?? "–"}</td>
                  <td className="py-2">
                    <span className={a.is_active ? "text-green-600" : "text-[var(--color-muted)]"}>
                      {a.is_active ? "Aktiv" : "Inaktiv"}
                    </span>
                  </td>
                  <td className="py-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(a)}>
                      Bearbeiten
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-2"
                      onClick={() => openPassword(a)}
                    >
                      Passwort
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {modal === "create" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-md p-6">
            <h2 className="font-display text-lg font-semibold text-[var(--color-text)]">
              Admin anlegen
            </h2>
            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <Input
                label="E-Mail"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
              />
              <Input
                label="Passwort"
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                required
                minLength={8}
              />
              <Input
                label="Name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Venue</label>
                <select
                  value={form.venue_id ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      venue_id: e.target.value ? Number(e.target.value) : null,
                    }))
                  }
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-text)]"
                >
                  <option value="">– Keine –</option>
                  {venues.map((v) => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Rolle</label>
                <select
                  value={form.role}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, role: e.target.value as AdminWithVenue["role"] }))
                  }
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-text)]"
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" variant="primary" disabled={saving}>
                  {saving ? "Erstellen…" : "Erstellen"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setModal(null)}>
                  Abbrechen
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {modal === "edit" && editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-md p-6">
            <h2 className="font-display text-lg font-semibold text-[var(--color-text)]">
              Admin bearbeiten
            </h2>
            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <Input
                label="Name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Venue</label>
                <select
                  value={form.venue_id ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      venue_id: e.target.value ? Number(e.target.value) : null,
                    }))
                  }
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-text)]"
                >
                  <option value="">– Keine –</option>
                  {venues.map((v) => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Rolle</label>
                {form.role === "admin" ? (
                  <p className="py-2 text-sm text-[var(--color-muted)]">
                    System-Admin (Rolle nicht änderbar)
                  </p>
                ) : (
                  <select
                    value={form.role}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, role: e.target.value as "owner" | "staff" }))
                    }
                    className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-text)]"
                  >
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                )}
              </div>
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

      {modal === "password" && editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-md p-6">
            <h2 className="font-display text-lg font-semibold text-[var(--color-text)]">
              Passwort setzen
            </h2>
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
    </div>
  );
}
