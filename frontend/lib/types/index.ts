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
  description?: string;
  website_url?: string;
}

export interface Service 
{
  id: number;
  venue_id: number;
  name: string;
  description?: string;
  duration_minutes: number;
  price?: number;
  capacity: number;
  requires_staff: boolean;
}

export interface StaffMember 
{
  id: number;
  venue_id: number;
  name: string;
  email?: string;
  phone?: string;
}

export interface VenueWithStaff extends Venue 
{
  services: Service[];
  staff_members: StaffMember[];
}

export interface TimeSlot 
{
  start_time: string;
  end_time: string;
  available: boolean;
  remaining_capacity: number;
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
}

export interface Booking extends CreateBookingData 
{
  id: number;
  booking_token: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
}