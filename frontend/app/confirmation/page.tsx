'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { getBookingByToken } from '@/lib/api/bookings';
import { isNetworkError, NETWORK_ERROR_MESSAGE } from '@/lib/api/client';
import { getStatusColor, getStatusLabel } from '@/lib/utils/bookingStatus';
import type { Booking } from '@/lib/types';

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
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
          <h1 className="font-serif text-2xl font-semibold text-foreground mb-4">
            Link ungültig
          </h1>
          <p className="text-muted mb-6">
            Dieser Bestätigungslink ist ungültig oder abgelaufen. Bitte nutzen Sie den Link aus Ihrer Buchungsbestätigung.
          </p>
          <Link
            href="/"
            className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition"
          >
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
          <h1 className="font-serif text-2xl font-semibold text-foreground mb-4">
            Buchung nicht gefunden
          </h1>
          <p className="text-muted mb-6">{error ?? 'Diese Buchung existiert nicht oder der Link ist abgelaufen.'}</p>
          <Link
            href="/"
            className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition"
          >
            Zur Startseite
          </Link>
        </div>
      </main>
    );
  }

  const manageUrl = `/bookings/manage/${booking.booking_token}`;
  const dateFormatted = new Date(booking.booking_date + 'T12:00:00').toLocaleDateString('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <main className="min-h-screen bg-cream">
      <div className="container mx-auto px-4 py-16 max-w-xl">
        <div className="bg-background border border-border rounded-xl p-6 sm:p-8 shadow-sm">
          <div className="text-center mb-8">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600 mb-4">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-foreground">
              Buchung erfolgreich
            </h1>
            <p className="text-muted mt-2">
              Vielen Dank, {booking.customer_name}. Ihre Buchung ist bestätigt.
            </p>
          </div>

          <dl className="space-y-3 border-t border-border pt-6">
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
          </dl>

          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-sm text-muted mb-4">
              Sie können Ihren Termin jederzeit über den folgenden Link ändern oder stornieren. Bewahren Sie den Link sicher auf.
            </p>
            <Link
              href={manageUrl}
              className="block w-full text-center bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition font-medium"
            >
              Termin verwalten
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-cream flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </main>
      }
    >
      <ConfirmationContent />
    </Suspense>
  );
}
