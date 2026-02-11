import { getVenues } from "@/lib/api/venues";
import Link from "next/link";
import { VenuesContent } from "./venues-content";

export default async function VenuesPage() {
  let venues: { id: number; name: string; type: string; city?: string }[] = [];
  let error: string | null = null;

  try {
    const result = await getVenues();
    if (result.success && result.data) {
      venues = result.data;
    } else {
      error = result.message || result.error || "Venues konnten nicht geladen werden.";
    }
  } catch (e) {
    error = "Die Verbindung zum Server ist fehlgeschlagen. Bitte versuchen Sie es später erneut.";
  }

  return (
    <main className="min-h-screen bg-cream">
      <div className="container mx-auto px-4 py-10 md:py-16">
        <h1 className="font-serif text-3xl font-semibold text-foreground mb-8">Verfügbare Venues</h1>
        <VenuesContent venues={venues} error={error} />
      </div>
    </main>
  );
}
