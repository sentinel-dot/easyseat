import express from 'express';
import mariadb from 'mariadb';
import dotenv from 'dotenv';

import { createLogger } from '../config/utils/logger';

import { Venue, VenueWithStaff, Service, StaffMember, ApiResponse } from '../config/utils/types';

const router = express.Router();
const logger = createLogger('venues_route');

dotenv.config({ path: '.env' });

const mariadb_socket = '/run/mysqld/mysqld.sock';

const pool = mariadb.createPool({
    socketPath: mariadb_socket,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 10,
});


// GET /venues - Liste aller Venues
router.get('/', async (req, res) => 
{
    logger.separator();
    logger.info('Received Request: GET /venues');
    
    let conn;
    try 
    {
        conn = await pool.getConnection();
        logger.debug('Database connection established');

        const all_venues = await conn.query(`
            SELECT id, name, type, email, phone, address, city, postal_code, country,
                   description, website_url, booking_advance_days, cancellation_hours,
                   require_phone, require_deposit, deposit_amount, created_at, updated_at
            FROM business
            WHERE is_active = true
            ORDER BY name ASC`
        );

        const all_venues_typed = all_venues as Venue[];

        res.json({
            success: true,
            message: `${all_venues_typed.length} venues found`,
            data: all_venues_typed
        } as ApiResponse<Venue[]>);

        logger.info('Success response sent', {
            venuesCount: all_venues_typed.length
        });
    } 
    catch (error) 
    {
        logger.error('Failed to retrieve venues', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve all venues',
            error: process.env.NODE_ENV === 'development' ? String(error) : undefined
        } as ApiResponse<void>);

        logger.info('Failed response sent');
    }
    finally
    {
        if (conn)
        {
            conn.release();
            logger.debug('Database connection released');
        }
    }
    logger.separator();
});

// GET /venues/:id - Ein spezifisches Venue
router.get('/:id', async(req, res) => 
{
    logger.separator();
    const id = parseInt(req.params.id);
    logger.info(`Received Request: GET /venues/${id}`);

    if (isNaN(id) || id <= 0)
    {
        logger.warn('Invalid venue ID provided', { providedId: req.params.id });
        logger.info('Warning response sent');
        return res.status(400).json({
            success: false,
            message: 'Invalid venue ID'
        } as ApiResponse<void>);
    }

    let conn;
    try 
    {
        conn = await pool.getConnection();
        logger.debug('Database connection established');

        const venue_by_id = await conn.query(`
            SELECT id, name, type, email, phone, address, city, postal_code, country,
                   description, website_url, booking_advance_days, cancellation_hours,
                   require_phone, require_deposit, deposit_amount, created_at, updated_at
            FROM business
            WHERE id = ?
            AND is_active = true
            LIMIT 1`,
            [id]
        );

        if (venue_by_id.length === 0)
        {
            logger.warn('Venue not found', { venueId: id });
            logger.info('Warning response sent');

            return res.status(404).json({
                success: false,
                message: 'Venue not found'
            } as ApiResponse<void>);
        }

        const venue = venue_by_id[0] as Venue;
        const venue_id = venue.id;
        logger.info('Venue found', { venueId: id, venueName: venue.name, venueType: venue.type });


        // Services abrufen
        const services = await conn.query(`
            SELECT id, business_id, name, description, duration_minutes, price,
                   capacity, requires_staff, created_at, updated_at
            FROM services
            WHERE business_id = ?
            AND is_active = true
            ORDER BY name ASC`,
            [venue_id]
        );

        // Staff-Mitglieder abrufen
        const staff_members = await conn.query(`
            SELECT id, business_id, name, email, phone, 
                   description, created_at, updated_at
            FROM staff_members
            WHERE business_id = ?
            AND is_active = true
            ORDER BY name ASC`,
            [venue_id]
        );

        // Venue mit Services und Staff kombinieren
        const venue_with_details: VenueWithStaff = {
            ...venue,
            services: services as Service[],
            staff_members: staff_members as StaffMember[]
        };

        logger.info('Success response sent', {
            venueId: id,
            servicesCount: services.length,
            staffCount: staff_members.length
        });


        return res.json({
            success: true,
            message: 'Venue details retrieved successfully',
            data: venue_with_details
        } as ApiResponse<VenueWithStaff>);
    } 
    catch (error) 
    {
        logger.error(`Failed to retrieve venue details for ID ${id} with error:`, error);

        res.status(500).json({
            success: false,
            message: 'Failed to retrieve venue',
            error: process.env.NODE_ENV === 'development' ? String(error) : undefined
        } as ApiResponse<void>);

        logger.info('Failed response sent');
    }
    finally
    {
        if (conn) 
        {
            conn.release();
            logger.debug('Database connection released');
            logger.separator();
        }
    }
});


export default router;

