import { Router, Request, Response } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';
import { AdminService } from '../services/admin.service';
import { createLogger } from '../config/utils/logger';

const router = Router();
const logger = createLogger('admin.routes');

// All admin routes require authentication
router.use(authenticateToken);

/**
 * GET /admin/bookings
 * Get all bookings for the admin's venue with optional filters
 */
router.get('/bookings', async (req: Request, res: Response) => {
    logger.info('GET /admin/bookings');

    try {
        const venueId = req.jwtPayload?.venueId;

        if (!venueId) {
            res.status(403).json({
                success: false,
                message: 'Kein Venue zugewiesen'
            });
            return;
        }

        const filters = {
            startDate: req.query.startDate as string | undefined,
            endDate: req.query.endDate as string | undefined,
            status: req.query.status as string | undefined,
            serviceId: req.query.serviceId ? parseInt(req.query.serviceId as string) : undefined,
            search: req.query.search as string | undefined,
            limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
            offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
        };

        const result = await AdminService.getBookings(venueId, filters);

        res.json({
            success: true,
            data: result.bookings,
            pagination: {
                total: result.total,
                limit: filters.limit,
                offset: filters.offset
            }
        });
    } catch (error) {
        logger.error('Error fetching admin bookings', error);
        res.status(500).json({
            success: false,
            message: 'Fehler beim Laden der Buchungen'
        });
    }
});

/**
 * PATCH /admin/bookings/:id/status
 * Update booking status
 */
router.patch('/bookings/:id/status', async (req: Request, res: Response) => {
    const bookingId = parseInt(req.params.id);
    logger.info(`PATCH /admin/bookings/${bookingId}/status`);

    try {
        const { status, reason } = req.body;

        if (!status) {
            res.status(400).json({
                success: false,
                message: 'Status ist erforderlich'
            });
            return;
        }

        const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'];
        if (!validStatuses.includes(status)) {
            res.status(400).json({
                success: false,
                message: 'Ungültiger Status'
            });
            return;
        }

        const booking = await AdminService.updateBookingStatus(bookingId, status, reason);

        res.json({
            success: true,
            data: booking,
            message: 'Status erfolgreich aktualisiert'
        });
    } catch (error) {
        logger.error('Error updating booking status', error);
        
        if ((error as Error).message === 'Booking not found') {
            res.status(404).json({
                success: false,
                message: 'Buchung nicht gefunden'
            });
            return;
        }

        res.status(500).json({
            success: false,
            message: 'Fehler beim Aktualisieren des Status'
        });
    }
});

/**
 * GET /admin/stats
 * Get dashboard statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
    logger.info('GET /admin/stats');

    try {
        const venueId = req.jwtPayload?.venueId;

        if (!venueId) {
            res.status(403).json({
                success: false,
                message: 'Kein Venue zugewiesen'
            });
            return;
        }

        const stats = await AdminService.getStats(venueId);

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        logger.error('Error fetching admin stats', error);
        res.status(500).json({
            success: false,
            message: 'Fehler beim Laden der Statistiken'
        });
    }
});

/**
 * GET /admin/services
 * Get all services for venue
 */
router.get('/services', async (req: Request, res: Response) => {
    logger.info('GET /admin/services');

    try {
        const venueId = req.jwtPayload?.venueId;

        if (!venueId) {
            res.status(403).json({
                success: false,
                message: 'Kein Venue zugewiesen'
            });
            return;
        }

        const services = await AdminService.getServices(venueId);

        res.json({
            success: true,
            data: services
        });
    } catch (error) {
        logger.error('Error fetching services', error);
        res.status(500).json({
            success: false,
            message: 'Fehler beim Laden der Services'
        });
    }
});

/**
 * PATCH /admin/services/:id
 * Update a service
 */
router.patch('/services/:id', requireRole('owner', 'admin'), async (req: Request, res: Response) => {
    const serviceId = parseInt(req.params.id);
    logger.info(`PATCH /admin/services/${serviceId}`);

    try {
        const { name, description, duration_minutes, price, is_active } = req.body;

        const service = await AdminService.updateService(serviceId, {
            name,
            description,
            duration_minutes,
            price,
            is_active
        });

        res.json({
            success: true,
            data: service,
            message: 'Service erfolgreich aktualisiert'
        });
    } catch (error) {
        logger.error('Error updating service', error);

        if ((error as Error).message === 'Service not found') {
            res.status(404).json({
                success: false,
                message: 'Service nicht gefunden'
            });
            return;
        }

        res.status(500).json({
            success: false,
            message: 'Fehler beim Aktualisieren des Services'
        });
    }
});

/**
 * GET /admin/availability
 * Get availability rules
 */
router.get('/availability', async (req: Request, res: Response) => {
    logger.info('GET /admin/availability');

    try {
        const venueId = req.jwtPayload?.venueId;

        if (!venueId) {
            res.status(403).json({
                success: false,
                message: 'Kein Venue zugewiesen'
            });
            return;
        }

        const rules = await AdminService.getAvailabilityRules(venueId);

        res.json({
            success: true,
            data: rules
        });
    } catch (error) {
        logger.error('Error fetching availability rules', error);
        res.status(500).json({
            success: false,
            message: 'Fehler beim Laden der Verfügbarkeiten'
        });
    }
});

/**
 * PATCH /admin/availability/:id
 * Update availability rule
 */
router.patch('/availability/:id', requireRole('owner', 'admin'), async (req: Request, res: Response) => {
    const ruleId = parseInt(req.params.id);
    logger.info(`PATCH /admin/availability/${ruleId}`);

    try {
        const { start_time, end_time, is_active } = req.body;

        await AdminService.updateAvailabilityRule(ruleId, {
            start_time,
            end_time,
            is_active
        });

        res.json({
            success: true,
            message: 'Verfügbarkeit erfolgreich aktualisiert'
        });
    } catch (error) {
        logger.error('Error updating availability rule', error);
        res.status(500).json({
            success: false,
            message: 'Fehler beim Aktualisieren der Verfügbarkeit'
        });
    }
});

export default router;
