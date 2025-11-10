import { getVenues } from "@/lib/api/venues";
import Link from "next/link";

export default async function VenuesPage()
{
    const result = await getVenues();
    const venues = result.data || [];

    return (
        <main className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Verfügbare Venues</h1>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {venues.map((venue) => (
                    <Link
                        key={venue.id}
                        href={`/venues/${venue.id}`}
                        className="border rounded-lg p-6 hover:shadow-lg transition"    
                    >
                        <h2 className="text-xl font-semibold mb-2">{venue.name}</h2>
                        <p className="text-gray-600 mb-2">{venue.type}</p>
                        {venue.city && (
                            <p className="text-sm text-gray-500">{venue.city}</p>
                        )}
                    </Link>
                ))}
            </div>
        </main>
    );
}