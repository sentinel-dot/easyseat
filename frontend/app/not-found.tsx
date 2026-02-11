import Link from "next/link";
import { SiteLayout } from "@/components/layout/site-layout";

export default function NotFound() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-xl px-4 py-16 text-center sm:px-6">
        <h1 className="font-display text-3xl text-[var(--color-text)]">
          Seite nicht gefunden
        </h1>
        <p className="mt-4 text-[var(--color-muted)]">
          Die angeforderte Seite existiert nicht oder wurde verschoben.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex h-11 items-center justify-center rounded-lg bg-[var(--color-accent)] px-5 text-sm font-medium text-white hover:bg-[var(--color-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
        >
          Zur Startseite
        </Link>
      </div>
    </SiteLayout>
  );
}
