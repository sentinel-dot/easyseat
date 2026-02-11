"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path || (path !== "/" && pathname.startsWith(path));

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="font-display text-xl font-semibold text-[var(--color-text)] transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 rounded-lg"
        >
          <span className="text-[var(--color-accent)]">easy</span>seat
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2" aria-label="Hauptnavigation">
          <Link
            href="/venues"
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive("/venues")
                ? "bg-[var(--color-accent-muted)] text-[var(--color-accent-strong)]"
                : "text-[var(--color-text-soft)] hover:bg-[var(--color-page)] hover:text-[var(--color-text)]"
            }`}
          >
            Orte finden
          </Link>
          <Link
            href="/impressum"
            className="rounded-lg px-3 py-2 text-sm text-[var(--color-muted)] transition-colors hover:bg-[var(--color-page)] hover:text-[var(--color-text)]"
          >
            Impressum
          </Link>
          <Link
            href="/datenschutz"
            className="rounded-lg px-3 py-2 text-sm text-[var(--color-muted)] transition-colors hover:bg-[var(--color-page)] hover:text-[var(--color-text)]"
          >
            Datenschutz
          </Link>
          <Link
            href="/agb"
            className="rounded-lg px-3 py-2 text-sm text-[var(--color-muted)] transition-colors hover:bg-[var(--color-page)] hover:text-[var(--color-text)]"
          >
            AGB
          </Link>
          <Link
            href="/venues"
            className="ml-2 hidden rounded-xl bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 sm:inline-flex"
          >
            Jetzt buchen
          </Link>
        </nav>
      </div>
    </header>
  );
}
