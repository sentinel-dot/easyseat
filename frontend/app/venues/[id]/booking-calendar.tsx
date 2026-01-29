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
    <div className="p-0">
      <h2 className="font-serif text-xl font-semibold text-foreground mb-6">Jetzt buchen</h2>

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
          className="w-full border border-border p-2 sm:p-3 bg-background focus:ring-2 focus:ring-primary focus:border-primary transition"
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
              className="w-full border border-border p-2 sm:p-3 text-sm sm:text-base focus:ring-2 focus:ring-primary focus:border-primary transition bg-background"
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