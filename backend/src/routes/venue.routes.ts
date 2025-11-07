import express, { Request, Response } from 'express';
import { createLogger } from '../config/utils/logger';
import { VenueService } from '../services/venue.service';
import { Venue, VenueWithStaff, ApiResponse, Booking } from '../config/utils/types';
import { BookingService } from '../services/booking.service';

const router = express.Router();
const logger = createLogger('venue.routes');

/**
 * GET /venues
 * Liste aller aktiven Venues
 */
router.get('/', async (req, res) => 
{
    logger.separator();
    logger.info('Received request - GET /venues');
    
    try 
    {
        const venues = await VenueService.getAllVenues();

        res.json({
            success: true,
            message: `${venues.length} venue${venues.length !== 1 ? 's' : ''} found`,
            data: venues
        } as ApiResponse<Venue[]>);
    } 
    catch (error) 
    {     
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve venues',
            error: process.env.NODE_ENV === 'development' ? String(error) : undefined
        } as ApiResponse<void>);
    }
    finally
    {
        logger.info('Response sent');
        logger.separator();
    }
});

/**
 * GET /venues/:id
 * Ein spezifisches Venue mit Services und Staff
 */
router.get('/:id', async (req, res) => 
{
    logger.separator();
    logger.info(`Received request - GET /venues/id`);

    const id = parseInt(req.params.id);

    // Validierung
    if (isNaN(id) || id <= 0)
    {
        logger.warn('Invalid venue ID provided', { provided_id: req.params.id });
        logger.separator();

        return res.status(400).json({
            success: false,
            message: 'Invalid venue ID'
        } as ApiResponse<void>);
    }

    try 
    {
        const venue = await VenueService.getVenueById(id);

        if (!venue)
        {
            return res.status(404).json({
                success: false,
                message: 'Venue not found'
            } as ApiResponse<void>);
        }

        res.json({
            success: true,
            message: 'Venue details retrieved successfully',
            data: venue
        } as ApiResponse<VenueWithStaff>);
    } 
    catch (error) 
    {
        logger.error('Failed to retrieve venue details', error);

        res.status(500).json({
            success: false,
            message: 'Failed to retrieve venue',
            error: process.env.NODE_ENV === 'development' ? String(error) : undefined
        } as ApiResponse<void>);
    }
    finally
    {
        logger.info('Response sent');
        logger.separator();
    }
});




/**
 * =====================================================================================================
 * GET /venues/:venueId/bookings
 * =====================================================================================================
 * Ruft alle Buchungen für ein bestimmtes Venue ab (mit optionalen Filtern)
 * 
 * URL PARAMETER:
 * - :venueId = Venue ID (z.B. /venues/1/bookings)
 * 
 * QUERY PARAMETERS (alle optional):
 * - ?date=YYYY-MM-DD                                               → Nur Buchungen an diesem Tag
 * - ?status=confirmed                                              → Nur Buchungen mit diesem Status
 * - ?startDate=YYYY-MM-DD                                          → Buchungen ab diesem Datum
 * - ?endDate=YYYY-MM-DD                                            → Buchungen bis zu diesem Datum
 * 
 * BEISPIELE:
 * - /venues/1/bookings                                             → Alle Buchungen
 * - /venues/1/bookings?date=2025-10-25                             → Nur am 25.10.2025
 * - /venues/1/bookings?status=confirmed                            → Nur bestätigte
 * - /venues/1/bookings?startDate=2025-10-01&endDate=2025-10-31     → Oktober 2025
 * 
 * USE CASES:
 * - Admin Dashboard: Tagesübersicht
 * - Kalender-Ansicht: Alle Buchungen in einem Monat
 * - Statistiken: Gefiltert nach Status
 * 
 * RESPONSE (Success - 200 OK):
 * {
 *      success: true,
 *      message: 'X booking(s) found',
 *      data: [...array von bookings]
 * }
 */
router.get('/:venueId/bookings', async (req: Request<{ venueId: string }>, res: Response) => 
{
    logger.separator();
    logger.info('Received Request - GET /venues/:venueId/bookings');

    const venueId = parseInt(req.params.venueId);

    // Query-Parameter extrahieren (alle sind optional)
    // req.query enthält alle ?key=value Parameter aus der URL
    const { date, status, startDate, endDate } = req.query;


    // VENUE ID VALIDIERUNG
    if (isNaN(venueId) || venueId <= 0)
    {
        logger.warn('Invalid venue ID', { provided: req.params.venueId });
        logger.separator();

        return res.status(400).json({
            success: false,
            message: 'Invalid venue Id'
        } as ApiResponse<void>);
    }

    try 
    {
        const venue = await VenueService.getVenueById(venueId);

        if (!venue)
        {
            return res.status(404).json({
                success: false,
                message: 'Venue not found'
            } as ApiResponse<void>);
        }

        // FILTER-OBJEKT ERSTELLEN
        // Nur definierte Query-Parameter werden an den Service übergeben
        // Warum ? -> Verhindert undefined-Werte in SQL-Query
        const filters: {
            date?: string;
            status?: string;
            startDate?: string;
            endDate?: string;
        } = {};

        // Nur hinzufügen wenn Parameter vorhanden ist
        if (date) filters.date = date as string;
        if (status) filters.status = status as string;
        if (startDate) filters.startDate = startDate as string;
        if (endDate) filters.endDate = endDate as string;

        // Falls filters = {} (leer), werden alle Buchungen geholt
        const bookings = await BookingService.getBookingsByVenue(venueId, filters);

        res.json({
            success: true,
            message: `${bookings.length} booking${bookings.length !== 1 ? 's' : ''} found`,
            data: bookings
        } as ApiResponse<Booking[]>);
    } 
    catch (error) 
    {
        logger.error('Error fetching venue bookings', error);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch bookings',
            error: process.env.NODE_ENV === 'development' ? String(error) : undefined
        } as ApiResponse<void>);
    }
    finally
    {
        logger.info('Response sent');
        logger.separator();
    }
});

export default router;