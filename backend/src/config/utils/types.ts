
export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
}


// Service Types
export interface Service {
  id: number;
  business_id: number;
  name: string;
  description?: string;
  duration_minutes: number;
  price?: number;
  capacity: number;
  requires_staff: boolean;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}


// Staff-Member Types
export interface StaffMember {
  id: number;
  business_id: number;
  name: string;
  email?: string;
  phone?: string;
  description?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}


// Venue Types
export interface Venue {
    id: number;
    name: string;
    type: 'restaurant' | 'hair_salon' | 'beauty_salon' | 'massage' | 'other';
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    postal_code?: string;
    country: string;
    description?: string;
    website_url?: string;
    booking_advance_days: number;
    cancellation_hours: number;
    require_phone: boolean;
    require_deposit: boolean;
    deposit_amount?: number;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface VenueWithStaff extends Venue {
  staff_members: StaffMember[];
  services: Service[];
}


// Availability Types
export interface TimeSlot {
  start_time: string;
  end_time: string;
  available: boolean;
  staff_member_id?: number;
}

export interface DayAvailability {
  date: string;
  day_of_week: number;
  time_slots: TimeSlot[];
}


// Booking Types

/**
 * Interface für eine Buchung
 * Definiert die Struktur einer Buchung in der Datenbank
 */
export interface Booking 
{
  id: number;
  venue_id: number;
  service_id: number;
  staff_member_id?: number | null;              // Optional: Nur bei Services die Mitarbeiter benötigen
  customer_name: string;
  customer_email: string;
  customer_phone?: string | null;
  booking_date: string;                         // Format: YYYY-MM-DD
  start_time: string;                           // Format: HH:MM
  end_time: string;                             // Format: HH:MM
  party_size: number;                           // Anzahl Personen
  special_requests?: string | null;             // Besondere Wünsche des Kunden
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  total_amount?: number | null;                 // Gesamtpreis
  deposit_paid?: number | null;                 // Anzahlung
  payment_status?: string | null;
  confirmation_sent_at?: Date | null;
  reminder_sent_at?: Date | null;
  cancelled_at?: Date | null;
  cancellation_reason?: string | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Interface für das Erstellen einer neuen Buchung
 * Enthält nur die Felder, die vom Client gesendet werden müssen
 */
export interface CreateBookingData
{
    venue_id: number;
    service_id: number;
    staff_member_id?: number;
    customer_name: string;
    customer_email: string;
    customer_phone?: string;
    booking_date: string;
    start_time: string;
    end_time: string;
    party_size: number;
    special_requests?: string;
    total_amount?: number;
}

/**
 * Interface für das aktualisieren einer Buchung
 * Alle Felder sind optional, nur die geänderten Werte müssen gesendet werden
 */
export interface UpdateBookingData
{
    booking_date?: string;
    start_time?: string;
    end_time?: string;
    party_size?: number;
    staff_member_id?: number; 
    special_requests?: string;
    status?: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
    cancellation_reason?: string;
}