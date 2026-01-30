import { Router, Request, Response } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';
import { AdminService } from '../services/admin.service';
import { BookingService } from '../services/booking.service';
import { VenueService } from '../services/venue.service';
import { createLogger } from '../config/utils/logger';
import { CreateBookingData } from '../config/utils/types';

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

/**
 * POST /admin/bookings
 * Create a manual booking (bypasses booking_advance_hours check)
 * 
 * This allows admins to create last-minute bookings for:
 * - Walk-ins
 * - Family members filling slots
 * - Emergency appointments
 */
router.post('/bookings', async (req: Request, res: Response) => {
    logger.info('POST /admin/bookings - Manual booking creation');

    try {
        const venueId = req.jwtPayload?.venueId;

        if (!venueId) {
            res.status(403).json({
                success: false,
                message: 'Kein Venue zugewiesen'
            });
            return;
        }

        const bookingData: CreateBookingData = {
            ...req.body,
            venue_id: venueId  // Force venue_id from JWT
        };

        // Validate required fields
        const requiredFields = [
            'service_id',
            'customer_name',
            'customer_email',
            'booking_date',
            'start_time',
            'end_time',
            'party_size'
        ];

        const missingFields = requiredFields.filter(field => !bookingData[field as keyof CreateBookingData]);

        if (missingFields.length > 0) {
            res.status(400).json({
                success: false,
                message: `Fehlende Felder: ${missingFields.join(', ')}`
            });
            return;
        }

        // Create booking with bypass flag (ignores booking_advance_hours)
        const booking = await BookingService.createBooking(bookingData, true);

        res.status(201).json({
            success: true,
            data: booking,
            message: 'Buchung erfolgreich erstellt'
        });
    } catch (error) {
        logger.error('Error creating manual booking', error);
        
        const errorMessage = (error as Error).message || 'Unknown error';

        if (errorMessage.includes('not available')) {
            res.status(400).json({
                success: false,
                message: 'Zeitslot nicht verfügbar'
            });
            return;
        }

        res.status(500).json({
            success: false,
            message: 'Fehler beim Erstellen der Buchung'
        });
    }
});

/**
 * GET /admin/venue/settings
 * Get venue settings (including booking policies)
 */
router.get('/venue/settings', async (req: Request, res: Response) => {
    logger.info('GET /admin/venue/settings');

    try {
        const venueId = req.jwtPayload?.venueId;

        if (!venueId) {
            res.status(403).json({
                success: false,
                message: 'Kein Venue zugewiesen'
            });
            return;
        }

        const venue = await VenueService.getVenueById(venueId);

        if (!venue) {
            res.status(404).json({
                success: false,
                message: 'Venue nicht gefunden'
            });
            return;
        }

        res.json({
            success: true,
            data: venue
        });
    } catch (error) {
        logger.error('Error fetching venue settings', error);
        res.status(500).json({
            success: false,
            message: 'Fehler beim Laden der Einstellungen'
        });
    }
});

/**
 * PATCH /admin/venue/settings
 * Update venue settings (booking_advance_hours, cancellation_hours, etc.)
 */
router.patch('/venue/settings', requireRole('owner', 'admin'), async (req: Request, res: Response) => {
    logger.info('PATCH /admin/venue/settings');

    try {
        const venueId = req.jwtPayload?.venueId;

        if (!venueId) {
            res.status(403).json({
                success: false,
                message: 'Kein Venue zugewiesen'
            });
            return;
        }

        const { booking_advance_hours, cancellation_hours } = req.body;

        // Validate values if provided
        if (booking_advance_hours !== undefined) {
            if (typeof booking_advance_hours !== 'number' || booking_advance_hours < 0) {
                res.status(400).json({
                    success: false,
                    message: 'booking_advance_hours muss eine positive Zahl sein'
                });
                return;
            }
        }

        if (cancellation_hours !== undefined) {
            if (typeof cancellation_hours !== 'number' || cancellation_hours < 0) {
                res.status(400).json({
                    success: false,
                    message: 'cancellation_hours muss eine positive Zahl sein'
                });
                return;
            }
        }

        await AdminService.updateVenueSettings(venueId, {
            booking_advance_hours,
            cancellation_hours
        });

        res.json({
            success: true,
            message: 'Einstellungen erfolgreich aktualisiert'
        });
    } catch (error) {
        logger.error('Error updating venue settings', error);
        res.status(500).json({
            success: false,
            message: 'Fehler beim Aktualisieren der Einstellungen'
        });
    }
});

export default router;
