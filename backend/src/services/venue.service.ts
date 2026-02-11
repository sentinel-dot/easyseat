import dotenv from 'dotenv';

import { createLogger } from '../config/utils/logger';
import { 
    Venue, 
    VenueWithStaff, 
    Service, 
    StaffMember 
} from '../config/utils/types';
import { getConnection } from '../config/database';

const logger = createLogger('venue.service');

dotenv.config({ path: '.env' });

export class VenueService 
{
    /**
     * Holt alle aktiven Venues
     */
    static async getAllVenues(): Promise<Venue[]>
    {   
        logger.info('Fetching all venues...');

        let conn;
        try 
        {
            conn = await getConnection();
            logger.debug('Database connection established');

            const venues = await conn.query(`
                SELECT id, name, type, email, phone, address, city, postal_code, country,
                    description, website_url, booking_advance_days, booking_advance_hours, cancellation_hours,
                    require_phone, require_deposit, deposit_amount, is_active, created_at, updated_at
                FROM venues
                WHERE is_active = true
                ORDER BY name ASC`
            ) as Venue[];
        
            logger.info(`${venues.length} Venues fetched successfully`);
        
            return venues;
        } 
        catch (error) 
        {
            logger.error('Error fetching venues', error);
            throw error;
        }
        finally
        {
            if (conn)
            {
                conn.release();
                logger.debug('Database connection released');
            }
        }
    }

    /**
     * Holt ein spezifisches Venue mit Services und Staff
     */
    static async getVenueById(venueId: number): Promise<VenueWithStaff | null>
    {
        logger.info(`Fetching venue by ID ${venueId}`);

        let conn;
        try 
        {
            conn = await getConnection();
            logger.debug('Database connection established');

            // Venue abrufen
            const venues = await conn.query(`
                SELECT id, name, type, email, phone, address, city, postal_code, country,
                       description, website_url, booking_advance_days, booking_advance_hours, cancellation_hours,
                       require_phone, require_deposit, deposit_amount, is_active, created_at, updated_at
                FROM venues
                WHERE id = ?
                AND is_active = true
                LIMIT 1`,
                [venueId]
            ) as Venue[];

            if (venues.length === 0)
            {
                logger.warn(`Venue not found`);
                return null;
            }

            const venue = venues[0];
            //logger.debug('Venue found');

            // Services abrufen
            const services = await conn.query(`
                SELECT id, venue_id, name, description, duration_minutes, price,
                       capacity, requires_staff, is_active, created_at, updated_at
                FROM services
                WHERE venue_id = ?
                AND is_active = true
                ORDER BY name ASC`,
                [venueId]
            ) as Service[];

            // Staff-Mitglieder abrufen
            const staffMembers = await conn.query(`
                SELECT id, venue_id, name, email, phone, 
                       description, is_active, created_at, updated_at
                FROM staff_members
                WHERE venue_id = ?
                AND is_active = true
                ORDER BY name ASC`,
                [venueId]
            ) as StaffMember[];

            // Öffnungszeiten: zuerst Venue-Level, sonst aus Staff-Regeln aggregieren
            let openingHours: { day_of_week: number; start_time: string; end_time: string }[] = [];
            const venueRules = await conn.query(`
                SELECT day_of_week, start_time, end_time
                FROM availability_rules
                WHERE venue_id = ?
                AND is_active = true
                ORDER BY day_of_week, start_time`,
                [venueId]
            ) as { day_of_week: number; start_time: string; end_time: string }[];

            if (venueRules.length > 0) {
                openingHours = venueRules;
            } else if (staffMembers.length > 0) {
                const staffIds = staffMembers.map((s) => s.id);
                const placeholders = staffIds.map(() => '?').join(',');
                const staffRules = await conn.query(`
                    SELECT day_of_week, start_time, end_time
                    FROM availability_rules
                    WHERE staff_member_id IN (${placeholders})
                    AND is_active = true
                    ORDER BY day_of_week, start_time`,
                    staffIds
                ) as { day_of_week: number; start_time: string; end_time: string }[];
                openingHours = staffRules;
            }

            // Venue mit Services, Staff und Öffnungszeiten kombinieren
            const venueWithDetails: VenueWithStaff = {
                ...venue,
                services: services,
                staff_members: staffMembers,
                opening_hours: openingHours
            };

            logger.info('Venue details fetched successfully', venueWithDetails);

            return venueWithDetails;
        } 
        catch (error) 
        {
            logger.error('Error fetching venue by ID', error);
            throw error;
        }
        finally
        {
            if (conn)
            {
                conn.release();
                logger.debug('Database connection released');
            }
        }
    }




    /**
     * Prüft ob Venue existiert und aktiv ist
     */
    static async venueExists(venueId: number): Promise<boolean>
    {
        logger.debug(`Checking if venue [${venueId}] exists...`);

        let conn;
        try 
        {
            conn = await getConnection();

            const venues = await conn.query(`
                SELECT id
                FROM venues
                WHERE id = ?
                AND is_active = true
                LIMIT 1`,
                [venueId]
            ) as { id: number }[];

            const exists = venues.length > 0;

            if (!exists) 
            {
                logger.warn('Venue does not exist or is inactive');
            }

            return exists;
        } 
        catch (error) 
        {
            logger.error('Error checking venue existence', error);
            throw error;
        }
        finally
        {
            if (conn)
            {
                conn.release();
            }
        }
    }
}