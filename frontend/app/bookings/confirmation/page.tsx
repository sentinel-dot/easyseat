import Link from "next/link";
import { SiteLayout } from "@/components/layout/site-layout";

type Props = { searchParams: Promise<{ token?: string }> };

export const metadata = {
  title: "Buchungsanfrage gesendet – easyseat",
  description: "Ihre Buchungsanfrage wurde übermittelt.",
};

export default async function ConfirmationPage({ searchParams }: Props) {
  const { token } = await searchParams;

  return (
    <SiteLayout>
      <div className="mx-auto max-w-xl px-4 py-16 text-center sm:px-6">
        <h1 className="font-display text-3xl text-[var(--color-text)]">
          Vielen Dank
        </h1>
        <p className="mt-4 text-[var(--color-muted)]">
          Ihre Buchungsanfrage wurde gesendet. Das Unternehmen wird Sie
          zeitnah per E-Mail bestätigen oder bei Rückfragen kontaktieren.
        </p>
        {token && (
          <p className="mt-6 text-sm text-[var(--color-muted)]">
            Sie können Ihre Buchung jederzeit einsehen oder stornieren:
          </p>
        )}
        {token && (
          <div className="mt-4">
            <Link
              href={`/bookings/manage/${token}`}
              className="inline-flex h-11 items-center justify-center rounded-lg bg-[var(--color-accent)] px-5 text-sm font-medium text-white hover:bg-[var(--color-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
            >
              Meine Buchung anzeigen
            </Link>
          </div>
        )}
        <div className="mt-8">
          <Link
            href="/venues"
            className="text-sm font-medium text-[var(--color-accent)] hover:underline"
          >
            ← Weitere Orte finden
          </Link>
        </div>
      </div>
    </SiteLayout>
  );
}
