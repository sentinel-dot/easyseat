'use client'

import { VenueWithStaff } from '@/lib/types';
import { BookingCalendar } from '../venues/[id]/booking-calendar';

interface Props {
  venue: VenueWithStaff;
}

export function BookingSection({ venue }: Props) {
  return (
    <section id="buchung" className="py-16 md:py-24 bg-cream border-b border-border">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-foreground mb-3">
            Termin buchen
          </h2>
          <p className="text-muted mb-10">
            Wählen Sie Ihren Wunschtermin und buchen Sie online
          </p>

          <div className="bg-background border border-border p-4 sm:p-6 md:p-8">
            <BookingCalendar
              venue={venue}
              services={venue.services}
              staffMembers={venue.staff_members}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
