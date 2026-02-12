import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import { createLogger } from './config/utils/logger';
import { testConnection, setupGracefulShutdown } from './config/database';

import venueRoutes from './routes/venue.routes';
import availabilityRoutes from './routes/availability.routes';
import bookingRoutes from './routes/booking.routes';
import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin.routes';
import dashboardRoutes from './routes/dashboard.routes';
import { assertSecureJwtSecret } from './services/auth.service';
import { startReminderCron } from './jobs/reminder.job';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const logger = createLogger('backend.server');

// Security headers (Helmet)
app.use(helmet());

// CORS: eine Origin (FRONTEND_URL) oder mehrere komma-getrennt (FRONTEND_URLS), für Vercel + Previews
const frontendUrls = process.env.FRONTEND_URLS
    ? process.env.FRONTEND_URLS.split(',').map((u) => u.trim()).filter(Boolean)
    : process.env.FRONTEND_URL
        ? [process.env.FRONTEND_URL]
        : [];
const corsOrigin = frontendUrls.length > 0
    ? (origin: string | undefined, cb: (err: Error | null, allow?: boolean) => void) => {
        if (!origin || frontendUrls.includes(origin)) cb(null, true);
        else cb(null, false);
    }
    : process.env.FRONTEND_URL || false;
app.use(cors({
    origin: corsOrigin,
    credentials: true,
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting: allgemein (z. B. 100 Requests / 15 Min pro IP)
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === 'production' ? 100 : 500,
    message: { success: false, message: 'Zu viele Anfragen. Bitte später erneut versuchen.' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(generalLimiter);

// Strikteres Limit für Login (Brute-Force-Schutz)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === 'production' ? 10 : 30,
    message: { success: false, message: 'Zu viele Login-Versuche. Bitte in 15 Minuten erneut versuchen.' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/auth', authLimiter);


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
    const payload: { status: string; timestamp: string; uptime: number; environment?: string } = {
        status: 'HEALTHY',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    };
    // In Production keine Umgebungsinfos preisgeben
    if (process.env.NODE_ENV !== 'production') {
        payload.environment = process.env.NODE_ENV;
    }
    res.json(payload);
    logger.separator();
});


// Auth routes
app.use('/auth', authRoutes);

// Venue routes
app.use('/venues', venueRoutes);

// Availability routes
app.use('/availability', availabilityRoutes);

// Booking routes
app.use('/bookings', bookingRoutes);

// Admin routes (protected, role admin = System: Venues, User, Stats)
app.use('/admin', adminRoutes);

// Dashboard routes (protected, role owner/staff = Venue-Management)
app.use('/dashboard', dashboardRoutes);


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
        assertSecureJwtSecret();
        // Teste Datenbankverbindung VOR dem Start
        const dbConnected = await testConnection();
        
        if (!dbConnected) {
            logger.error('Failed to connect to database. Exiting...');
            process.exit(1);
        }

        // Setup Graceful Shutdown Handler
        setupGracefulShutdown();


        app.listen(PORT, () => {
            startReminderCron();
            logger.info(`🚀 Backend-Server running on http://localhost:${PORT}`);
            logger.info(`🌍 Environment: ${process.env.NODE_ENV}`);
            logger.info(`🔗 CORS enabled for: ${frontendUrls.length ? frontendUrls.join(', ') : process.env.FRONTEND_URL || 'none'}\n`);
            logger.info('📚 Available endpoints:');
            logger.info('');
            logger.info('   ℹ️  General:');
            logger.info('   GET    / - Info check');
            logger.info('   GET    /health - Healthcheck');
            logger.info('');
            logger.info('   🔐 Auth:');
            logger.info('   POST   /auth/login - Login with email/password');
            logger.info('   GET    /auth/me - Get current user (requires auth)');
            logger.info('   POST   /auth/logout - Logout (requires auth)');
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
            logger.info('');
            logger.info('   👤 Admin – System (role admin):');
            logger.info('   GET    /admin/stats - Global stats');
            logger.info('   GET    /admin/venues - List venues');
            logger.info('   GET    /admin/venues/:id - Get venue');
            logger.info('   POST   /admin/venues - Create venue');
            logger.info('   PATCH  /admin/venues/:id - Update venue');
            logger.info('   GET    /admin/users - List users');
            logger.info('   POST   /admin/users - Create user');
            logger.info('   PATCH  /admin/users/:id - Update user');
            logger.info('   PATCH  /admin/users/:id/password - Set user password');
            logger.info('   📊 Dashboard – Venue (role owner/staff):');
            logger.info('   GET    /dashboard/bookings - Get bookings');
            logger.info('   POST   /dashboard/bookings - Create manual booking');
            logger.info('   PATCH  /dashboard/bookings/:id/status - Update booking status');
            logger.info('   GET    /dashboard/stats - Venue stats');
            logger.info('   GET    /dashboard/services - Get services');
            logger.info('   PATCH  /dashboard/services/:id - Update service');
            logger.info('   GET    /dashboard/availability - Get availability rules');
            logger.info('   PATCH  /dashboard/availability/:id - Update availability rule');
            logger.info('   GET    /dashboard/venue/settings - Get venue settings');
            logger.info('   PATCH  /dashboard/venue/settings - Update venue settings');
            logger.info('   PATCH  /dashboard/me/password - Change password');
            logger.separator();
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit();
    }
};

startServer();
