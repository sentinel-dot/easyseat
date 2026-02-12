"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { getAvailabilityRules, updateAvailabilityRule } from "@/lib/api/dashboard";
import type { AvailabilityRule } from "@/lib/types";
import { Card, CardTitle } from "@/components/shared/card";
import { Button } from "@/components/shared/button";
import { PageLoader } from "@/components/shared/loading-spinner";
import { ErrorMessage } from "@/components/shared/error-message";

const DAY_NAMES: Record<number, string> = {
  0: "Sonntag",
  1: "Montag",
  2: "Dienstag",
  3: "Mittwoch",
  4: "Donnerstag",
  5: "Freitag",
  6: "Samstag",
};

export default function AdminAvailabilityPage() {
  const [rules, setRules] = useState<AvailabilityRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{
    start_time: string;
    end_time: string;
    is_active: boolean;
  }>({ start_time: "09:00", end_time: "18:00", is_active: true });

  const loadRules = useCallback(() => {
    setLoading(true);
    setError(null);
    getAvailabilityRules()
      .then((res) => {
        if (res.success && res.data) setRules(res.data);
        else setError(res.message ?? "Fehler beim Laden.");
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadRules();
  }, [loadRules]);

  const startEdit = (r: AvailabilityRule) => {
    setEditingId(r.id);
    setEditForm({
      start_time: r.start_time?.slice(0, 5) ?? "09:00",
      end_time: r.end_time?.slice(0, 5) ?? "18:00",
      is_active: r.is_active,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async () => {
    if (editingId == null) return;
    setSavingId(editingId);
    try {
      const res = await updateAvailabilityRule(editingId, {
        start_time: editForm.start_time,
        end_time: editForm.end_time,
        is_active: editForm.is_active,
      });
      if (res.success) {
        toast.success("Verfügbarkeit aktualisiert.");
        setEditingId(null);
        loadRules();
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
    return <ErrorMessage message={error} onRetry={loadRules} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-[var(--color-text)]">
          Verfügbarkeit
        </h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Öffnungszeiten und Zeitslots, in denen Kunden buchen können.
        </p>
      </div>

      {loading ? (
        <PageLoader />
      ) : rules.length === 0 ? (
        <Card className="py-12 text-center text-[var(--color-muted)]">
          Keine Verfügbarkeitsregeln angelegt.
        </Card>
      ) : (
        <ul className="space-y-4">
          {rules
            .slice()
            .sort((a, b) => a.day_of_week - b.day_of_week || a.start_time.localeCompare(b.start_time))
            .map((r) => (
              <li key={r.id}>
                <Card className="p-6">
                  {editingId === r.id ? (
                    <div className="space-y-4">
                      <CardTitle className="text-base">
                        {DAY_NAMES[r.day_of_week] ?? `Tag ${r.day_of_week}`}
                        {r.staff_member_name && ` · ${r.staff_member_name}`}
                      </CardTitle>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="block text-sm font-medium text-[var(--color-text)]">
                          Von
                        </label>
                        <input
                          type="time"
                          value={editForm.start_time}
                          onChange={(e) =>
                            setEditForm((f) => ({ ...f, start_time: e.target.value }))
                          }
                          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                        />
                        <label className="block text-sm font-medium text-[var(--color-text)] sm:col-start-1">
                          Bis
                        </label>
                        <input
                          type="time"
                          value={editForm.end_time}
                          onChange={(e) =>
                            setEditForm((f) => ({ ...f, end_time: e.target.value }))
                          }
                          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                        />
                      </div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editForm.is_active}
                          onChange={(e) =>
                            setEditForm((f) => ({ ...f, is_active: e.target.checked }))
                          }
                          className="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                        />
                        <span className="text-sm text-[var(--color-text)]">Aktiv</span>
                      </label>
                      <div className="flex gap-3 pt-2">
                        <Button size="sm" onClick={saveEdit} isLoading={savingId === r.id}>
                          Speichern
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit} disabled={savingId === r.id}>
                          Abbrechen
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-[var(--color-text)]">
                            {DAY_NAMES[r.day_of_week] ?? `Tag ${r.day_of_week}`}
                          </h3>
                          {r.staff_member_name && (
                            <span className="text-sm text-[var(--color-muted)]">
                              · {r.staff_member_name}
                            </span>
                          )}
                          {!r.is_active && (
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                              Inaktiv
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-[var(--color-muted)]">
                          {r.start_time} – {r.end_time}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => startEdit(r)}>
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
