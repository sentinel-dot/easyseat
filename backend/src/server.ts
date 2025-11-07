import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { createLogger } from './config/utils/logger';
import { testConnection, setupGracefulShutdown, resetBookingsTable } from './config/database';

import venueRoutes from './routes/venue.routes';
import availabilityRoutes from './routes/availability.routes';
import bookingRoutes from './routes/booking.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT;
const logger = createLogger('backend.server');

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Basic Route
app.get('/', (req, res) => {
    logger.separator();
    logger.info('Received Request - GET /');
    res.json({
        message: 'easyseat backend api',
        version: '1.0.0'
    });
    logger.separator();
});

app.get('/health', (req, res) => {
    logger.separator();
    logger.info('Received Request - GET /health');
    res.json({
        status: 'HEALTHY',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV
    });
    logger.separator();
});


// Venue routes
app.use('/venues', venueRoutes);

// Availability routes
app.use('/availability', availabilityRoutes);

// Booking routes
app.use('/bookings', bookingRoutes);


// 404 - Handler
app.use((req, res) => 
{
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
    logger.warn(`Route ${req.originalUrl} not found`)
});

// Error Handler (MUSS nach allen anderen Routes kommen)
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    logger.error('Unhandled error', err);
    
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const startServer = async() => {
    logger.separator();
    logger.separator();
    logger.separator();
    logger.info('Starting server...')
    try 
    {
        // Teste Datenbankverbindung VOR dem Start
        const dbConnected = await testConnection();
        
        if (!dbConnected) {
            logger.error('Failed to connect to database. Exiting...');
            process.exit(1);
        }

        const resetDb = await resetBookingsTable();

        const message = resetDb 
            ? 'Successfully reset bookings table.'
            : 'Failed to reset bookings database.'

        logger.info(message);

        // Setup Graceful Shutdown Handler
        setupGracefulShutdown();


        app.listen(PORT, () => {
            logger.info(`🚀 Backend-Server running on http://localhost:${PORT}`);
            logger.info(`🌍 Environment: ${process.env.NODE_ENV}`);
            logger.info(`🔗 CORS enabled for: ${process.env.FRONTEND_URL}\n`);
            logger.info('📚 Available endpoints:');
            logger.info('');
            logger.info('   ℹ️  General:');
            logger.info('   GET    / - Info check');
            logger.info('   GET    /health - Healthcheck');
            logger.info('');
            logger.info('   🏢 Venues:');
            logger.info('   GET    /venues - All venues');
            logger.info('   GET    /venues/:id - Venue by ID (with services & staff)');
            logger.info('');
            logger.info('   📅 Availability:');
            logger.info('   GET    /availability/slots - Available slots for a day');
            logger.info('   GET    /availability/week - Available slots for a week');
            logger.info('   POST   /availability/check - Check if time slot is available');
            logger.info('   POST   /availability/validate - Validate booking request');
            logger.info('   GET    /availability/service/:serviceId - Service details');
            logger.info('   GET    /availability/staff/:staffId/can-perform/:serviceId - Check staff capability');
            logger.info('');
            logger.info('   📖 Bookings:');
            logger.info('   POST   /bookings - Create new booking');
            logger.info('   GET    /bookings/:id - Get booking by ID');
            logger.info('   GET    /venues/:venueId/bookings - Get all bookings for venue');
            logger.info('   GET    /bookings/customer/:email - Get bookings by customer email');
            logger.info('   PATCH  /bookings/:id - Update booking (email verification required)');
            logger.info('   POST   /bookings/:id/confirm - Confirm booking');
            logger.info('   POST   /bookings/:id/cancel - Cancel booking (email verification required)');
            logger.info('   DELETE /bookings/:id - Delete booking (ADMIN ONLY)');
            logger.separator();
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit();
    }
};

startServer();
