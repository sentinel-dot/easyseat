import { SiteLayout } from "@/components/layout/site-layout";
import { MyBookingsWrapper } from "./my-bookings-wrapper";

export const metadata = {
  title: "Meine Buchungen – easyseat",
  description: "Alle Ihre Buchungen im Überblick.",
};

export default function MyBookingsPage() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
        <h1 className="font-display text-2xl font-semibold text-[var(--color-text)] sm:text-3xl">
          Meine Buchungen
        </h1>
        <p className="mt-2 text-[var(--color-muted)]">
          Geben Sie Ihre E-Mail-Adresse ein, um alle Ihre Buchungen zu sehen. Oder melden Sie sich an, um Ihre Buchungen sicher in Ihrem Konto zu sehen.
        </p>
        <MyBookingsWrapper />
      </div>
    </SiteLayout>
  );
}
