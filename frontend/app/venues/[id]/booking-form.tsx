// app/venues/[id]/booking-form.tsx
'use client'

import { useState, useEffect } from 'react';
import { VenueWithStaff, Service, StaffMember, TimeSlot } from '@/lib/types';

interface Props {
  venue: VenueWithStaff;
  service: Service;
  date: string;
  staffMembers: StaffMember[];
}

export function BookingForm({ venue, service, date, staffMembers }: Props) {
  // Formular-State
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    party_size: 1,
    special_requests: '',
    staff_member_id: undefined as number | undefined,
  });

  // UI-State
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Verfügbare Mitarbeiter für diesen Service filtern
  const availableStaff = service.requires_staff 
    ? staffMembers.filter(sm => sm.id) // Hier könnte man noch staff_services abfragen
    : [];

  // Zeitslots laden wenn Datum gewählt wurde
  useEffect(() => {
    if (date) {
      fetchTimeSlots();
    }
  }, [date, service.id, formData.staff_member_id]);

  /**
   * Lädt verfügbare Zeitslots vom Backend
   */
  const fetchTimeSlots = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        venueId: venue.id.toString(),
        serviceId: service.id.toString(),
        date: date,
      });

      if (formData.staff_member_id) {
        params.append('staffMemberId', formData.staff_member_id.toString());
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/availability/day?${params}`
      );

      if (!response.ok) {
        throw new Error('Zeitslots konnten nicht geladen werden');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        setTimeSlots(result.data.time_slots || []);
      } else {
        setTimeSlots([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
      setTimeSlots([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Validiert das Formular vor dem Absenden
   */
  const validateForm = (): string | null => {
    if (!formData.customer_name.trim()) {
      return 'Bitte geben Sie Ihren Namen ein';
    }
    
    if (!formData.customer_email.trim()) {
      return 'Bitte geben Sie Ihre E-Mail-Adresse ein';
    }
    
    // Einfache E-Mail-Validierung
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.customer_email)) {
      return 'Bitte geben Sie eine gültige E-Mail-Adresse ein';
    }

    if (venue.require_phone && !formData.customer_phone.trim()) {
      return 'Bitte geben Sie Ihre Telefonnummer ein';
    }

    if (!selectedTimeSlot) {
      return 'Bitte wählen Sie eine Uhrzeit';
    }

    if (formData.party_size < 1 || formData.party_size > service.capacity) {
      return `Die Personenanzahl muss zwischen 1 und ${service.capacity} liegen`;
    }

    if (service.requires_staff && !formData.staff_member_id) {
      return 'Bitte wählen Sie einen Mitarbeiter';
    }

    return null;
  };

  /**
   * Sendet die Buchung an das Backend
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validierung
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const bookingData = {
        venue_id: venue.id,
        service_id: service.id,
        staff_member_id: formData.staff_member_id,
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone || undefined,
        booking_date: date,
        start_time: selectedTimeSlot!.start_time,
        end_time: selectedTimeSlot!.end_time,
        party_size: formData.party_size,
        special_requests: formData.special_requests || undefined,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/bookings`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bookingData),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Buchung konnte nicht erstellt werden');
      }

      // Erfolg!
      setSuccess(true);
      
      // Formular zurücksetzen
      setFormData({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        party_size: 1,
        special_requests: '',
        staff_member_id: undefined,
      });
      setSelectedTimeSlot(null);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setSubmitting(false);
    }
  };

  // Erfolgs-Nachricht anzeigen
  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-green-800 mb-2">
          ✓ Buchung erfolgreich!
        </h3>
        <p className="text-green-700 mb-4">
          Ihre Buchung wurde erfolgreich erstellt. Sie erhalten in Kürze eine
          Bestätigungs-E-Mail an {formData.customer_email}.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
        >
          Weitere Buchung erstellen
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Fehler-Anzeige */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Mitarbeiter-Auswahl (nur wenn Service Staff benötigt) */}
      {service.requires_staff && availableStaff.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-2">
            Mitarbeiter wählen *
          </label>
          <select
            value={formData.staff_member_id || ''}
            onChange={(e) => setFormData({
              ...formData,
              staff_member_id: e.target.value ? Number(e.target.value) : undefined
            })}
            className="w-full border rounded-lg p-2"
            required={service.requires_staff}
          >
            <option value="">Bitte wählen...</option>
            {availableStaff.map((staff) => (
              <option key={staff.id} value={staff.id}>
                {staff.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Zeitslot-Auswahl */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Uhrzeit wählen *
        </label>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Verfügbarkeiten werden geladen...</p>
          </div>
        ) : timeSlots.length === 0 ? (
          <div className="bg-gray-50 border rounded-lg p-4 text-center">
            <p className="text-gray-600">
              Für dieses Datum sind keine Zeitslots verfügbar.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {timeSlots.map((slot, index) => (
              <button
                key={index}
                type="button"
                onClick={() => slot.available && setSelectedTimeSlot(slot)}
                disabled={!slot.available}
                className={`
                  p-3 rounded-lg border-2 transition text-sm
                  ${!slot.available
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                    : selectedTimeSlot === slot
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white border-gray-300 hover:border-blue-500'
                  }
                `}
              >
                {slot.start_time}
                {!slot.available && (
                  <span className="block text-xs mt-1">Ausgebucht</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Personendaten */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Ihr Name *
        </label>
        <input
          type="text"
          value={formData.customer_name}
          onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
          className="w-full border rounded-lg p-2"
          placeholder="Max Mustermann"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          E-Mail-Adresse *
        </label>
        <input
          type="email"
          value={formData.customer_email}
          onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
          className="w-full border rounded-lg p-2"
          placeholder="max@beispiel.de"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Telefonnummer {venue.require_phone && '*'}
        </label>
        <input
          type="tel"
          value={formData.customer_phone}
          onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
          className="w-full border rounded-lg p-2"
          placeholder="+49 123 456789"
          required={venue.require_phone}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Anzahl Personen *
        </label>
        <input
          type="number"
          value={formData.party_size}
          onChange={(e) => setFormData({ ...formData, party_size: Number(e.target.value) })}
          className="w-full border rounded-lg p-2"
          min={1}
          max={service.capacity}
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Maximal {service.capacity} Personen
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Besondere Wünsche (optional)
        </label>
        <textarea
          value={formData.special_requests}
          onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
          className="w-full border rounded-lg p-2"
          rows={3}
          placeholder="Haben Sie besondere Wünsche oder Anmerkungen?"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={submitting || !selectedTimeSlot}
        className={`
          w-full py-3 px-4 rounded-lg font-semibold transition
          ${submitting || !selectedTimeSlot
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
          }
        `}
      >
        {submitting ? 'Wird gebucht...' : 'Verbindlich buchen'}
      </button>

      <p className="text-xs text-gray-500 text-center">
        Mit der Buchung akzeptieren Sie unsere AGB und Datenschutzerklärung
      </p>
    </form>
  );
}