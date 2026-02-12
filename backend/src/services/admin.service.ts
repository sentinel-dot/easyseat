/**
 * Admin Service (System)
 * Venues verwalten, User verwalten, globale Stats. Rolle: admin.
 */

import { getConnection } from '../config/database';
import { createLogger } from '../config/utils/logger';
import { VenueService } from './venue.service';
import { hashPassword } from './auth.service';
import { AdminUserPublic, AdminRole } from '../config/utils/types';
import { Venue } from '../config/utils/types';

const logger = createLogger('admin.service');

export interface AdminWithVenue extends AdminUserPublic {
    venue_name: string | null;
    is_active: boolean;
    last_login: Date | null;
    created_at: Date;
}

export interface GlobalStats {
    venues: { total: number; active: number };
    admins: { total: number; active: number };
    bookings: {
        total: number;
        pending: number;
        confirmed: number;
        cancelled: number;
        completed: number;
        thisMonth: number;
    };
}

export class AdminService {
    static async listVenues(): Promise<Venue[]> {
        return VenueService.getAllVenuesForAdmin();
    }

    static async createVenue(data: Parameters<typeof VenueService.createVenue>[0]): Promise<Venue> {
        return VenueService.createVenue(data);
    }

    static async updateVenue(id: number, updates: Parameters<typeof VenueService.updateVenue>[1]): Promise<Venue> {
        return VenueService.updateVenue(id, updates);
    }

    static async getVenue(id: number): Promise<Venue | null> {
        return VenueService.getVenueByIdForAdmin(id);
    }

    static async listAdmins(): Promise<AdminWithVenue[]> {
        let conn;
        try {
            conn = await getConnection();
            const rows = await conn.query(`
                SELECT a.id, a.email, a.name, a.venue_id, a.role, a.is_active, a.last_login, a.created_at, v.name as venue_name
                FROM admin_users a
                LEFT JOIN venues v ON a.venue_id = v.id
                ORDER BY a.email ASC
            `) as (AdminWithVenue & { venue_name: string })[];
            return rows.map((r) => ({
                id: r.id,
                email: r.email,
                name: r.name,
                venue_id: r.venue_id,
                role: r.role,
                venue_name: r.venue_name ?? null,
                is_active: r.is_active,
                last_login: r.last_login,
                created_at: r.created_at,
            }));
        } catch (error) {
            logger.error('Error listing admins', error);
            throw error;
        } finally {
            if (conn) conn.release();
        }
    }

    static async createAdmin(data: {
        email: string;
        password: string;
        name: string;
        venue_id?: number | null;
        role?: AdminRole;
    }): Promise<AdminUserPublic> {
        if (!data.password || data.password.length < 8) throw new Error('Passwort muss mindestens 8 Zeichen haben');
        const role = data.role && data.role !== 'admin' ? data.role : 'owner';
        const venue_id = data.venue_id ?? null;
        const password_hash = await hashPassword(data.password);
        let conn;
        try {
            conn = await getConnection();
            const existing = await conn.query('SELECT id FROM admin_users WHERE email = ?', [data.email]) as { id: number }[];
            if (existing.length > 0) throw new Error('E-Mail wird bereits verwendet');
            await conn.query(
                `INSERT INTO admin_users (email, password_hash, name, venue_id, role) VALUES (?, ?, ?, ?, ?)`,
                [data.email, password_hash, data.name, venue_id, role]
            );
            const insertResult = await conn.query(
                'SELECT id, email, name, venue_id, role FROM admin_users WHERE email = ?',
                [data.email]
            ) as AdminUserPublic[];
            return insertResult[0];
        } catch (error) {
            logger.error('Error creating admin', error);
            throw error;
        } finally {
            if (conn) conn.release();
        }
    }

    static async updateAdmin(
        adminId: number,
        updates: { venue_id?: number | null; role?: AdminRole; is_active?: boolean; name?: string }
    ): Promise<AdminUserPublic> {
        let conn;
        try {
            conn = await getConnection();
            const existing = await conn.query('SELECT id FROM admin_users WHERE id = ?', [adminId]) as { id: number }[];
            if (existing.length === 0) throw new Error('Admin nicht gefunden');
            const fields: string[] = [];
            const values: (string | number | boolean | null)[] = [];
            if (updates.venue_id !== undefined) { fields.push('venue_id = ?'); values.push(updates.venue_id); }
            if (updates.role !== undefined) { fields.push('role = ?'); values.push(updates.role); }
            if (updates.is_active !== undefined) { fields.push('is_active = ?'); values.push(updates.is_active); }
            if (updates.name !== undefined) { fields.push('name = ?'); values.push(updates.name); }
            if (fields.length === 0) {
                const rows = await conn.query('SELECT id, email, name, venue_id, role FROM admin_users WHERE id = ?', [adminId]) as AdminUserPublic[];
                return rows[0];
            }
            values.push(adminId);
            await conn.query(`UPDATE admin_users SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`, values);
            const rows = await conn.query('SELECT id, email, name, venue_id, role FROM admin_users WHERE id = ?', [adminId]) as AdminUserPublic[];
            return rows[0];
        } catch (error) {
            logger.error('Error updating admin', error);
            throw error;
        } finally {
            if (conn) conn.release();
        }
    }

    static async setAdminPassword(adminId: number, newPassword: string): Promise<void> {
        if (!newPassword || newPassword.length < 8) throw new Error('Passwort muss mindestens 8 Zeichen haben');
        const password_hash = await hashPassword(newPassword);
        let conn;
        try {
            conn = await getConnection();
            const [result] = await conn.query('UPDATE admin_users SET password_hash = ?, updated_at = NOW() WHERE id = ?', [password_hash, adminId]) as { affectedRows: number }[];
            if ((result as { affectedRows?: number })?.affectedRows === 0) throw new Error('Admin nicht gefunden');
        } catch (error) {
            logger.error('Error setting admin password', error);
            throw error;
        } finally {
            if (conn) conn.release();
        }
    }

    static async getGlobalStats(): Promise<GlobalStats> {
        let conn;
        try {
            conn = await getConnection();
            const [venueCount] = await conn.query(`SELECT COUNT(*) as total, SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END) as active FROM venues`) as [{ total: bigint; active: bigint }];
            const [adminCount] = await conn.query(`SELECT COUNT(*) as total, SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END) as active FROM admin_users`) as [{ total: bigint; active: bigint }];
            const [bookingStats] = await conn.query(`
                SELECT COUNT(*) as total,
                    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                    SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
                    SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
                    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
                    SUM(CASE WHEN MONTH(booking_date) = MONTH(CURDATE()) AND YEAR(booking_date) = YEAR(CURDATE()) THEN 1 ELSE 0 END) as this_month
                FROM bookings
            `) as [{ total: bigint; pending: bigint; confirmed: bigint; cancelled: bigint; completed: bigint; this_month: bigint }];
            return {
                venues: { total: Number(venueCount?.total ?? 0), active: Number(venueCount?.active ?? 0) },
                admins: { total: Number(adminCount?.total ?? 0), active: Number(adminCount?.active ?? 0) },
                bookings: {
                    total: Number(bookingStats?.total ?? 0),
                    pending: Number(bookingStats?.pending ?? 0),
                    confirmed: Number(bookingStats?.confirmed ?? 0),
                    cancelled: Number(bookingStats?.cancelled ?? 0),
                    completed: Number(bookingStats?.completed ?? 0),
                    thisMonth: Number(bookingStats?.this_month ?? 0),
                },
            };
        } catch (error) {
            logger.error('Error fetching global stats', error);
            throw error;
        } finally {
            if (conn) conn.release();
        }
    }
}
