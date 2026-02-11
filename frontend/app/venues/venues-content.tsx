'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface VenueItem {
  id: number;
  name: string;
  type: string;
  city?: string;
}

interface VenuesContentProps {
  venues: VenueItem[];
  error: string | null;
}

export function VenuesContent({ venues, error }: VenuesContentProps) {
  const router = useRouter();

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-6 text-center max-w-xl mx-auto">
        <p className="text-red-800 mb-4">{error}</p>
        <button
          type="button"
          onClick={() => router.refresh()}
          className="inline-block bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-dark transition"
        >
          Erneut versuchen
        </button>
      </div>
    );
  }

  if (venues.length === 0) {
    return (
      <div className="rounded-lg bg-offwhite border border-border p-8 text-center text-muted">
        <p>Derzeit sind keine Venues verfügbar.</p>
        <Link href="/" className="mt-4 inline-block text-primary hover:underline font-medium">
          Zur Startseite
        </Link>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {venues.map((venue) => (
        <Link
          key={venue.id}
          href={`/venues/${venue.id}`}
          className="block border border-border bg-background p-6 hover:border-primary transition rounded-lg"
        >
          <h2 className="font-serif text-xl font-semibold text-foreground mb-2">{venue.name}</h2>
          <p className="text-muted mb-2">{venue.type}</p>
          {venue.city && <p className="text-sm text-muted">{venue.city}</p>}
        </Link>
      ))}
    </div>
  );
}
