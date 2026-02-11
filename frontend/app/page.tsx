import Link from "next/link";
import { SiteLayout } from "@/components/layout/site-layout";

export default function HomePage() {
  return (
    <SiteLayout>
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-display text-4xl tracking-tight text-[var(--color-text)] sm:text-5xl">
            Tische & Termine einfach buchen
          </h1>
          <p className="mt-4 text-lg text-[var(--color-muted)]">
            Reservieren Sie bei Restaurants, Friseuren und weiteren Betrieben in
            Ihrer Nähe – schnell und unkompliziert.
          </p>
          <div className="mt-10">
            <Link
              href="/venues"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-[var(--color-accent)] px-6 text-base font-medium text-white hover:bg-[var(--color-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
            >
              Orte finden
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
