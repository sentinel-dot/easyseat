// app/components/booking-section.tsx
'use client'

import { useState } from 'react';
import { VenueWithStaff, Service } from '@/lib/types';
import { BookingCalendar } from '../venues/[id]/booking-calendar';

interface Props {
  venue: VenueWithStaff;
}

export function BookingSection({ venue }: Props) {
  return (
    <section id="buchung" className="py-12 sm:py-16 md:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
              Termin buchen
            </h2>
            <div className="w-24 h-1 bg-rose-600 mx-auto mb-3 sm:mb-4"></div>
            <p className="text-base sm:text-lg text-gray-600 px-2">
              Wählen Sie Ihren Wunschtermin und buchen Sie ganz einfach online
            </p>
          </div>

          <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-xl">
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
