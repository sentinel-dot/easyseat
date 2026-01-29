'use client';

import { useState } from 'react';
import { cancelBooking } from '@/lib/api/bookings';
import type { Booking } from '@/lib/types';

interface Props {
  booking: Booking;
  onCancelled?: (updatedBooking?: Booking) => void;
}

export function ManagementActions({ booking, onCancelled }: Props) {
  const [cancelling, setCancelling] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCancel = async () => {
    setCancelling(true);
    setError(null);
    try {
      const res = await cancelBooking(booking.booking_token);
      if (res.success && res.data) {
        setShowConfirm(false);
        onCancelled?.(res.data);
      } else {
        setError('Stornierung fehlgeschlagen. Bitte versuchen Sie es erneut.');
      }
    } catch {
      setError('Stornierung fehlgeschlagen. Bitte versuchen Sie es erneut.');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div>
      <h2 className="font-serif text-lg font-semibold text-foreground mb-3">Aktionen</h2>
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800">
          {error}
        </div>
      )}
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        disabled={cancelling}
        className="rounded-lg border border-red-300 bg-white px-4 py-2 text-red-700 hover:bg-red-50 transition disabled:opacity-50"
      >
        Termin stornieren
      </button>

      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-labelledby="cancel-title"
          aria-modal="true"
        >
          <div className="w-full max-w-sm rounded-xl bg-background p-6 shadow-lg border border-border">
            <h2 id="cancel-title" className="font-serif text-xl font-semibold text-foreground mb-2">
              Termin stornieren?
            </h2>
            <p className="text-muted text-sm mb-6">
              Möchten Sie diesen Termin wirklich stornieren? Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                disabled={cancelling}
                className="rounded-lg border border-border bg-background px-4 py-2 text-foreground hover:bg-offwhite transition disabled:opacity-50"
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={cancelling}
                className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 transition disabled:opacity-50"
              >
                {cancelling ? 'Wird storniert …' : 'Ja, stornieren'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
