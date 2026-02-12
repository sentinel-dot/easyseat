"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { getServices, updateService } from "@/lib/api/dashboard";
import type { Service } from "@/lib/types";
import { Card, CardTitle } from "@/components/shared/card";
import { Button } from "@/components/shared/button";
import { Input } from "@/components/shared/input";
import { PageLoader } from "@/components/shared/loading-spinner";
import { ErrorMessage } from "@/components/shared/error-message";

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    description: string;
    duration_minutes: number;
    price: number;
    is_active: boolean;
  }>({ name: "", description: "", duration_minutes: 30, price: 0, is_active: true });

  const loadServices = useCallback(() => {
    setLoading(true);
    setError(null);
    getServices()
      .then((res) => {
        if (res.success && res.data) setServices(res.data);
        else setError(res.message ?? "Fehler beim Laden.");
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const startEdit = (s: Service) => {
    setEditingId(s.id);
    setEditForm({
      name: s.name,
      description: s.description ?? "",
      duration_minutes: s.duration_minutes,
      price: s.price ?? 0,
      is_active: s.is_active,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async () => {
    if (editingId == null) return;
    setSavingId(editingId);
    try {
      const res = await updateService(editingId, {
        name: editForm.name.trim(),
        description: editForm.description.trim() || undefined,
        duration_minutes: editForm.duration_minutes,
        price: editForm.price,
        is_active: editForm.is_active,
      });
      if (res.success) {
        toast.success("Leistung aktualisiert.");
        setEditingId(null);
        loadServices();
      } else {
        toast.error(res.message ?? "Speichern fehlgeschlagen.");
      }
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSavingId(null);
    }
  };

  if (error) {
    return <ErrorMessage message={error} onRetry={loadServices} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-[var(--color-text)]">
          Leistungen
        </h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Leistungen bearbeiten: Name, Beschreibung, Dauer, Preis und Aktiv-Status.
        </p>
      </div>

      {loading ? (
        <PageLoader />
      ) : services.length === 0 ? (
        <Card className="py-12 text-center text-[var(--color-muted)]">
          Keine Leistungen angelegt. Leistungen werden in den Venue-Einstellungen verwaltet.
        </Card>
      ) : (
        <ul className="space-y-4">
          {services.map((s) => (
            <li key={s.id}>
              <Card className="p-6">
                {editingId === s.id ? (
                  <div className="space-y-4">
                    <CardTitle className="text-base">Leistung bearbeiten</CardTitle>
                    <Input
                      label="Name"
                      value={editForm.name}
                      onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="z. B. Haarschnitt"
                      required
                    />
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
                        Beschreibung (optional)
                      </label>
                      <textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                        placeholder="Kurze Beschreibung"
                        rows={2}
                        className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2 text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input
                        label="Dauer (Minuten)"
                        type="number"
                        min={1}
                        value={editForm.duration_minutes || ""}
                        onChange={(e) =>
                          setEditForm((f) => ({ ...f, duration_minutes: parseInt(e.target.value, 10) || 0 }))
                        }
                      />
                      <Input
                        label="Preis (€)"
                        type="number"
                        min={0}
                        step={0.01}
                        value={editForm.price || ""}
                        onChange={(e) =>
                          setEditForm((f) => ({ ...f, price: parseFloat(e.target.value) || 0 }))
                        }
                      />
                    </div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editForm.is_active}
                        onChange={(e) => setEditForm((f) => ({ ...f, is_active: e.target.checked }))}
                        className="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                      />
                      <span className="text-sm text-[var(--color-text)]">Aktiv (für Kunden buchbar)</span>
                    </label>
                    <div className="flex gap-3 pt-2">
                      <Button size="sm" onClick={saveEdit} isLoading={savingId === s.id}>
                        Speichern
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEdit} disabled={savingId === s.id}>
                        Abbrechen
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-[var(--color-text)]">{s.name}</h3>
                        {!s.is_active && (
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                            Inaktiv
                          </span>
                        )}
                      </div>
                      {s.description && (
                        <p className="mt-1 text-sm text-[var(--color-muted)]">{s.description}</p>
                      )}
                      <p className="mt-2 text-sm text-[var(--color-text)]">
                        {s.duration_minutes} Min.
                        {s.price != null && Number(s.price) > 0 && ` · ${Number(s.price).toFixed(2)} €`}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => startEdit(s)}>
                      Bearbeiten
                    </Button>
                  </div>
                )}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
