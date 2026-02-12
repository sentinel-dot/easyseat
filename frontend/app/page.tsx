import Link from "next/link";
import { SiteLayout } from "@/components/layout/site-layout";
import { HeroSearch } from "@/components/layout/hero-search";

export default function HomePage() {
  return (
    <SiteLayout>
      {/* Hero: Such-Fokus wie OpenTable */}
      <section className="hero-pattern border-b border-[var(--color-border)]">
        <div className="mx-auto max-w-4xl px-4 pt-12 pb-14 sm:px-6 sm:pt-16 sm:pb-20">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text)] sm:text-4xl">
              Finden Sie den richtigen Termin
            </h1>
            <p className="mt-3 text-base text-[var(--color-muted)]">
              Restaurants, Friseure, Kosmetik und mehr – Termin direkt buchen.
            </p>
            <HeroSearch />
          </div>
        </div>
      </section>

      {/* Kurze Feature-Zeile */}
      <section className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
          <ul className="grid gap-6 sm:grid-cols-3 sm:gap-8">
            <li className="flex items-start gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[var(--color-accent-muted)] text-[var(--color-accent)]" aria-hidden>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <div>
                <h2 className="font-semibold text-[var(--color-text)]">Suchen & buchen</h2>
                <p className="mt-0.5 text-sm text-[var(--color-muted)]">
                  Datum und Uhrzeit wählen, Platz sichern – in wenigen Klicks.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[var(--color-accent-muted)] text-[var(--color-accent)]" aria-hidden>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </span>
              <div>
                <h2 className="font-semibold text-[var(--color-text)]">Kostenlose Reservierung</h2>
                <p className="mt-0.5 text-sm text-[var(--color-muted)]">
                  Keine Buchungsgebühr. Sie zahlen nur vor Ort beim Betrieb.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[var(--color-accent-muted)] text-[var(--color-accent)]" aria-hidden>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </span>
              <div>
                <h2 className="font-semibold text-[var(--color-text)]">Sicher bestätigt</h2>
                <p className="mt-0.5 text-sm text-[var(--color-muted)]">
                  Bestätigung per E-Mail, Buchung jederzeit verwalten.
                </p>
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[var(--color-page)]">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-14">
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-8 text-center sm:px-10">
            <h2 className="text-xl font-semibold text-[var(--color-text)] sm:text-2xl">
              Bereit zum Buchen?
            </h2>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              Alle buchbaren Orte anzeigen und Termin wählen.
            </p>
            <Link
              href="/venues"
              className="btn-primary mt-5 inline-flex h-11 items-center justify-center rounded-md bg-[var(--color-accent)] px-6 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
            >
              Alle Orte anzeigen
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
