import Link from "next/link";

export const metadata = {
  title: "Statistik – Admin – easyseat",
};

export default function AdminStatsPage() {
  return (
    <>
      <h1 className="font-display text-2xl text-[var(--color-text)]">
        Statistik
      </h1>
      <p className="mt-2 text-[var(--color-muted)]">
        Detaillierte Auswertungen – kommen in einer späteren Version.
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
