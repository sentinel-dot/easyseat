import dotenv from 'dotenv';
import mariadb from 'mariadb';

import { createLogger } from '../config/utils/logger';
import { 
    Venue, 
    VenueWithStaff, 
    Service, 
    StaffMember 
} from '../config/utils/types';

const logger = createLogger('venue.service');

dotenv.config({ path: '.env' });

const mariadbSocket = '/run/mysqld/mysqld.sock';

const pool = mariadb.createPool({
    socketPath: mariadbSocket,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 10,
});

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
            conn = await pool.getConnection();
            logger.debug('Database connection established');

            const venues = await conn.query(`
                SELECT id, name, type, email, phone, address, city, postal_code, country,
                    description, website_url, booking_advance_days, cancellation_hours,
                    require_phone, require_deposit, deposit_amount, created_at, updated_at
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
            conn = await pool.getConnection();
            logger.debug('Database connection established');

            // Venue abrufen
            const venues = await conn.query(`
                SELECT id, name, type, email, phone, address, city, postal_code, country,
                       description, website_url, booking_advance_days, cancellation_hours,
                       require_phone, require_deposit, deposit_amount, created_at, updated_at
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
                       capacity, requires_staff, created_at, updated_at
                FROM services
                WHERE venue_id = ?
                AND is_active = true
                ORDER BY name ASC`,
                [venueId]
            ) as Service[];

            // Staff-Mitglieder abrufen
            const staffMembers = await conn.query(`
                SELECT id, venue_id, name, email, phone, 
                       description, created_at, updated_at
                FROM staff_members
                WHERE venue_id = ?
                AND is_active = true
                ORDER BY name ASC`,
                [venueId]
            ) as StaffMember[];

            // Venue mit Services und Staff kombinieren
            const venueWithDetails: VenueWithStaff = {
                ...venue,
                services: services,
                staff_members: staffMembers
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
            conn = await pool.getConnection();

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