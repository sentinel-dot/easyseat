import { getVenues } from "@/lib/api/venues";
import Link from "next/link";

export default async function VenuesPage() {
  const result = await getVenues();
  const venues = result.data || [];

  return (
    <main className="min-h-screen bg-cream">
      <div className="container mx-auto px-4 py-10 md:py-16">
        <h1 className="font-serif text-3xl font-semibold text-foreground mb-8">Verfügbare Venues</h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {venues.map((venue) => (
            <Link
              key={venue.id}
              href={`/venues/${venue.id}`}
              className="block border border-border bg-background p-6 hover:border-primary transition"
            >
              <h2 className="font-serif text-xl font-semibold text-foreground mb-2">{venue.name}</h2>
              <p className="text-muted mb-2">{venue.type}</p>
              {venue.city && (
                <p className="text-sm text-muted">{venue.city}</p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
