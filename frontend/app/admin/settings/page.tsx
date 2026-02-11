import Link from "next/link";

export const metadata = {
  title: "Einstellungen – Admin – easyseat",
};

export default function AdminSettingsPage() {
  return (
    <>
      <h1 className="font-display text-2xl text-[var(--color-text)]">
        Einstellungen
      </h1>
      <p className="mt-2 text-[var(--color-muted)]">
        Venue-Einstellungen – kommt in einer späteren Version.
      </p>
      <Link
        href="/admin"
        className="mt-4 inline-block text-sm font-medium text-[var(--color-accent)] hover:underline"
      >
        ← Zur Übersicht
      </Link>
    </>
  );
}
