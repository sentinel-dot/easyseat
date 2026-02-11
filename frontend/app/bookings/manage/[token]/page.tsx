import Link from "next/link";
import { notFound } from "next/navigation";
import { getBookingByToken } from "@/lib/api/bookings";
import { SiteLayout } from "@/components/layout/site-layout";
import { ManageBookingActions } from "./manage-actions";
import { getStatusLabel } from "@/lib/utils/bookingStatus";

type Props = { params: Promise<{ token: string }> };

export async function generateMetadata({ params }: Props) {
  const { token } = await params;
  const res = await getBookingByToken(token);
  if (!res.success || !res.data)
    return { title: "Buchung verwalten – easyseat" };
  return {
    title: `Buchung ${res.data.venue_name ?? ""} – easyseat`,
  };
}

export default async function ManageBookingPage({ params }: Props) {
  const { token } = await params;
  const res = await getBookingByToken(token);

  if (!res.success || !res.data) notFound();
  const b = res.data;

  const dateDisplay = b.booking_date
    ? new Date(b.booking_date + "T12:00:00").toLocaleDateString("de-DE", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";
  const timeDisplay =
    b.start_time && b.end_time ? `${b.start_time} – ${b.end_time} Uhr` : "";

  return (
    <SiteLayout>
      <div className="mx-auto max-w-xl px-4 py-8 sm:px-6">
        <h1 className="font-display text-2xl text-[var(--color-text)]">
          Ihre Buchung
        </h1>

        <div className="mt-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          {b.venue_name && (
            <p className="font-medium text-[var(--color-text)]">
              {b.venue_name}
            </p>
          )}
          {b.service_name && (
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              {b.service_name}
              {b.staff_member_name && ` · ${b.staff_member_name}`}
            </p>
          )}
          <p className="mt-2 text-[var(--color-text)]">{dateDisplay}</p>
          <p className="text-[var(--color-text)]">{timeDisplay}</p>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            {b.customer_name} · {b.customer_email}
          </p>
          <p className="mt-3">
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                b.status === "confirmed"
                  ? "bg-green-100 text-green-800"
                  : b.status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : b.status === "cancelled"
                      ? "bg-red-100 text-red-800"
                      : b.status === "completed"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
              }`}
            >
              {getStatusLabel(b.status)}
            </span>
          </p>
        </div>

        <ManageBookingActions
          token={token}
          status={b.status}
          cancellationHours={b.cancellation_hours ?? undefined}
        />

        <p className="mt-6 text-center text-sm text-[var(--color-muted)]">
          <Link href="/venues" className="hover:text-[var(--color-accent)]">
            ← Zurück zu den Orten
          </Link>
        </p>
      </div>
    </SiteLayout>
  );
}
