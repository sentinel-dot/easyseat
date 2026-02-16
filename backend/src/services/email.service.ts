/**
 * E-Mail-Service für Buchungs-Benachrichtigungen
 * Nutzt Nodemailer mit konfigurierbarem SMTP (z. B. Resend, SendGrid, Brevo, Mailgun).
 * Ohne SMTP-Konfiguration werden E-Mails nur geloggt (z. B. lokale Entwicklung).
 */

import nodemailer, { Transporter } from 'nodemailer';
import { createLogger } from '../config/utils/logger';
import { getConnection } from '../config/database';

const logger = createLogger('email.service');

/** Buchungsdaten, die für E-Mail-Texte benötigt werden (inkl. Venue/Service-Namen) */
export interface BookingForEmail {
  id: number;
  customer_name: string;
  customer_email: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  special_requests?: string | null;
  venue_name?: string | null;
  service_name?: string | null;
  staff_member_name?: string | null;
  booking_token?: string | null;
}

const MAIL_FROM = process.env.MAIL_FROM || process.env.SMTP_USER || 'noreply@easyseat.local';
const PUBLIC_APP_URL = process.env.PUBLIC_APP_URL || process.env.FRONTEND_URL || 'http://localhost:3000';
const REMINDER_HOURS = parseInt(process.env.REMINDER_HOURS ?? '24', 10) || 24;

function getTransport(): Transporter | null {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) {
    logger.info('SMTP not configured (SMTP_HOST/USER/PASS). Emails will be logged only.');
    return null;
  }
  const port = parseInt(process.env.SMTP_PORT ?? '587', 10);
  const secure = process.env.SMTP_SECURE === 'true';
  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

let cachedTransport: Transporter | null | undefined = undefined;

function transport(): Transporter | null {
  if (cachedTransport === undefined) cachedTransport = getTransport();
  return cachedTransport;
}

function manageLink(booking: BookingForEmail): string {
  const token = booking.booking_token;
  const base = PUBLIC_APP_URL.replace(/\/$/, '');
  return token ? `${base}/bookings/manage/${token}` : `${base}/bookings`;
}

function formatDate(d: string): string {
  return new Date(d + 'T12:00:00').toLocaleDateString('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function notesBlock(booking: BookingForEmail): { html: string; text: string } {
  if (!booking.special_requests || !String(booking.special_requests).trim()) return { html: '', text: '' };
  const escaped = String(booking.special_requests).replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return {
    html: `  <p><strong>Ihre Notizen:</strong><br>${escaped}</p>\n`,
    text: `Ihre Notizen: ${booking.special_requests}\n\n`,
  };
}

/**
 * Setzt confirmation_sent_at nach erfolgreichem Versand der Bestätigungsmail.
 */
export async function setConfirmationSentAt(bookingId: number): Promise<void> {
  const conn = await getConnection();
  try {
    await conn.query(
      'UPDATE bookings SET confirmation_sent_at = NOW() WHERE id = ?',
      [bookingId]
    );
  } finally {
    conn.release();
  }
}

/**
 * Setzt reminder_sent_at nach erfolgreichem Versand der Erinnerungsmail.
 */
export async function setReminderSentAt(bookingId: number): Promise<void> {
  const conn = await getConnection();
  try {
    await conn.query(
      'UPDATE bookings SET reminder_sent_at = NOW() WHERE id = ?',
      [bookingId]
    );
  } finally {
    conn.release();
  }
}

/**
 * Mail direkt nach Buchungserstellung (Status pending): „Vielen Dank – wir prüfen und bestätigen in Kürze.“
 */
export async function sendBookingReceived(booking: BookingForEmail): Promise<boolean> {
  const venueName = booking.venue_name || 'Unser Betrieb';
  const serviceName = booking.service_name || 'Ihre Buchung';
  const subject = `Vielen Dank für Ihre Buchung bei ${venueName}`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Buchung eingegangen</title></head>
<body style="font-family: sans-serif; line-height: 1.5; color: #333; max-width: 560px;">
  <p>Hallo ${booking.customer_name},</p>
  <p>vielen Dank für Ihre Buchung. Wir haben Ihre Anfrage erhalten und prüfen sie. Sie erhalten in Kürze eine Bestätigung, sobald Ihr Termin freigegeben ist.</p>
  <p><strong>${serviceName}</strong><br>
  ${formatDate(booking.booking_date)} · ${booking.start_time}–${booking.end_time} Uhr
  ${booking.staff_member_name ? `<br>Ansprechpartner: ${booking.staff_member_name}` : ''}
  </p>
  ${notesBlock(booking).html}
  <p>Sie können Ihre Buchung jederzeit einsehen oder ändern:<br>
  <a href="${manageLink(booking)}">Buchung verwalten</a></p>
  <p>Mit freundlichen Grüßen<br>${venueName}</p>
</body>
</html>`;

  const notesT = notesBlock(booking).text;
  const text = `Hallo ${booking.customer_name},\n\nVielen Dank für Ihre Buchung. Wir haben Ihre Anfrage erhalten und prüfen sie. Sie erhalten in Kürze eine Bestätigung, sobald Ihr Termin freigegeben ist.\n\n${serviceName}\n${formatDate(booking.booking_date)} · ${booking.start_time}–${booking.end_time} Uhr${booking.staff_member_name ? `\nAnsprechpartner: ${booking.staff_member_name}` : ''}${notesT}\nBuchung verwalten: ${manageLink(booking)}\n\nMit freundlichen Grüßen\n${venueName}`;

  return sendMail({
    to: booking.customer_email,
    subject,
    html,
    text,
    bookingId: booking.id,
    type: 'booking_received',
  });
}

/**
 * Bestätigungsmail (pending → confirmed oder cancelled → confirmed).
 * Bei isReactivation: Formulierung „Ihre Buchung ist wieder gültig“.
 */
export async function sendConfirmation(
  booking: BookingForEmail,
  isReactivation = false
): Promise<boolean> {
  const venueName = booking.venue_name || 'Unser Betrieb';
  const serviceName = booking.service_name || 'Ihre Buchung';
  const subject = isReactivation
    ? `Ihre Buchung bei ${venueName} ist wieder bestätigt`
    : `Ihre Buchung bei ${venueName} ist bestätigt`;

  const intro = isReactivation
    ? `Ihre Buchung ist wieder gültig. Sie können wie geplant zu Ihrem Termin kommen.`
    : `Ihre Buchung wurde bestätigt. Wir freuen uns auf Ihren Besuch.`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Buchungsbestätigung</title></head>
<body style="font-family: sans-serif; line-height: 1.5; color: #333; max-width: 560px;">
  <p>Hallo ${booking.customer_name},</p>
  <p>${intro}</p>
  <p><strong>${serviceName}</strong><br>
  ${formatDate(booking.booking_date)} · ${booking.start_time}–${booking.end_time} Uhr
  ${booking.staff_member_name ? `<br>Ansprechpartner: ${booking.staff_member_name}` : ''}
  </p>
  ${notesBlock(booking).html}
  <p>Sie können Ihre Buchung jederzeit einsehen oder ändern:<br>
  <a href="${manageLink(booking)}">Buchung verwalten</a></p>
  <p>Mit freundlichen Grüßen<br>${venueName}</p>
</body>
</html>`;

  const notesT = notesBlock(booking).text;
  const text = `Hallo ${booking.customer_name},\n\n${intro}\n\n${serviceName}\n${formatDate(booking.booking_date)} · ${booking.start_time}–${booking.end_time} Uhr${booking.staff_member_name ? `\nAnsprechpartner: ${booking.staff_member_name}` : ''}${notesT}\nBuchung verwalten: ${manageLink(booking)}\n\nMit freundlichen Grüßen\n${venueName}`;

  return sendMail({
    to: booking.customer_email,
    subject,
    html,
    text,
    bookingId: booking.id,
    type: 'confirmation',
    onSuccess: () => setConfirmationSentAt(booking.id),
  });
}

/**
 * Stornierungsmail (→ cancelled).
 */
export async function sendCancellation(booking: BookingForEmail): Promise<boolean> {
  const venueName = booking.venue_name || 'Unser Betrieb';
  const serviceName = booking.service_name || 'Ihre Buchung';
  const subject = `Ihre Buchung bei ${venueName} wurde storniert`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Stornierung</title></head>
<body style="font-family: sans-serif; line-height: 1.5; color: #333; max-width: 560px;">
  <p>Hallo ${booking.customer_name},</p>
  <p>Ihre folgende Buchung wurde storniert:</p>
  <p><strong>${serviceName}</strong><br>
  ${formatDate(booking.booking_date)} · ${booking.start_time}–${booking.end_time} Uhr</p>
  ${notesBlock(booking).html}
  <p>Bei Fragen wenden Sie sich bitte an ${venueName}.</p>
  <p>Mit freundlichen Grüßen<br>${venueName}</p>
</body>
</html>`;

  const notesT = notesBlock(booking).text;
  const text = `Hallo ${booking.customer_name},\n\nIhre folgende Buchung wurde storniert:\n\n${serviceName}\n${formatDate(booking.booking_date)} · ${booking.start_time}–${booking.end_time} Uhr${notesT}\nBei Fragen wenden Sie sich bitte an ${venueName}.\n\nMit freundlichen Grüßen\n${venueName}`;

  return sendMail({
    to: booking.customer_email,
    subject,
    html,
    text,
    bookingId: booking.id,
    type: 'cancellation',
  });
}

/**
 * Erinnerungsmail (zeitgesteuert, z. B. 24 h vor Termin).
 */
export async function sendReminder(booking: BookingForEmail): Promise<boolean> {
  const venueName = booking.venue_name || 'Unser Betrieb';
  const serviceName = booking.service_name || 'Ihre Buchung';
  const subject = `Erinnerung: Ihr Termin bei ${venueName} morgen`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Terminerinnerung</title></head>
<body style="font-family: sans-serif; line-height: 1.5; color: #333; max-width: 560px;">
  <p>Hallo ${booking.customer_name},</p>
  <p>wir erinnern Sie an Ihren Termin:</p>
  <p><strong>${serviceName}</strong><br>
  ${formatDate(booking.booking_date)} · ${booking.start_time}–${booking.end_time} Uhr
  ${booking.staff_member_name ? `<br>Ansprechpartner: ${booking.staff_member_name}` : ''}
  </p>
  ${notesBlock(booking).html}
  <p><a href="${manageLink(booking)}">Buchung ansehen oder ändern</a></p>
  <p>Mit freundlichen Grüßen<br>${venueName}</p>
</body>
</html>`;

  const notesT = notesBlock(booking).text;
  const text = `Hallo ${booking.customer_name},\n\nWir erinnern Sie an Ihren Termin:\n\n${serviceName}\n${formatDate(booking.booking_date)} · ${booking.start_time}–${booking.end_time} Uhr${booking.staff_member_name ? `\nAnsprechpartner: ${booking.staff_member_name}` : ''}${notesT}\nBuchung ansehen oder ändern: ${manageLink(booking)}\n\nMit freundlichen Grüßen\n${venueName}`;

  return sendMail({
    to: booking.customer_email,
    subject,
    html,
    text,
    bookingId: booking.id,
    type: 'reminder',
    onSuccess: () => setReminderSentAt(booking.id),
  });
}

/**
 * Einladung zur Bewertung nach abgeschlossener Buchung (completed).
 */
export async function sendReviewInvitation(booking: BookingForEmail, venueId: number): Promise<boolean> {
  const venueName = booking.venue_name || 'Unser Betrieb';
  const baseUrl = PUBLIC_APP_URL.replace(/\/$/, '');
  const reviewUrl = `${baseUrl}/venues/${venueId}`;
  const subject = `Wie hat es Ihnen gefallen? Bewerten Sie ${venueName}`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Bewertung</title></head>
<body style="font-family: sans-serif; line-height: 1.5; color: #333; max-width: 560px;">
  <p>Hallo ${booking.customer_name},</p>
  <p>Ihr Termin bei ${venueName} ist abgeschlossen. Wir würden uns freuen, wenn Sie uns Ihre Erfahrung mitteilen – Ihre Bewertung hilft anderen Gästen und uns.</p>
  <p><a href="${reviewUrl}">Jetzt bewerten</a></p>
  <p>Mit freundlichen Grüßen<br>${venueName}</p>
</body>
</html>`;

  const text = `Hallo ${booking.customer_name},\n\nIhr Termin bei ${venueName} ist abgeschlossen. Wir würden uns freuen, wenn Sie uns Ihre Erfahrung mitteilen.\n\nJetzt bewerten: ${reviewUrl}\n\nMit freundlichen Grüßen\n${venueName}`;

  return sendMail({
    to: booking.customer_email,
    subject,
    html,
    text,
    bookingId: booking.id,
    type: 'review_invitation',
  });
}

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
  bookingId: number;
  type: 'confirmation' | 'cancellation' | 'reminder' | 'booking_received' | 'review_invitation';
  onSuccess?: () => Promise<void>;
}

async function sendMail(opts: SendMailOptions): Promise<boolean> {
  const trans = transport();
  if (!trans) {
    logger.info(`[DEV] Email would be sent (${opts.type}, booking ${opts.bookingId}) to ${opts.to}: ${opts.subject}`);
    await opts.onSuccess?.();
    return true;
  }
  try {
    await trans.sendMail({
      from: MAIL_FROM,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
    });
    logger.info(`Email sent (${opts.type}, booking ${opts.bookingId}) to ${opts.to}`);
    await opts.onSuccess?.();
    return true;
  } catch (err) {
    logger.error(`Failed to send email (${opts.type}, booking ${opts.bookingId})`, err);
    return false;
  }
}

/**
 * Gibt die Anzahl Stunden vor dem Termin zurück, in der die Erinnerung gesendet werden soll.
 */
export function getReminderHours(): number {
  return REMINDER_HOURS;
}

/** Send a generic email (customer verification, password reset). */
async function sendCustomerMail(to: string, subject: string, html: string, text: string): Promise<boolean> {
  const trans = transport();
  if (!trans) {
    logger.info(`[DEV] Customer email would be sent to ${to}: ${subject}`);
    return true;
  }
  try {
    await trans.sendMail({
      from: MAIL_FROM,
      to,
      subject,
      html,
      text,
    });
    logger.info(`Customer email sent to ${to}: ${subject}`);
    return true;
  } catch (err) {
    logger.error('Failed to send customer email', err);
    return false;
  }
}

/**
 * Send customer email verification link.
 */
export async function sendCustomerVerificationEmail(email: string, name: string, verificationToken: string): Promise<boolean> {
  const baseUrl = (PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
  const verifyUrl = `${baseUrl}/auth/verify-email?token=${encodeURIComponent(verificationToken)}`;
  const subject = 'E-Mail-Adresse bestätigen – easyseat';
  const html = `
    <h2>Hallo ${name.replace(/</g, '&lt;')},</h2>
    <p>Bitte bestätigen Sie Ihre E-Mail-Adresse, indem Sie auf den folgenden Link klicken:</p>
    <p><a href="${verifyUrl}">${verifyUrl}</a></p>
    <p>Falls Sie sich nicht bei easyseat registriert haben, können Sie diese E-Mail ignorieren.</p>
    <p>Mit freundlichen Grüßen,<br>Ihr easyseat-Team</p>
  `;
  const text = `Hallo ${name},\n\nBitte bestätigen Sie Ihre E-Mail-Adresse: ${verifyUrl}\n\nFalls Sie sich nicht registriert haben, ignorieren Sie diese E-Mail.\n\nMit freundlichen Grüßen,\nIhr easyseat-Team`;
  return sendCustomerMail(email, subject, html, text);
}

/**
 * Send customer password reset link.
 */
export async function sendCustomerPasswordResetEmail(email: string, name: string, resetToken: string): Promise<boolean> {
  const baseUrl = (PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
  const resetUrl = `${baseUrl}/auth/reset-password?token=${encodeURIComponent(resetToken)}`;
  const subject = 'Passwort zurücksetzen – easyseat';
  const html = `
    <h2>Hallo ${name.replace(/</g, '&lt;')},</h2>
    <p>Sie haben eine Anfrage zum Zurücksetzen Ihres Passworts gestellt. Klicken Sie auf den folgenden Link:</p>
    <p><a href="${resetUrl}">${resetUrl}</a></p>
    <p>Der Link ist begrenzt gültig. Falls Sie die Anfrage nicht gestellt haben, ignorieren Sie diese E-Mail.</p>
    <p>Mit freundlichen Grüßen,<br>Ihr easyseat-Team</p>
  `;
  const text = `Hallo ${name},\n\nPasswort zurücksetzen: ${resetUrl}\n\nFalls Sie die Anfrage nicht gestellt haben, ignorieren Sie diese E-Mail.\n\nMit freundlichen Grüßen,\nIhr easyseat-Team`;
  return sendCustomerMail(email, subject, html, text);
}
