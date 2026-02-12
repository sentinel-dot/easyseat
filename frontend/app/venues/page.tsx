import { Suspense } from "react";
import { SiteLayout } from "@/components/layout/site-layout";
import { VenuesContent } from "./venues-content";
import { PageLoader } from "@/components/shared/loading-spinner";

export const metadata = {
  title: "Orte finden – easyseat",
  description:
    "Restaurants und weitere Betriebe – Termin direkt buchen.",
};

export default function VenuesPage() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="text-2xl font-bold text-[var(--color-text)] sm:text-3xl">
          Restaurants & Orte
        </h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Wählen Sie einen Ort und buchen Sie Ihren Termin.
        </p>
        <Suspense fallback={<PageLoader />}>
          <VenuesContent />
        </Suspense>
      </div>
    </SiteLayout>
  );
}
