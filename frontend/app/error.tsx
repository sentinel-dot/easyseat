"use client";

import { useEffect } from "react";
import Link from "next/link";
import { SiteLayout } from "@/components/layout/site-layout";
import { Button } from "@/components/shared/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <SiteLayout>
      <div className="mx-auto max-w-xl px-4 py-16 text-center sm:px-6">
        <h1 className="font-display text-2xl text-[var(--color-text)]">
          Etwas ist schiefgelaufen
        </h1>
        <p className="mt-4 text-[var(--color-muted)]">
          Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es
          erneut.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button onClick={reset}>Erneut versuchen</Button>
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-5 text-sm font-medium hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
          >
            Zur Startseite
          </Link>
        </div>
      </div>
    </SiteLayout>
  );
}
