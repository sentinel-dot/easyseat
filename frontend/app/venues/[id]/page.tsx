// app/venues/[id]/page.tsx
import { getVenueById } from '@/lib/api/venues';
import { notFound } from 'next/navigation';
import { BookingCalendar } from './booking-calendar';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function VenueDetailPage({ params }: PageProps) {
  const { id } = await params;
  const venueId = parseInt(id);

  
  if (isNaN(venueId)) {
    notFound();
  }

  const result = await getVenueById(venueId);
  
  if (!result.success || !result.data) {
    notFound();
  }

  const venue = result.data;

  return (
    <main className="container mx-auto px-4 py-8">
      {/* SERVER RENDERED - Statische Info */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">{venue.name}</h1>
        {venue.description && (
          <p className="text-gray-700 mb-4">{venue.description}</p>
        )}
        <div className="flex gap-4 text-sm text-gray-600">
          {venue.phone && <span>📞 {venue.phone}</span>}
          {venue.email && <span>✉️ {venue.email}</span>}
        </div>
      </div>

      {/* Services */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Unsere Services</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {venue.services.map((service) => (
            <div key={service.id} className="border rounded-lg p-4">
              <h3 className="font-semibold">{service.name}</h3>
              <p className="text-sm text-gray-600 mb-2">
                {service.duration_minutes} Minuten
              </p>
              {service.price && (
                <p className="font-bold text-blue-600">
                  {Number(service.price).toFixed(2)} €
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CLIENT COMPONENT - Interaktive Buchung */}
      <BookingCalendar 
        venue={venue}
        services={venue.services}
        staffMembers={venue.staff_members}
      />
    </main>
  );
}