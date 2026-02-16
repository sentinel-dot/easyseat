import Link from "next/link";
import { notFound } from "next/navigation";
import { getBookingByToken } from "@/lib/api/bookings";
import { getVenueById } from "@/lib/api/venues";
import { SiteLayout } from "@/components/layout/site-layout";
import { ManageBookingActions } from "./manage-actions";
import { ManageBookingNotes } from "./manage-notes";
import { ManageRescheduleModal } from "./manage-reschedule";
import { getStatusLabel, getStatusColor } from "@/lib/utils/bookingStatus";

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

  // Venue-Details für Reschedule laden
  const venueRes = await getVenueById(b.venue_id);
  const venue = venueRes.success ? venueRes.data : null;

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
      <div className="mx-auto max-w-xl px-4 py-10 sm:px-6 sm:py-12">
        <h1 className="font-display text-2xl font-semibold text-[var(--color-text)] sm:text-3xl">
          Ihre Buchung
        </h1>

        <div className="mt-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-sm)]">
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
          {b.special_requests && (
            <p className="mt-2 text-sm text-[var(--color-text)]">
              <span className="font-medium text-[var(--color-muted)]">Notizen: </span>
              {b.special_requests}
            </p>
          )}
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            {b.customer_name} · {b.customer_email}
          </p>
          <p className="mt-3">
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(b.status)}`}
            >
              {getStatusLabel(b.status)}
            </span>
          </p>
        </div>

        <ManageBookingNotes
          token={token}
          specialRequests={b.special_requests ?? ""}
          status={b.status}
        />

        {venue && (
          <ManageRescheduleModal
            token={token}
            bookingId={b.id}
            venueId={b.venue_id}
            serviceId={b.service_id}
            currentDate={b.booking_date}
            currentStartTime={b.start_time}
            currentEndTime={b.end_time}
            partySize={b.party_size}
            status={b.status}
            bookingAdvanceDays={venue.booking_advance_days}
            venueName={b.venue_name ?? undefined}
            serviceName={b.service_name ?? undefined}
          />
        )}

        <ManageBookingActions
          token={token}
          status={b.status}
          cancellationHours={b.cancellation_hours ?? undefined}
        />

        <p className="mt-8 text-center">
          <Link
            href="/venues"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-accent)] transition-colors hover:text-[var(--color-accent-hover)]"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Zurück zu den Orten
          </Link>
        </p>
      </div>
    </SiteLayout>
  );
}
