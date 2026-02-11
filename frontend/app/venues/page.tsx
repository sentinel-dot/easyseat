import { Suspense } from "react";
import { SiteLayout } from "@/components/layout/site-layout";
import { VenuesContent } from "./venues-content";
import { PageLoader } from "@/components/shared/loading-spinner";

export const metadata = {
  title: "Orte finden – easyseat",
  description:
    "Restaurants, Friseure und weitere Betriebe – buchen Sie Ihren Termin.",
};

export default function VenuesPage() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <p className="text-sm font-medium uppercase tracking-wider text-[var(--color-accent)]">
          Buchbare Orte
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-[var(--color-text)] sm:text-4xl">
          Orte finden
        </h1>
        <p className="mt-2 text-[var(--color-text-soft)]">
          Wählen Sie eine Kategorie oder durchsuchen Sie alle Orte.
        </p>
        <Suspense fallback={<PageLoader />}>
          <VenuesContent />
        </Suspense>
      </div>
    </SiteLayout>
  );
}
