// app/venues/[id]/booking-calendar.tsx
'use client'

import { useState } from 'react';
import { VenueWithStaff, Service, StaffMember } from '@/lib/types';
import { BookingForm } from './booking-form';

interface Props {
  venue: VenueWithStaff;
  services: Service[];
  staffMembers: StaffMember[];
}

export function BookingCalendar({ venue, services, staffMembers }: Props) {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  return (
    <div className="bg-white rounded-lg p-4 sm:p-6 md:p-8">
      <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-gray-900">Jetzt buchen</h2>

      {/* Service Auswahl */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Service wählen
        </label>
        <select
          value={selectedService?.id || ''}
          onChange={(e) => {
            const service = services.find(s => s.id === Number(e.target.value));
            setSelectedService(service || null);
          }}
          className="w-full border rounded-lg p-2"
        >
          <option value="">Bitte wählen...</option>
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name} ({service.duration_minutes} Min.)
            </option>
          ))}
        </select>
      </div>

      {/* Hier würde der Kalender/Zeitslots kommen */}
      {selectedService && (
        <>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Datum wählen
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full border border-gray-300 rounded-lg p-2 sm:p-3 text-sm sm:text-base focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition"
            />
          </div>

          {/* Formular einblenden wenn Datum gewählt */}
          {selectedDate && (
            <BookingForm
              venue={venue}
              service={selectedService}
              date={selectedDate}
              staffMembers={staffMembers}
            />
          )}
        </>
      )}
    </div>
  );
}