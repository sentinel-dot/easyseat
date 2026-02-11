"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cancelBooking } from "@/lib/api/bookings";
import { Button } from "@/components/shared/button";

type Props = {
  token: string;
  status: string;
  cancellationHours?: number;
};

export function ManageBookingActions({
  token,
  status,
  cancellationHours,
}: Props) {
  const router = useRouter();
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const canCancel =
    status === "pending" || status === "confirmed";

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const res = await cancelBooking(token, cancelReason || undefined);
      if (res.success) {
        toast.success("Buchung wurde storniert.");
        router.refresh();
        setShowCancelConfirm(false);
        setCancelReason("");
      } else {
        toast.error(res.message ?? "Stornierung fehlgeschlagen.");
      }
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setCancelling(false);
    }
  };

  if (!canCancel) return null;

  return (
    <div className="mt-6">
      {!showCancelConfirm ? (
        <Button
          variant="outline"
          className="border-red-200 text-red-700 hover:bg-red-50"
          onClick={() => setShowCancelConfirm(true)}
        >
          Buchung stornieren
        </Button>
      ) : (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <p className="text-sm text-[var(--color-text)]">
            Möchten Sie diese Buchung wirklich stornieren?
            {cancellationHours != null && cancellationHours > 0 && (
              <span className="mt-1 block text-[var(--color-muted)]">
                Bitte mindestens {cancellationHours} Stunden vor dem Termin
                stornieren.
              </span>
            )}
          </p>
          <div className="mt-3">
            <label className="mb-1 block text-sm text-[var(--color-muted)]">
              Grund (optional)
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="z. B. Termin passt nicht mehr"
              rows={2}
              className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            />
          </div>
          <div className="mt-4 flex gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                setShowCancelConfirm(false);
                setCancelReason("");
              }}
            >
              Abbrechen
            </Button>
            <Button
              className="border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
              onClick={handleCancel}
              isLoading={cancelling}
            >
              Ja, stornieren
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
