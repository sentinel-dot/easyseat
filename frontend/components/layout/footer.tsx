import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-base font-bold text-[var(--color-text)]">
              <span className="text-[var(--color-accent)]">easy</span>seat
            </span>
            <p className="mt-1 max-w-xs text-sm text-[var(--color-muted)]">
              Tische & Termine einfach buchen.
            </p>
          </div>
          <nav className="flex flex-wrap gap-6 text-sm" aria-label="Footer-Navigation">
            <Link
              href="/venues"
              className="font-medium text-[var(--color-text-soft)] transition-colors hover:text-[var(--color-accent)]"
            >
              Orte finden
            </Link>
            <Link
              href="/impressum"
              className="text-[var(--color-muted)] transition-colors hover:text-[var(--color-text)]"
            >
              Impressum
            </Link>
            <Link
              href="/datenschutz"
              className="text-[var(--color-muted)] transition-colors hover:text-[var(--color-text)]"
            >
              Datenschutz
            </Link>
            <Link
              href="/agb"
              className="text-[var(--color-muted)] transition-colors hover:text-[var(--color-text)]"
            >
              AGB
            </Link>
            <Link
              href="/login"
              className="text-[var(--color-muted)] transition-colors hover:text-[var(--color-text)]"
            >
              Betreiber-Login
            </Link>
          </nav>
        </div>
        <p className="mt-6 border-t border-[var(--color-border)] pt-6 text-sm text-[var(--color-muted)]">
          © {new Date().getFullYear()} easyseat
        </p>
      </div>
    </footer>
  );
}
