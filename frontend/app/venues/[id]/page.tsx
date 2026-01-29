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
    <main className="min-h-screen bg-cream">
      <div className="container mx-auto px-4 py-10 md:py-16">
        <div className="mb-10">
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-foreground mb-4">{venue.name}</h1>
          {venue.description && (
            <p className="text-foreground/90 mb-4 max-w-2xl">{venue.description}</p>
          )}
          <div className="flex gap-6 text-sm text-muted">
            {venue.phone && <span>{venue.phone}</span>}
            {venue.email && <a href={`mailto:${venue.email}`} className="hover:text-primary transition">{venue.email}</a>}
          </div>
        </div>

        <div className="mb-10">
          <h2 className="font-serif text-2xl font-semibold text-foreground mb-6">Unsere Services</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {venue.services.map((service) => (
              <div key={service.id} className="border border-border bg-background p-5">
                <h3 className="font-medium text-foreground">{service.name}</h3>
                <p className="text-sm text-muted mt-1">
                  {service.duration_minutes} Minuten
                </p>
                {service.price && (
                  <p className="font-serif text-primary font-semibold mt-2">
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
      </div>
    </main>
  );
}