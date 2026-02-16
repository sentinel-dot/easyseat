import Link from "next/link";
import { SiteLayout } from "@/components/layout/site-layout";
import { PostBookingRegisterPrompt } from "@/components/customer/PostBookingRegisterPrompt";

type Props = { searchParams: Promise<{ token?: string; email?: string }> };

export const metadata = {
  title: "Buchungsanfrage gesendet – easyseat",
  description: "Ihre Buchungsanfrage wurde übermittelt.",
};

export default async function ConfirmationPage({ searchParams }: Props) {
  const { token, email } = await searchParams;

  return (
    <SiteLayout>
      <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white dark:bg-emerald-400 dark:text-emerald-950" aria-hidden>
          <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="mt-6 font-display text-3xl font-semibold text-[var(--color-text)] sm:text-4xl">
          Vielen Dank
        </h1>
        <p className="mt-4 leading-relaxed text-[var(--color-text-soft)]">
          Ihre Buchungsanfrage wurde gesendet. Das Unternehmen wird Sie
          zeitnah per E-Mail bestätigen oder bei Rückfragen kontaktieren.
        </p>
        {token && (
          <p className="mt-6 text-sm text-[var(--color-muted)]">
            Sie können Ihre Buchung jederzeit einsehen oder stornieren:
          </p>
        )}
        {token && (
          <div className="mt-4 space-y-2">
            <Link
              href={`/bookings/manage/${token}`}
              className="btn-primary inline-flex h-11 items-center justify-center rounded-xl bg-[var(--color-accent)] px-6 text-sm font-semibold text-white hover:bg-[var(--color-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
            >
              Meine Buchung anzeigen
            </Link>
          </div>
        )}
        <PostBookingRegisterPrompt customerEmail={email ?? ""} />
        <div className="mt-10 space-y-3 text-center">
          <Link
            href="/bookings/my-bookings"
            className="block text-sm font-medium text-[var(--color-accent)] transition-colors hover:text-[var(--color-accent-hover)]"
          >
            Alle meine Buchungen ansehen
          </Link>
          <Link
            href="/venues"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent)] transition-colors hover:text-[var(--color-accent-hover)]"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Weitere Orte finden
          </Link>
        </div>
      </div>
    </SiteLayout>
  );
}
