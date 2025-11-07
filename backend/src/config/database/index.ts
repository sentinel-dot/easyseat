import mariadb, { PoolConnection } from 'mariadb';
import dotenv from 'dotenv';
import { createLogger } from '../utils/logger'
import { randomUUID } from 'crypto';

dotenv.config({ path: '.env'});

const logger = createLogger('database');

const mariadbSocket = '/run/mysqld/mysqld.sock';

const pool = mariadb.createPool({
    socketPath: mariadbSocket,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 10
});

/**
 * Hole eine Datenbankverbindung aus dem Pool
 * Diese Funktion wirft einen Fehler, wenn keine Verbindung möglich ist
 */
export async function getConnection(): Promise<PoolConnection>
{
    try 
    {
        const conn = await pool.getConnection();
        logger.debug('Database connection aquired from pool');
        return conn;
    } 
    catch (error) 
    {
        logger.error('Failed to get database connection', error);
        throw new Error('Database connection failed');    
    }
}

/**
 * Teste die Datenbankverbindung beim Start
 */
export async function testConnection(): Promise<boolean>
{
    let conn: PoolConnection | null = null;
    try 
    {
        conn = await getConnection();
        logger.info('Database connection test successful');
        return true;    
    } 
    catch (error) 
    {
        logger.error('Database connection test failed', error);
        return false;
    }
    finally
    {
        if (conn)
        {
            conn.release();
            logger.debug('Test connection released');
        }
    }
}

/**
 * Teste die Datenbankverbindung beim Start
 */
export async function resetBookingsTable(): Promise<boolean>
{
    let conn: PoolConnection | null = null;
    try 
    {
        conn = await getConnection();

        await conn.query('SET FOREIGN_KEY_CHECKS = 0');
        await conn.query('DELETE FROM bookings');
        await conn.query('ALTER TABLE bookings AUTO_INCREMENT = 1');
        await conn.query(
            'INSERT INTO bookings (booking_token, venue_id, service_id, staff_member_id, customer_name, customer_email, customer_phone, booking_date, start_time, end_time, party_size, status, special_requests, total_amount, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
            [randomUUID(), 1, 2, null, 'Familie Müller', 'mueller@example.com', '+49 170 1234567', new Date(), '19:00', '21:00', 4, 'confirmed', 'Vegetarische Optionen gewünscht', null, new Date(), new Date()]
        );

        await conn.query(
            'INSERT INTO bookings (booking_token, venue_id, service_id, staff_member_id, customer_name, customer_email, customer_phone, booking_date, start_time, end_time, party_size, status, special_requests, total_amount, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
            [randomUUID(), 2, 4, 2, 'Peter Schmidt', 'peter@example.com', null, new Date(), '10:00', '10:45', 1, 'pending', null, 35.00, new Date(), new Date()]
        );
        await conn.query('SET FOREIGN_KEY_CHECKS = 1');
        
        return true;    
    } 
    catch (error) 
    {
        logger.error('Reset bookings table failed', error);
        return false;
    }
    finally
    {
        if (conn)
        {
            conn.release();
            logger.debug('Test connection released');
        }
    }
}




/**
 * Schließe den Connection Pool sauber
 * Sollte beim Herunterfahren der App aufgerufen werden
 */
export async function closePool(): Promise<void>
{
    try 
    {
        await pool.end();
        logger.info('Database pool closed successfully');    
    } 
    catch (error) 
    {
        logger.error('Error closing database pool', error);
        throw error;
    }
}

/**
 * Graceful Shutdown Handler
 */
export function setupGracefulShutdown(): void
{
    const shutdown = async (signal: string) => {
        logger.info(`${signal} received, closing database pool...`);
        try 
        {
            await closePool();
            process.exit(0);    
        } 
        catch (error) 
        {
            logger.error('Error during shutdown', error);
            process.exit(1);    
        }
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
}