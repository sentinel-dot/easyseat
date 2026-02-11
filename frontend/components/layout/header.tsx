import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="font-display text-xl text-[var(--color-text)] hover:opacity-80"
        >
          easyseat
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link
            href="/venues"
            className="text-[var(--color-text)] hover:text-[var(--color-accent)]"
          >
            Orte finden
          </Link>
          <Link
            href="/impressum"
            className="text-[var(--color-muted)] hover:text-[var(--color-text)]"
          >
            Impressum
          </Link>
          <Link
            href="/datenschutz"
            className="text-[var(--color-muted)] hover:text-[var(--color-text)]"
          >
            Datenschutz
          </Link>
          <Link
            href="/agb"
            className="text-[var(--color-muted)] hover:text-[var(--color-text)]"
          >
            AGB
          </Link>
        </nav>
      </div>
    </header>
  );
}
