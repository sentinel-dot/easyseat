"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();
  const isActive = (path: string) =>
    pathname === path || (path !== "/" && pathname.startsWith(path));

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="text-lg font-bold text-[var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 rounded"
        >
          <span className="text-[var(--color-accent)]">easy</span>seat
        </Link>
        <nav className="flex items-center gap-1 sm:gap-4" aria-label="Hauptnavigation">
          <Link
            href="/venues"
            className={`rounded px-3 py-2 text-sm font-medium transition-colors ${
              isActive("/venues")
                ? "text-[var(--color-accent)]"
                : "text-[var(--color-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            Orte finden
          </Link>
          <Link
            href="/impressum"
            className="hidden rounded px-3 py-2 text-sm text-[var(--color-muted)] transition-colors hover:text-[var(--color-text)] sm:block"
          >
            Impressum
          </Link>
          <Link
            href="/datenschutz"
            className="hidden rounded px-3 py-2 text-sm text-[var(--color-muted)] transition-colors hover:text-[var(--color-text)] sm:block"
          >
            Datenschutz
          </Link>
          <Link
            href="/venues"
            className="ml-1 inline-flex h-9 items-center justify-center rounded-md bg-[var(--color-accent)] px-4 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
          >
            Jetzt buchen
          </Link>
        </nav>
      </div>
    </header>
  );
}
