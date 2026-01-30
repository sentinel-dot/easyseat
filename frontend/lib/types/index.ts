// lib/types/index.ts
export interface Venue 
{
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
    booking_advance_hours: number;         // Mindestvorlaufzeit für Kundenbuchungen (z.B. 48 Stunden)
    cancellation_hours: number;
    require_phone: boolean;
    require_deposit: boolean;
    deposit_amount?: number;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}
 
export interface Service 
{
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

export interface StaffMember 
{
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

export interface OpeningHoursSlot {
  day_of_week: number;
  start_time: string;
  end_time: string;
}

export interface VenueWithStaff extends Venue 
{
    staff_members: StaffMember[];
    services: Service[];
    opening_hours?: OpeningHoursSlot[];
}

export interface TimeSlot 
{
    start_time: string;
    end_time: string;
    available: boolean;
    staff_member_id?: number;
}

export interface DayAvailability 
{
    date: string;
    day_of_week: number;
    time_slots: TimeSlot[];
}

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

export interface Booking extends CreateBookingData
{
    id: number;
    booking_token: string;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
    deposit_paid?: number | null;                 
    payment_status?: string | null;
    confirmation_sent_at?: Date | null;
    reminder_sent_at?: Date | null;
    cancelled_at?: Date | null;
    cancellation_reason?: string | null;
    created_at: Date;
    updated_at: Date;
    /** Vom Backend bei getBookingByToken geliefert */
    venue_name?: string | null;
    cancellation_hours?: number | null;
    service_name?: string | null;
    staff_member_name?: string | null;
}

// Admin Types
export interface AdminUser {
    id: number;
    email: string;
    name: string;
    venue_id: number | null;
    role: 'owner' | 'admin' | 'staff';
}

export interface LoginResponse {
    token: string;
    user: AdminUser;
}

export interface AdminStats {
    bookings: {
        today: number;
        thisWeek: number;
        thisMonth: number;
        pending: number;
        confirmed: number;
        cancelled: number;
        completed: number;
    };
    revenue: {
        today: number;
        thisWeek: number;
        thisMonth: number;
        total: number;
    };
    popularServices: Array<{
        service_id: number;
        service_name: string;
        booking_count: number;
        total_revenue: number;
    }>;
    popularTimeSlots: Array<{
        hour: number;
        booking_count: number;
    }>;
}

export interface BookingWithDetails extends Booking {
    service_price?: number;
    service_duration?: number;
}

export interface AvailabilityRule {
    id: number;
    venue_id: number | null;
    staff_member_id: number | null;
    staff_member_name?: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
    is_active: boolean;
}