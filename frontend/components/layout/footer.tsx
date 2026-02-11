import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="font-display text-lg font-semibold text-[var(--color-text)]">
              <span className="text-[var(--color-accent)]">easy</span>seat
            </span>
            <p className="mt-2 max-w-xs text-sm text-[var(--color-muted)]">
              Tische & Termine einfach buchen – schnell und unkompliziert.
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
          </nav>
        </div>
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-[var(--color-border)] pt-8 sm:flex-row">
          <p className="text-sm text-[var(--color-muted)]">
            © {new Date().getFullYear()} easyseat. Alle Rechte vorbehalten.
          </p>
          <Link
            href="/admin/login"
            className="text-sm text-[var(--color-muted)] transition-colors hover:text-[var(--color-text)]"
          >
            Betreiber-Login
          </Link>
        </div>
      </div>
    </footer>
  );
}
