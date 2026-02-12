"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateBooking } from "@/lib/api/bookings";
import { Button } from "@/components/shared/button";

type Props = {
  token: string;
  specialRequests: string;
  status: string;
};

export function ManageBookingNotes({
  token,
  specialRequests,
  status,
}: Props) {
  const router = useRouter();
  const [notes, setNotes] = useState(specialRequests);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const canEdit = status === "pending" || status === "confirmed";
  const hasChanges = notes !== specialRequests;

  const handleSave = async () => {
    if (!hasChanges) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      const res = await updateBooking(token, {
        special_requests: notes.trim() || "",
      });
      if (res.success) {
        toast.success("Notizen gespeichert.");
        router.refresh();
        setEditing(false);
      } else {
        toast.error(res.message ?? "Speichern fehlgeschlagen.");
      }
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (!canEdit && !specialRequests) return null;

  return (
    <div className="mt-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-sm)]">
      <h2 className="text-sm font-semibold text-[var(--color-text)]">
        Notizen / Anmerkungen
      </h2>
      {editing && canEdit ? (
        <>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="z. B. Wünsche, Hinweise für Ihren Termin"
            rows={3}
            className="mt-2 w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          />
          <div className="mt-3 flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setNotes(specialRequests);
                setEditing(false);
              }}
              disabled={saving}
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleSave}
              isLoading={saving}
              disabled={!hasChanges || saving}
            >
              Speichern
            </Button>
          </div>
        </>
      ) : (
        <>
          <p className="mt-1 text-sm text-[var(--color-text)]">
            {specialRequests || "Keine Notizen."}
          </p>
          {canEdit && (
            <Button
              variant="outline"
              className="mt-2"
              onClick={() => setEditing(true)}
            >
              Notizen bearbeiten
            </Button>
          )}
        </>
      )}
    </div>
  );
}
