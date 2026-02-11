'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getBookingByToken } from '@/lib/api/bookings';
import { isNetworkError, NETWORK_ERROR_MESSAGE } from '@/lib/api/client';
import { getStatusColor, getStatusLabel } from '@/lib/utils/bookingStatus';
import { ManagementActions } from './management-actions';
import type { Booking } from '@/lib/types';

export default function ManageBookingPage() {
  const params = useParams();
  const token = typeof params.token === 'string' ? params.token : '';
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(!!token);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    getBookingByToken(token)
      .then((res) => {
        if (res.success && res.data) setBooking(res.data);
        else setError('Buchung konnte nicht geladen werden.');
      })
      .catch((err) => setError(isNetworkError(err) ? NETWORK_ERROR_MESSAGE : 'Buchung konnte nicht geladen werden.'))
      .finally(() => setLoading(false));
  }, [token]);

  if (!token) {
    return (
      <main className="min-h-screen bg-cream">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="font-serif text-2xl font-semibold text-foreground mb-4">Link ungültig</h1>
          <p className="text-muted mb-6">Dieser Link ist ungültig.</p>
          <Link href="/" className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition">
            Zur Startseite
          </Link>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-cream">
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="mt-4 text-muted">Buchung wird geladen …</p>
        </div>
      </main>
    );
  }

  if (error || !booking) {
    return (
      <main className="min-h-screen bg-cream">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="font-serif text-2xl font-semibold text-foreground mb-4">Buchung nicht gefunden</h1>
          <p className="text-muted mb-6">{error ?? 'Diese Buchung existiert nicht oder der Link ist abgelaufen.'}</p>
          <Link href="/" className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition">
            Zur Startseite
          </Link>
        </div>
      </main>
    );
  }

  const dateFormatted = new Date(booking.booking_date + 'T12:00:00').toLocaleDateString('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const isCancelled = booking.status === 'cancelled';
  const isCompleted = booking.status === 'completed';
  const canCancel = !isCancelled && !isCompleted;

  return (
    <main className="min-h-screen bg-cream">
      <div className="container mx-auto px-4 py-16 max-w-xl">
        <div className="bg-background border border-border rounded-xl p-6 sm:p-8 shadow-sm">
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-foreground mb-6">
            Ihr Termin
          </h1>

          {isCancelled && (
            <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-red-800">
              <p className="font-medium">Dieser Termin wurde storniert.</p>
            </div>
          )}

          <dl className="space-y-3">
            {booking.service_name && (
              <div>
                <dt className="text-sm text-muted">Service</dt>
                <dd className="font-medium text-foreground">{booking.service_name}</dd>
              </div>
            )}
            {booking.staff_member_name && (
              <div>
                <dt className="text-sm text-muted">Mitarbeiter</dt>
                <dd className="font-medium text-foreground">{booking.staff_member_name}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm text-muted">Datum</dt>
              <dd className="font-medium text-foreground">{dateFormatted}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted">Uhrzeit</dt>
              <dd className="font-medium text-foreground">
                {booking.start_time} – {booking.end_time} Uhr
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted">Name</dt>
              <dd className="font-medium text-foreground">{booking.customer_name}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted">E-Mail</dt>
              <dd className="font-medium text-foreground">{booking.customer_email}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted">Status</dt>
              <dd>
                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                  {getStatusLabel(booking.status)}
                </span>
              </dd>
            </div>
            {booking.customer_phone && (
              <div>
                <dt className="text-sm text-muted">Telefon</dt>
                <dd className="font-medium text-foreground">{booking.customer_phone}</dd>
              </div>
            )}
          </dl>

          {canCancel && (
            <div className="mt-8 pt-6 border-t border-border">
              <ManagementActions
                booking={booking}
                onCancelled={(updated) => updated && setBooking(updated)}
              />
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-border">
            <Link
              href="/"
              className="text-primary hover:underline font-medium"
            >
              ← Zur Startseite
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
