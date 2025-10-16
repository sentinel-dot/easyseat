import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { createLogger } from './config/utils/logger';

import venueRoutes from './routes/venue.routes';
import availabilityRoutes from './routes/availability.routes'

dotenv.config();

const app = express();
const PORT = process.env.PORT;
const logger = createLogger('backend_server');

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic Route
app.get('/', (req: express.Request, res: express.Response) => {
    logger.info('Received Request: GET /');
    res.json({
        message: 'easyseat backend api',
        version: '1.0.0'
    });
});

app.get('/health', (req: express.Request, res: express.Response) => {
    logger.info('Received Request: GET /health');
    res.json({
        status: 'HEALTHY',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV
    });
});


// Venue routes
app.use('/venues', venueRoutes);

// Availability routes
app.use('/availability', availabilityRoutes)


// 404 - Handler
app.use((req: express.Request, res: express.Response) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
    logger.warn(`Route ${req.originalUrl} not found`)
});

const startServer = async() => {
    logger.separator();
    logger.separator();
    logger.separator();
    logger.info('Starting server...')
    try {
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
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit();
    }
};

startServer();
