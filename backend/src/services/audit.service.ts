/**
 * Booking Audit Service
 * Schreibt Änderungen an Buchungen in booking_audit_log (wer, wann, was).
 * Wird bei Admin-Statusänderung, Kunden-Stornierung und Kunden-Update (Manage-Link) aufgerufen.
 */

import { getConnection } from '../config/database';
import { createLogger } from '../config/utils/logger';

const logger = createLogger('audit.service');

export type AuditAction = 'status_change' | 'cancel' | 'update';
export type AuditActorType = 'admin' | 'owner' | 'staff' | 'customer' | 'system';

export interface LogBookingActionParams {
    bookingId: number;
    venueId: number;
    action: AuditAction;
    oldStatus?: string | null;
    newStatus?: string | null;
    reason?: string | null;
    actorType: AuditActorType;
    adminUserId?: number | null;
    customerIdentifier?: string | null;
}

/**
 * Schreibt einen Eintrag in booking_audit_log.
 * Fehler werden geloggt, aber nicht geworfen, damit der eigentliche Request nicht scheitert.
 */
export async function logBookingAction(params: LogBookingActionParams): Promise<void> {
    const {
        bookingId,
        venueId,
        action,
        oldStatus = null,
        newStatus = null,
        reason = null,
        actorType,
        adminUserId = null,
        customerIdentifier = null,
    } = params;

    let conn;
    try {
        conn = await getConnection();
        await conn.query(
            `INSERT INTO booking_audit_log
             (booking_id, venue_id, action, old_status, new_status, reason, actor_type, admin_user_id, customer_identifier)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                bookingId,
                venueId,
                action,
                oldStatus,
                newStatus,
                reason,
                actorType,
                adminUserId,
                customerIdentifier,
            ]
        );
        logger.debug('Audit log written', { bookingId, action, actorType });
    } catch (error) {
        logger.error('Failed to write audit log (non-fatal)', { bookingId, action, error });
        // Nicht werfen – Hauptaktion (Status-Update, Stornierung) soll trotzdem erfolgreich sein
    } finally {
        if (conn) conn.release();
    }
}
