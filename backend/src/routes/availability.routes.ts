import express, { Request, Response } from 'express';
import { AvailabilityService } from '../services/availability.service';
import { createLogger } from '../config/utils/logger';
import { read } from 'fs';
import { error } from 'console';

const router = express.Router();
const logger = createLogger('availability.routes');





/**
 * GET /availability/slots
 * Hole alle verfügbaren Zeitslots für einen bestimmten Tag
 * Query params: venueId, serviceId, date (YYYY-MM-DD)
 */
router.get('/slots', async (req, res) =>     
{
    logger.separator();
    logger.info('Received Request - GET /availability/slots');
    try {
        const { venueId, serviceId, date} = req.query; 
        logger.info('GET /availability/slots', {
            venue_id: venueId,
            service_id: serviceId,
            date: date
        });   

        // Validierung
        if (!venueId || !serviceId || !date)
        {
            logger.warn('Missing one or more required parameters: venueId, serviceId, date');
            return res.status(400).json({
                error: 'Missing one or more required parameters: venueId, serviceId, date'
            });
        }

        const dayAvailability = await AvailabilityService.getAvailableSlots(
            Number(venueId),
            Number(serviceId),
            date as string
        );

        logger.info('Fetched available time slots: ', dayAvailability);
        logger.separator();
        res.json(dayAvailability);
    } 
    catch (error) 
    {
        logger.error('Error fetching slots', error);
        logger.separator();
        res.status(500).json({ error: 'Failed to fetch available slots' });
    }
})




/**
 * GET /availability/week
 * Hole Verfügbarkeit für eine komplette Woche
 * Query params: venueId, serviceId, startDate(YYYY-MM-DD)
 */
router.get('week', async (req, res) => 
{
    logger.separator();
    logger.info('Received Request - GET /availability/week');
    try 
    {
        const { venueId, serviceId, startDate } = req.query;
        logger.info('GET /availability/week', {
            venue_id: venueId,
            service_id: serviceId,
            start_date: startDate
        });    

        if (!venueId || !serviceId || !startDate)
        {
            logger.warn('Missing one or more required params: venueId, serviceId, startDate');
            return res.status(400).json({
                error: 'Missing one or more required params: venueId, serviceId, startDate'
            });
        }

        const weekAvailability = await AvailabilityService.getWeekAvailability(
            Number(venueId),
            Number(serviceId), 
            startDate as string
        );

        console.info('Fetched week availabiltiy: ', weekAvailability);
        logger.separator();
        res.json(weekAvailability);
    } 
    catch (error) 
    {
        logger.error('Error fetching week availability', error);
        res.status(500).json({ error: 'Failed to fetch week availability'} );      
    }
});




/**
 * POST /availability/check
 * Prüfe ob ein spezifischer Zeitslot verfügbar ist
 * Body: { venueId, serviceId, staffMemberId?, date, startTime, endTime, partySize, excludeBookingId? }
 */
router.post('/check', async (req, res) => 
{
    logger.separator();
    logger.info('Received Request - POST /availability/check');
    try 
    {
        const {
            venueId,
            serviceId,
            staffMemberId, 
            date,
            startTime,
            endTime,
            partySize,
            excludeBookingId
        } = req.body;

        logger.info('Checking slot availability...', {
            venue_id: venueId,
            service_id: serviceId,
            staff_member_id: staffMemberId,
            date: date,
            start_time: startTime,
            end_time: endTime,
            party_size: partySize,
            exclude_booking_id: excludeBookingId
        });

        // Validierung
        if (!venueId || !serviceId || !date || !startTime || !endTime)
        {
            logger.warn('Missing one or more required fields');
            return res.status(400).json({
                error: 'Missing one or more required fields'
            });
        }

        const result = await AvailabilityService.isTimeSlotAvailable(
            Number(venueId),
            Number(serviceId),
            staffMemberId ? Number(staffMemberId) : null,
            date,
            startTime,
            endTime,
            partySize || 1,
            excludeBookingId ? Number(excludeBookingId) : undefined
        );

        console.info('Time slot available: ', result);
        logger.separator();
        
        res.json(result);
    } 
    catch (error) 
    {
        logger.error('Error checking slot availability', error);
        logger.separator();
        res.status(500).json({
            error: 'Failed to check slot availability'
        });
    }
});




/**
 * POST /availability/validate
 * Validiere eine komplette Buchugsanfrage
 * Body: { 
 *   venueId, 
 *   serviceId, 
 *   staffMemberId?, 
 *   bookingDate, 
 *   startTime, 
 *   endTime, 
 *   partySize,
 *   excludeBookingId?
 * }
 */
router.post('/validate', async (req, res) => 
{
    logger.separator();
    logger.info('Received Request - POST /availability/validate');
    try 
    {
        const {
            venueId, 
            serviceId,
            staffMemberId,
            bookingDate,
            startTime,
            endTime,
            partySize,
            excludeBookingId
        } = req.body;
        
        logger.info('Validating booking request...', {
            venue_id: venueId,
            service_id: serviceId,
            staff_member_id: staffMemberId,
            booking_date: bookingDate,
            start_time: startTime,
            end_time: endTime,
            party_size: partySize,
            exclude_booking_id: excludeBookingId
        });


        if (!venueId || !serviceId || !bookingDate || !startTime || !endTime || !partySize)
        {
            logger.warn('Missing one or more required fiels');
            return res.status(400).json({
                error: 'Missing one or more required fiels: venueId, serviceId, bookingDate, startTime, endTime, partySize'
            });
        }

        const validation = await AvailabilityService.validateBookingRequest(
            Number(venueId),
            Number(serviceId),
            staffMemberId ? Number(staffMemberId) : null,
            bookingDate,
            startTime,
            endTime,
            Number(partySize),
            excludeBookingId ? Number(excludeBookingId) : undefined
        );

        if (validation.valid)
        {
            logger.info('Booking validation passed');
            res.json({
                valid: true,
                message: 'Booking request is valid'
            });
        }
        else
        {
            logger.warn('Booking validation failed', {
                errors: validation.errors
            });
            res.status(400).json({
                valid: false,
                errors: validation.errors
            });
        }
    } 
    catch (error) 
    {
        logger.error('Error validating booking request', error);
        res.status(500).json({
            error: 'Failed to validate booking'
        });
    }
});




/**
 * GET /availability/service/:serviceId
 * Hole Service-Details
 * Query params: venueId
 */
router.get('/service/:id', async (req: Request<{ serviceId: string }>, res) => 
{
    logger.separator();
    logger.info('Received Request - GET /availability/service/:serviceId');
    try 
    {
        const { serviceId } = req.params;
        const { venueId } = req.query;    

        logger.info('Getting service details...', {
            service_id: serviceId,
            venue_id: venueId
        });

        if (!venueId)
        {
            logger.warn('Missing required param: venueId');
            return res.status(400).json({
                error: 'Missing required param: venueId'
            });
        }

        const service = await AvailabilityService.getServiceDetails(
            Number(serviceId),
            Number(venueId)
        );

        if (!service)
        {
            logger.warn('Service not found');
            return res.status(404).json({
                error: 'Service not found'
            });
        }

        logger.info('Fetched service details: ', service);
        logger.separator();

        res.json(service);
    } 
    catch (error) 
    {
        logger.error('Error fetching service details', error);
        res.status(500).json({ 
                error: 'Failed to fetch service details'
            } 
        );
    }
});




/**
 * GET /availability/staff/:staffId/can-perform/:serviceId
 * Prüfe ob Mitarbeiter einen Service durchführen kann
 */
router.get('/staff/:staffId/can-perform/:serviceId', async (req, res) => 
{
    logger.separator();
    logger.info('Received Request - GET /availability/staff/:staffId/can-perform/:serviceId');
    try 
    {
        const { staffId, serviceId } = req.params;
        logger.info('Checking staff service availability...', {
            staff_id: staffId,
            service_id: serviceId
        });

        const canPerform = await AvailabilityService.canStaffPerformService(
            Number(staffId),
            Number(serviceId)
        );

        logger.info('Staff can perform service', canPerform);
        logger.separator();

        res.json({ canPerform });
    } 
    catch (error) 
    {
        logger.error('Error checking staff service availability', error);
        res.status(500).json({
            error: 'Failed to check staff capability'
        });
    }
});

export default router;