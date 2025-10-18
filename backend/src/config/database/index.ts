import mariadb, { PoolConnection } from 'mariadb';
import dotenv from 'dotenv';
import { createLogger } from '../utils/logger'

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
        conn = await pool.getConnection();
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