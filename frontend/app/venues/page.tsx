import { Suspense } from "react";
import { SiteLayout } from "@/components/layout/site-layout";
import { VenuesContent } from "./venues-content";
import { PageLoader } from "@/components/shared/loading-spinner";

export const metadata = {
  title: "Orte finden – easyseat",
  description: "Restaurants, Friseure und weitere Betriebe – buchen Sie Ihren Termin.",
};

export default function VenuesPage() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <h1 className="font-display text-3xl text-[var(--color-text)]">
          Orte finden
        </h1>
        <p className="mt-2 text-[var(--color-muted)]">
          Wählen Sie eine Kategorie oder durchsuchen Sie alle Orte.
        </p>
        <Suspense fallback={<PageLoader />}>
          <VenuesContent />
        </Suspense>
      </div>
    </SiteLayout>
  );
}
