'use client';

import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { cancelBooking } from '@/lib/api/bookings';
import { isNetworkError, NETWORK_ERROR_MESSAGE } from '@/lib/api/client';
import type { Booking } from '@/lib/types';

interface Props {
  booking: Booking;
  onCancelled?: (updatedBooking?: Booking) => void;
}

/** Prüft, ob die Stornierungsfrist noch eingehalten werden kann (Frontend-Vorprüfung). */
function useCancellationPolicyBlock(booking: Booking): { blocked: boolean; message: string | null } {
  return useMemo(() => {
    const hours = booking.cancellation_hours;
    if (hours == null || hours === undefined) return { blocked: false, message: null };
    const start = new Date(`${booking.booking_date}T${booking.start_time}`).getTime();
    const now = Date.now();
    const hoursUntilBooking = (start - now) / (1000 * 60 * 60);
    if (hoursUntilBooking >= hours) return { blocked: false, message: null };
    const remaining = Math.max(0, Math.round(hoursUntilBooking));
    return {
      blocked: true,
      message: `Eine Stornierung ist nur mindestens ${hours} Stunden im Voraus möglich. Es bleiben nur noch ${remaining} Stunden.`,
    };
  }, [booking.booking_date, booking.start_time, booking.cancellation_hours]);
}

export function ManagementActions({ booking, onCancelled }: Props) {
  const [cancelling, setCancelling] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { blocked: cancellationBlocked, message: cancellationBlockMessage } = useCancellationPolicyBlock(booking);

  const handleCancel = async () => {
    setCancelling(true);
    setError(null);
    try {
      const res = await cancelBooking(booking.booking_token);
      if (res.success && res.data) {
        setShowConfirm(false);
        toast.success('Termin wurde storniert.');
        onCancelled?.(res.data);
      } else {
        setError(res.message || 'Stornierung fehlgeschlagen. Bitte versuchen Sie es erneut.');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : null;
      setShowConfirm(false); // Box schließen, Fehler wird auf der Manage-Seite angezeigt
      if (msg?.includes('hours in advance') || msg?.includes('hours remaining') || msg?.includes('Cancellation must be made')) {
        const match = msg.match(/at least (\d+) hours in advance.*?Only (\d+) hours remaining/i)
          || msg.match(/at least (\d+) hours.*?Only (\d+) hours/i);
        if (match) {
          setError(
            `Eine Stornierung ist nur mindestens ${match[1]} Stunden im Voraus möglich. Es bleiben nur noch ${match[2]} Stunden.`
          );
        } else {
          setError(
            'Eine Stornierung ist nur innerhalb der Stornierungsfrist möglich. Der Termin liegt zu nah.'
          );
        }
      } else if (msg?.includes('already cancelled')) {
        setError('Diese Buchung ist bereits storniert.');
      } else if (msg?.includes('Cannot cancel completed')) {
        setError('Ein bereits durchgeführter Termin kann nicht mehr storniert werden.');
      } else if (msg === 'Failed to cancel booking' || !msg) {
        setError('Stornierung fehlgeschlagen. Bitte versuchen Sie es erneut.');
      } else if (isNetworkError(err)) {
        setError(NETWORK_ERROR_MESSAGE);
      } else {
        setError(msg);
      }
    } finally {
      setCancelling(false);
    }
  };

  const cannotCancel = cancellationBlocked;

  return (
    <div>
      <h2 className="font-serif text-lg font-semibold text-foreground mb-3">Aktionen</h2>
      {(cancellationBlockMessage || error) && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800">
          {cancellationBlockMessage ?? error}
        </div>
      )}
      <button
        type="button"
        onClick={() => !cannotCancel && setShowConfirm(true)}
        disabled={cancelling || cannotCancel}
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
            <p className="text-muted text-sm mb-4">
              Möchten Sie diesen Termin wirklich stornieren? Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800">
                {error}
              </div>
            )}
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
