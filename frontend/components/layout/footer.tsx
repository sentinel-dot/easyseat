import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="font-display text-lg text-[var(--color-text)]">
            easyseat
          </span>
          <nav className="flex gap-6 text-sm text-[var(--color-muted)]">
            <Link href="/impressum" className="hover:text-[var(--color-text)]">
              Impressum
            </Link>
            <Link href="/datenschutz" className="hover:text-[var(--color-text)]">
              Datenschutz
            </Link>
            <Link href="/agb" className="hover:text-[var(--color-text)]">
              AGB
            </Link>
          </nav>
        </div>
        <p className="mt-4 text-center text-sm text-[var(--color-muted)]">
          © {new Date().getFullYear()} easyseat. Tische & Termine einfach buchen.
        </p>
        <p className="mt-2 text-center">
          <Link
            href="/admin/login"
            className="text-xs text-[var(--color-muted)] hover:text-[var(--color-text)]"
          >
            Betreiber-Login
          </Link>
        </p>
      </div>
    </footer>
  );
}
