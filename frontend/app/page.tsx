import Link from "next/link";
import { SiteLayout } from "@/components/layout/site-layout";

export default function HomePage() {
  return (
    <SiteLayout>
      {/* Hero */}
      <section className="hero-pattern relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 pt-16 pb-20 sm:px-6 sm:pt-24 sm:pb-28">
          <div className="mx-auto max-w-2xl text-center">
            <p className="animate-fade-in-up text-sm font-semibold uppercase tracking-wider text-[var(--color-accent)] opacity-90">
              Tische & Termine
            </p>
            <h1 className="animate-fade-in-up font-display mt-3 text-4xl tracking-tight text-[var(--color-text)] sm:text-5xl md:text-6xl [animation-delay:0.08s] [animation-fill-mode:both]">
              Einfach buchen.
            </h1>
            <p className="animate-fade-in-up mt-5 text-lg leading-relaxed text-[var(--color-text-soft)] [animation-delay:0.12s] [animation-fill-mode:both]">
              Reservieren Sie bei Restaurants, Friseuren und weiteren Betrieben
              in Ihrer Nähe – schnell, übersichtlich und unkompliziert.
            </p>
            <div className="animate-fade-in-up mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row [animation-delay:0.18s] [animation-fill-mode:both]">
              <Link
                href="/venues"
                className="btn-primary inline-flex h-12 min-w-[180px] items-center justify-center rounded-xl bg-[var(--color-accent)] px-6 text-base font-semibold text-white hover:bg-[var(--color-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
              >
                Orte finden
              </Link>
              <Link
                href="/venues"
                className="inline-flex h-12 items-center justify-center rounded-xl border-2 border-[var(--color-border-strong)] bg-transparent px-6 text-base font-medium text-[var(--color-text)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-muted)]/40 hover:text-[var(--color-accent-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 transition-colors"
              >
                Jetzt entdecken
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust / Features */}
      <section className="border-t border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <ul className="grid gap-8 sm:grid-cols-3 sm:gap-6">
            <li className="flex flex-col items-center text-center sm:items-start sm:text-left">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-accent-muted)] text-[var(--color-accent)]" aria-hidden>
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </span>
              <h2 className="mt-4 font-display text-lg font-semibold text-[var(--color-text)]">Schnell</h2>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                Termin in wenigen Klicks – keine Warteschleifen, keine Anrufe.
              </p>
            </li>
            <li className="flex flex-col items-center text-center sm:items-start sm:text-left">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-accent-muted)] text-[var(--color-accent)]" aria-hidden>
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </span>
              <h2 className="mt-4 font-display text-lg font-semibold text-[var(--color-text)]">Einfach</h2>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                Klare Auswahl: Leistung, Datum, Uhrzeit – fertig.
              </p>
            </li>
            <li className="flex flex-col items-center text-center sm:items-start sm:text-left">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-accent-muted)] text-[var(--color-accent)]" aria-hidden>
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <h2 className="mt-4 font-display text-lg font-semibold text-[var(--color-text)]">Kostenlos</h2>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                Buchung für Sie unentgeltlich – Sie zahlen nur beim Betrieb.
              </p>
            </li>
          </ul>
        </div>
      </section>

      {/* CTA-Band */}
      <section className="border-t border-[var(--color-border)] bg-[var(--color-page)]">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-10 text-center shadow-[var(--shadow-sm)] sm:px-10">
            <h2 className="font-display text-2xl font-semibold text-[var(--color-text)] sm:text-3xl">
              Bereit zum Buchen?
            </h2>
            <p className="mt-2 text-[var(--color-muted)]">
              Finden Sie Ihren Wunschort und sichern Sie sich Ihren Termin.
            </p>
            <Link
              href="/venues"
              className="btn-primary mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-[var(--color-accent)] px-6 text-sm font-semibold text-white hover:bg-[var(--color-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
            >
              Alle Orte anzeigen
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
