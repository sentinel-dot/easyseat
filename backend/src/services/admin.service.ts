/**
 * ADMIN SERVICE
 * 
 * Service für Admin-Dashboard Operationen:
 * - Buchungsverwaltung mit erweiterten Filtern
 * - Statistiken
 * - Service-Verwaltung (CRUD)
 * - Verfügbarkeits-Verwaltung
 */

import { getConnection } from '../config/database';
import { createLogger } from '../config/utils/logger';
import { Booking, Service } from '../config/utils/types';
import { BookingService } from './booking.service';

const logger = createLogger('admin.service');

// Extended Booking type with joined data
export interface BookingWithDetails extends Booking {
    venue_name?: string;
    service_name?: string;
    staff_member_name?: string;
    service_price?: number;
    service_duration?: number;
}

// Stats types
export interface AdminStats {
    bookings: {
        today: number;
        thisWeek: number;
        thisMonth: number;
        pending: number;
        confirmed: number;
        cancelled: number;
        completed: number;
    };
    revenue: {
        today: number;
        thisWeek: number;
        thisMonth: number;
        total: number;
    };
    popularServices: Array<{
        service_id: number;
        service_name: string;
        booking_count: number;
        total_revenue: number;
    }>;
    popularTimeSlots: Array<{
        hour: number;
        booking_count: number;
    }>;
}

export class AdminService {
    /**
     * Get all bookings with extended filters (for admin dashboard)
     */
    static async getBookings(
        venueId: number,
        filters?: {
            startDate?: string;
            endDate?: string;
            status?: string;
            serviceId?: number;
            search?: string;
            limit?: number;
            offset?: number;
        }
    ): Promise<{ bookings: BookingWithDetails[]; total: number }> {
        logger.info('Admin: Fetching bookings...', { venueId, filters });

        let conn;
        try {
            conn = await getConnection();

            // Build query
            let query = `
                SELECT 
                    b.*,
                    v.name as venue_name,
                    s.name as service_name,
                    s.price as service_price,
                    s.duration_minutes as service_duration,
                    sm.name as staff_member_name
                FROM bookings b
                LEFT JOIN venues v ON b.venue_id = v.id
                LEFT JOIN services s ON b.service_id = s.id
                LEFT JOIN staff_members sm ON b.staff_member_id = sm.id
                WHERE b.venue_id = ?
            `;

            let countQuery = `
                SELECT COUNT(*) as total
                FROM bookings b
                WHERE b.venue_id = ?
            `;

            const params: (string | number)[] = [venueId];
            const countParams: (string | number)[] = [venueId];

            // Apply filters
            if (filters?.startDate) {
                query += ' AND b.booking_date >= ?';
                countQuery += ' AND b.booking_date >= ?';
                params.push(filters.startDate);
                countParams.push(filters.startDate);
            }

            if (filters?.endDate) {
                query += ' AND b.booking_date <= ?';
                countQuery += ' AND b.booking_date <= ?';
                params.push(filters.endDate);
                countParams.push(filters.endDate);
            }

            if (filters?.status) {
                query += ' AND b.status = ?';
                countQuery += ' AND b.status = ?';
                params.push(filters.status);
                countParams.push(filters.status);
            }

            if (filters?.serviceId) {
                query += ' AND b.service_id = ?';
                countQuery += ' AND b.service_id = ?';
                params.push(filters.serviceId);
                countParams.push(filters.serviceId);
            }

            if (filters?.search) {
                query += ' AND (b.customer_name LIKE ? OR b.customer_email LIKE ? OR b.customer_phone LIKE ?)';
                countQuery += ' AND (b.customer_name LIKE ? OR b.customer_email LIKE ? OR b.customer_phone LIKE ?)';
                const searchTerm = `%${filters.search}%`;
                params.push(searchTerm, searchTerm, searchTerm);
                countParams.push(searchTerm, searchTerm, searchTerm);
            }

            // Order and pagination
            query += ' ORDER BY b.booking_date DESC, b.start_time DESC';

            if (filters?.limit) {
                query += ' LIMIT ?';
                params.push(filters.limit);
            }

            if (filters?.offset) {
                query += ' OFFSET ?';
                params.push(filters.offset);
            }

            const [bookings, countResult] = await Promise.all([
                conn.query(query, params) as Promise<BookingWithDetails[]>,
                conn.query(countQuery, countParams) as Promise<[{ total: bigint }]>
            ]);

            const total = Number(countResult[0]?.total || 0);

            await BookingService.markPastBookingsCompleted(conn, bookings);

            logger.info(`Admin: Found ${bookings.length} bookings (total: ${total})`);

            return { bookings, total };
        } catch (error) {
            logger.error('Admin: Error fetching bookings', error);
            throw error;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Update booking status (admin only)
     */
    static async updateBookingStatus(
        bookingId: number,
        status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show',
        reason?: string
    ): Promise<Booking> {
        logger.info(`Admin: Updating booking ${bookingId} status to ${status}`);

        let conn;
        try {
            conn = await getConnection();

            // Check if booking exists
            const existing = await conn.query(
                'SELECT * FROM bookings WHERE id = ?',
                [bookingId]
            ) as Booking[];

            if (existing.length === 0) {
                throw new Error('Booking not found');
            }

            const currentStatus = existing[0].status;
            const isPendingToConfirmed = currentStatus === 'pending' && status === 'confirmed';
            if (!isPendingToConfirmed) {
                const hasReason = reason != null && String(reason).trim().length > 0;
                if (!hasReason) {
                    throw new Error('Grund ist erforderlich');
                }
            }

            // Update status
            let updateQuery = `
                UPDATE bookings 
                SET status = ?, updated_at = NOW()
            `;
            const params: (string | number | null)[] = [status];

            if (status === 'cancelled') {
                updateQuery += ', cancelled_at = NOW(), cancellation_reason = ?';
                params.push(reason || null);
            }

            if (status === 'confirmed') {
                updateQuery += ', confirmation_sent_at = NOW()';
            }

            updateQuery += ' WHERE id = ?';
            params.push(bookingId);

            await conn.query(updateQuery, params);

            // Get updated booking
            const updated = await conn.query(
                'SELECT * FROM bookings WHERE id = ?',
                [bookingId]
            ) as Booking[];

            if (reason?.trim()) {
                logger.info(`Admin: Booking ${bookingId} status updated to ${status}`, { reason: reason.trim() });
            } else {
                logger.info(`Admin: Booking ${bookingId} status updated to ${status}`);
            }

            return updated[0];
        } catch (error) {
            logger.error('Admin: Error updating booking status', error);
            throw error;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Get dashboard statistics
     */
    static async getStats(venueId: number): Promise<AdminStats> {
        logger.info(`Admin: Fetching stats for venue ${venueId}`);

        let conn;
        try {
            conn = await getConnection();

            // Active bookings (for counts): confirmed + completed; pending/cancelled excluded
            const activeStatusCondition = "status IN ('confirmed', 'completed')";
            const activeStatusConditionB = "b.status IN ('confirmed', 'completed')";
            // Revenue and "completed" stats: only completed = real revenue; cancelled never counted
            const completedOnlyCondition = "status = 'completed'";
            const completedOnlyConditionB = "b.status = 'completed'";

            // Get booking counts (today/week/month = only active; pending/confirmed/cancelled/completed for overview)
            const bookingStats = await conn.query(`
                SELECT
                    COUNT(CASE WHEN booking_date = CURDATE() AND ${activeStatusCondition} THEN 1 END) as today,
                    COUNT(CASE WHEN booking_date >= DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE())) DAY) 
                               AND booking_date < DATE_ADD(CURDATE(), INTERVAL 1 DAY) AND ${activeStatusCondition} THEN 1 END) as this_week,
                    COUNT(CASE WHEN MONTH(booking_date) = MONTH(CURDATE()) 
                               AND YEAR(booking_date) = YEAR(CURDATE()) AND ${activeStatusCondition} THEN 1 END) as this_month,
                    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
                    COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed,
                    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
                    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed
                FROM bookings
                WHERE venue_id = ?
            `, [venueId]) as [{
                today: bigint;
                this_week: bigint;
                this_month: bigint;
                pending: bigint;
                confirmed: bigint;
                cancelled: bigint;
                completed: bigint;
            }];

            // Revenue: only completed (service delivered); confirmed = not yet revenue; cancelled never counted
            const revenueStats = await conn.query(`
                SELECT
                    COALESCE(SUM(CASE WHEN booking_date = CURDATE() AND ${completedOnlyCondition} THEN total_amount END), 0) as today,
                    COALESCE(SUM(CASE WHEN booking_date >= DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE())) DAY) 
                               AND booking_date < DATE_ADD(CURDATE(), INTERVAL 1 DAY) AND ${completedOnlyCondition} THEN total_amount END), 0) as this_week,
                    COALESCE(SUM(CASE WHEN MONTH(booking_date) = MONTH(CURDATE()) 
                               AND YEAR(booking_date) = YEAR(CURDATE()) AND ${completedOnlyCondition} THEN total_amount END), 0) as this_month,
                    COALESCE(SUM(CASE WHEN ${completedOnlyCondition} THEN total_amount END), 0) as total
                FROM bookings
                WHERE venue_id = ?
            `, [venueId]) as [{
                today: string;
                this_week: string;
                this_month: string;
                total: string;
            }];

            // Popular services: only completed (real revenue & count; cancelled excluded)
            const popularServices = await conn.query(`
                SELECT 
                    b.service_id,
                    s.name as service_name,
                    COUNT(*) as booking_count,
                    COALESCE(SUM(b.total_amount), 0) as total_revenue
                FROM bookings b
                JOIN services s ON b.service_id = s.id
                WHERE b.venue_id = ? AND ${completedOnlyConditionB}
                GROUP BY b.service_id, s.name
                ORDER BY booking_count DESC
                LIMIT 5
            `, [venueId]) as Array<{
                service_id: number;
                service_name: string;
                booking_count: bigint;
                total_revenue: string;
            }>;

            // Popular time slots: only completed (cancelled excluded)
            const popularTimeSlots = await conn.query(`
                SELECT 
                    HOUR(start_time) as hour,
                    COUNT(*) as booking_count
                FROM bookings
                WHERE venue_id = ? AND ${completedOnlyCondition}
                GROUP BY HOUR(start_time)
                ORDER BY booking_count DESC
                LIMIT 10
            `, [venueId]) as Array<{
                hour: number;
                booking_count: bigint;
            }>;

            const stats: AdminStats = {
                bookings: {
                    today: Number(bookingStats[0]?.today || 0),
                    thisWeek: Number(bookingStats[0]?.this_week || 0),
                    thisMonth: Number(bookingStats[0]?.this_month || 0),
                    pending: Number(bookingStats[0]?.pending || 0),
                    confirmed: Number(bookingStats[0]?.confirmed || 0),
                    cancelled: Number(bookingStats[0]?.cancelled || 0),
                    completed: Number(bookingStats[0]?.completed || 0),
                },
                revenue: {
                    today: parseFloat(revenueStats[0]?.today || '0'),
                    thisWeek: parseFloat(revenueStats[0]?.this_week || '0'),
                    thisMonth: parseFloat(revenueStats[0]?.this_month || '0'),
                    total: parseFloat(revenueStats[0]?.total || '0'),
                },
                popularServices: popularServices.map(s => ({
                    service_id: s.service_id,
                    service_name: s.service_name,
                    booking_count: Number(s.booking_count),
                    total_revenue: parseFloat(s.total_revenue || '0'),
                })),
                popularTimeSlots: popularTimeSlots.map(t => ({
                    hour: t.hour,
                    booking_count: Number(t.booking_count),
                })),
            };

            logger.info('Admin: Stats fetched successfully');

            return stats;
        } catch (error) {
            logger.error('Admin: Error fetching stats', error);
            throw error;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Get all services for a venue
     */
    static async getServices(venueId: number): Promise<Service[]> {
        logger.info(`Admin: Fetching services for venue ${venueId}`);

        let conn;
        try {
            conn = await getConnection();

            const services = await conn.query(`
                SELECT * FROM services
                WHERE venue_id = ?
                ORDER BY name ASC
            `, [venueId]) as Service[];

            logger.info(`Admin: Found ${services.length} services`);

            return services;
        } catch (error) {
            logger.error('Admin: Error fetching services', error);
            throw error;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Update a service
     */
    static async updateService(
        serviceId: number,
        updates: {
            name?: string;
            description?: string;
            duration_minutes?: number;
            price?: number;
            is_active?: boolean;
        }
    ): Promise<Service> {
        logger.info(`Admin: Updating service ${serviceId}`, updates);

        let conn;
        try {
            conn = await getConnection();

            // Check if service exists
            const existing = await conn.query(
                'SELECT * FROM services WHERE id = ?',
                [serviceId]
            ) as Service[];

            if (existing.length === 0) {
                throw new Error('Service not found');
            }

            // Build update query
            const updateFields: string[] = [];
            const params: (string | number | boolean)[] = [];

            if (updates.name !== undefined) {
                updateFields.push('name = ?');
                params.push(updates.name);
            }
            if (updates.description !== undefined) {
                updateFields.push('description = ?');
                params.push(updates.description);
            }
            if (updates.duration_minutes !== undefined) {
                updateFields.push('duration_minutes = ?');
                params.push(updates.duration_minutes);
            }
            if (updates.price !== undefined) {
                updateFields.push('price = ?');
                params.push(updates.price);
            }
            if (updates.is_active !== undefined) {
                updateFields.push('is_active = ?');
                params.push(updates.is_active);
            }

            if (updateFields.length === 0) {
                return existing[0];
            }

            updateFields.push('updated_at = NOW()');
            params.push(serviceId);

            await conn.query(`
                UPDATE services
                SET ${updateFields.join(', ')}
                WHERE id = ?
            `, params);

            // Get updated service
            const updated = await conn.query(
                'SELECT * FROM services WHERE id = ?',
                [serviceId]
            ) as Service[];

            logger.info(`Admin: Service ${serviceId} updated`);

            return updated[0];
        } catch (error) {
            logger.error('Admin: Error updating service', error);
            throw error;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Get availability rules for staff/venue
     */
    static async getAvailabilityRules(venueId: number): Promise<Array<{
        id: number;
        venue_id: number | null;
        staff_member_id: number | null;
        staff_member_name?: string;
        day_of_week: number;
        start_time: string;
        end_time: string;
        is_active: boolean;
    }>> {
        logger.info(`Admin: Fetching availability rules for venue ${venueId}`);

        let conn;
        try {
            conn = await getConnection();

            const rules = await conn.query(`
                SELECT 
                    ar.*,
                    sm.name as staff_member_name
                FROM availability_rules ar
                LEFT JOIN staff_members sm ON ar.staff_member_id = sm.id
                WHERE ar.venue_id = ? OR ar.staff_member_id IN (
                    SELECT id FROM staff_members WHERE venue_id = ?
                )
                ORDER BY ar.day_of_week, ar.start_time
            `, [venueId, venueId]);

            logger.info(`Admin: Found ${(rules as []).length} availability rules`);

            return rules as Array<{
                id: number;
                venue_id: number | null;
                staff_member_id: number | null;
                staff_member_name?: string;
                day_of_week: number;
                start_time: string;
                end_time: string;
                is_active: boolean;
            }>;
        } catch (error) {
            logger.error('Admin: Error fetching availability rules', error);
            throw error;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Update availability rule
     */
    static async updateAvailabilityRule(
        ruleId: number,
        updates: {
            start_time?: string;
            end_time?: string;
            is_active?: boolean;
        }
    ): Promise<void> {
        logger.info(`Admin: Updating availability rule ${ruleId}`, updates);

        let conn;
        try {
            conn = await getConnection();

            const updateFields: string[] = [];
            const params: (string | boolean | number)[] = [];

            if (updates.start_time !== undefined) {
                updateFields.push('start_time = ?');
                params.push(updates.start_time);
            }
            if (updates.end_time !== undefined) {
                updateFields.push('end_time = ?');
                params.push(updates.end_time);
            }
            if (updates.is_active !== undefined) {
                updateFields.push('is_active = ?');
                params.push(updates.is_active);
            }

            if (updateFields.length === 0) {
                return;
            }

            params.push(ruleId);

            await conn.query(`
                UPDATE availability_rules
                SET ${updateFields.join(', ')}
                WHERE id = ?
            `, params);

            logger.info(`Admin: Availability rule ${ruleId} updated`);
        } catch (error) {
            logger.error('Admin: Error updating availability rule', error);
            throw error;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Update venue settings (booking policies)
     */
    static async updateVenueSettings(
        venueId: number,
        updates: {
            booking_advance_hours?: number;
            cancellation_hours?: number;
        }
    ): Promise<void> {
        logger.info(`Admin: Updating venue ${venueId} settings`, updates);

        let conn;
        try {
            conn = await getConnection();

            const updateFields: string[] = [];
            const params: any[] = [];

            if (updates.booking_advance_hours !== undefined) {
                updateFields.push('booking_advance_hours = ?');
                params.push(updates.booking_advance_hours);
            }

            if (updates.cancellation_hours !== undefined) {
                updateFields.push('cancellation_hours = ?');
                params.push(updates.cancellation_hours);
            }

            if (updateFields.length === 0) {
                logger.warn('No fields to update');
                return;
            }

            params.push(venueId);

            await conn.query(`
                UPDATE venues
                SET ${updateFields.join(', ')}, updated_at = NOW()
                WHERE id = ?
            `, params);

            logger.info(`Admin: Venue ${venueId} settings updated successfully`);
        } catch (error) {
            logger.error('Admin: Error updating venue settings', error);
            throw error;
        } finally {
            if (conn) conn.release();
        }
    }
}
