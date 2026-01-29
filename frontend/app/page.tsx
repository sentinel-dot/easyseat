// app/page.tsx
import { getVenueById } from '@/lib/api/venues';
import { HeroSection } from './components/hero-section';
import { AboutSection } from './components/about-section';
import { ServiceInfoSection } from './components/service-info-section';
import { BookingSection } from './components/booking-section';
import { PricingSection } from './components/pricing-section';

export default async function HomePage() {
  // Hole Venue-Daten (ID 3 = das Studio)
  // Falls noch nicht vorhanden, wird null zurückgegeben
  let venue = null;
  try {
    const result = await getVenueById(3);
    if (result.success && result.data) {
      venue = result.data;
    }
  } catch (error) {
    console.error('Could not load venue data:', error);
  }

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Über sie */}
      <AboutSection />

      {/* Services */}
      <ServiceInfoSection />

      {/* Buchungsbereich */}
      {venue ? (
        <>
          <BookingSection venue={venue} />
          <PricingSection services={venue.services} />
        </>
      ) : (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 text-center">
            <p className="text-muted">
              Die Buchungsfunktion wird geladen... Bitte stellen Sie sicher, dass das Backend läuft und die Venue-Daten vorhanden sind.
            </p>
          </div>
        </section>
      )}
    </main>
  );
}
