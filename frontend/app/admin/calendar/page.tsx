import Link from "next/link";

export const metadata = {
  title: "Kalender – Admin – easyseat",
};

export default function AdminCalendarPage() {
  return (
    <>
      <h1 className="font-display text-2xl text-[var(--color-text)]">
        Kalender
      </h1>
      <p className="mt-2 text-[var(--color-muted)]">
        Kalenderansicht der Buchungen – kommt in einer späteren Version.
      </p>
      <Link
        href="/admin/bookings"
        className="mt-4 inline-block text-sm font-medium text-[var(--color-accent)] hover:underline"
      >
        ← Zur Buchungsliste
      </Link>
    </>
  );
}
