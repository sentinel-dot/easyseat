'use client';

import Link from 'next/link';
import type { VenueWithStaff } from '@/lib/types';

const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0] as const;
const DAY_NAMES: Record<number, string> = {
  0: 'Sonntag',
  1: 'Montag',
  2: 'Dienstag',
  3: 'Mittwoch',
  4: 'Donnerstag',
  5: 'Freitag',
  6: 'Samstag',
};

function formatOpeningHours(venue: VenueWithStaff): { day: string; slots: string }[] {
  const hours = venue.opening_hours ?? [];
  if (hours.length === 0) return [];

  const byDay: Record<number, { start: string; end: string }[]> = {};
  for (const s of hours) {
    (byDay[s.day_of_week] ??= []).push({ start: s.start_time, end: s.end_time });
  }

  return DAY_ORDER.filter((d) => byDay[d]?.length).map((d) => {
    const slots = byDay[d]
      .map((s) => `${s.start}–${s.end} Uhr`)
      .join(', ');
    return { day: DAY_NAMES[d], slots };
  });
}

function formatAddress(venue: VenueWithStaff): string {
  const location = [venue.postal_code, venue.city].filter(Boolean).join(' ').trim();
  const parts = [venue.address, location].filter(Boolean);
  return parts.join(', ') || '—';
}

interface FooterProps {
  venue?: VenueWithStaff | null;
}

export function Footer({ venue }: FooterProps) {
  const siteName = venue?.name ?? 'EasySeat';
  const openingHours = venue ? formatOpeningHours(venue) : [];

  return (
    <footer className="bg-primary-dark text-offwhite py-10 sm:py-14">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-10 mb-8 sm:mb-10">
          <div>
            <h3 className="font-serif text-lg font-semibold text-cream mb-4">Kontakt</h3>
            {venue ? (
              <>
                <p className="mb-2 text-sm text-offwhite/90">
                  <span className="text-cream/80">Studio:</span> {formatAddress(venue)}
                </p>
                {venue.phone && (
                  <p className="mb-2 text-sm text-offwhite/90">
                    <span className="text-cream/80">Telefon:</span>{' '}
                    <a href={`tel:${venue.phone}`} className="hover:text-accent-light transition">
                      {venue.phone}
                    </a>
                  </p>
                )}
                <p className="mb-2 text-sm text-offwhite/90">
                  <span className="text-cream/80">E-Mail:</span>{' '}
                  <a href={`mailto:${venue.email}`} className="hover:text-accent-light transition">
                    {venue.email}
                  </a>
                </p>
              </>
            ) : (
              <p className="text-sm text-offwhite/70">Kontaktdaten werden geladen…</p>
            )}
          </div>

          <div>
            <h3 className="font-serif text-lg font-semibold text-cream mb-4">Öffnungszeiten</h3>
            {openingHours.length > 0 ? (
              openingHours.map(({ day, slots }) => (
                <p key={day} className="mb-2 text-sm text-offwhite/90">
                  {day}: {slots}
                </p>
              ))
            ) : venue ? (
              <p className="text-sm text-offwhite/70">Keine Öffnungszeiten hinterlegt.</p>
            ) : (
              <p className="text-sm text-offwhite/70">Öffnungszeiten werden geladen…</p>
            )}
          </div>

          <div className="sm:col-span-2 md:col-span-1">
            <h3 className="font-serif text-lg font-semibold text-cream mb-4">Rechtliches</h3>
            <p className="mb-2 text-sm">
              <Link href="/impressum" className="text-offwhite/90 hover:text-accent-light transition">Impressum</Link>
            </p>
            <p className="mb-2 text-sm">
              <Link href="/datenschutz" className="text-offwhite/90 hover:text-accent-light transition">Datenschutz</Link>
            </p>
            <p className="text-sm">
              <Link href="/agb" className="text-offwhite/90 hover:text-accent-light transition">AGB</Link>
            </p>
          </div>
        </div>

        <div className="border-t border-primary pt-6 text-center">
          <p className="text-offwhite/60 text-xs sm:text-sm">
            © {new Date().getFullYear()} {siteName}. Alle Rechte vorbehalten.
          </p>
        </div>
      </div>
    </footer>
  );
}
