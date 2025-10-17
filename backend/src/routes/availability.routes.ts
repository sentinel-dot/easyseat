import express, { Request, Response } from 'express';
import { AvailabilityService } from '../services/availability.service';
import { createLogger } from '../config/utils/logger';


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

    const { venueId, serviceId, date} = req.query;  

    // Validierung
    if (!venueId || !serviceId || !date)
    {
        logger.warn('Missing one or more required parameters: venueId, serviceId, date');
        logger.separator();

        return res.status(400).json({
            error: 'Missing one or more required parameters: venueId, serviceId, date'
        });
    }

    try {

        const dayAvailability = await AvailabilityService.getAvailableSlots(
            Number(venueId),
            Number(serviceId),
            date as string
        );

        res.json(dayAvailability);
    } 
    catch (error) 
    {
        logger.error('Error fetching slots', error);
        res.status(500).json({ error: 'Failed to fetch available slots' });
    }
    finally
    {
        logger.info('Response sent');
        logger.separator();
    }
})




/**
 * GET /availability/week
 * Hole Verfügbarkeit für eine komplette Woche
 * Query params: venueId, serviceId, startDate(YYYY-MM-DD)
 */
router.get('/week', async (req, res) => 
{
    logger.separator();
    logger.info('Received Request - GET /availability/week'); 
    
    const { venueId, serviceId, startDate } = req.query;  

    if (!venueId || !serviceId || !startDate)
    {
        logger.warn('Missing one or more required params: venueId, serviceId, startDate');
        logger.separator();

        return res.status(400).json({
            error: 'Missing one or more required params: venueId, serviceId, startDate'
        });
    }

    try 
    {
        const weekAvailability = await AvailabilityService.getWeekAvailability(
            Number(venueId),
            Number(serviceId), 
            startDate as string
        );

        res.json(weekAvailability);
    } 
    catch (error) 
    {
        logger.error('Error fetching week availability', error);
        res.status(500).json({ error: 'Failed to fetch week availability'} );      
    }
    finally
    {
        logger.info('Response sent');
        logger.separator();
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


    // Validierung
    if (!venueId || !serviceId || !date || !startTime || !endTime)
    {
        logger.warn('Missing one or more required fields');
        logger.separator();

        return res.status(400).json({
            error: 'Missing one or more required fields'
        });
    }

    try 
    {
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
        
        res.json(result);
    } 
    catch (error) 
    {
        logger.error('Error checking slot availability', error);
        res.status(500).json({
            error: 'Failed to check slot availability'
        });
    }
    finally
    {
        logger.info('Response sent');
        logger.separator();
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


    if (!venueId || !serviceId || !bookingDate || !startTime || !endTime || !partySize)
    {
        logger.warn('Missing one or more required fiels');
        logger.separator();
        
        return res.status(400).json({
            error: 'Missing one or more required fiels: venueId, serviceId, bookingDate, startTime, endTime, partySize'
        });
    }

    try 
    {
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
            res.json({
                valid: true,
                message: 'Booking request is valid'
            });
        }
        else
        {
            res.status(400).json({
                valid: false,
                errors: validation.errors
            });
        }
    } 
    catch (error) 
    {
        logger.error('Error validating booking request');
        res.status(500).json({
            error: 'Failed to validate booking'
        });
    }
    finally
    {
        logger.info('Response sent');
        logger.separator();
    }
});




/**
 * GET /availability/service/:serviceId
 * Hole Service-Details
 * Query params: venueId
 */
router.get('/service/:serviceId', async (req: Request<{ serviceId: string }>, res) => 
{
    logger.separator();
    logger.info('Received Request - GET /availability/service/:serviceId');

    const { serviceId } = req.params;
    const { venueId } = req.query;    

    if (!venueId)
    {
        logger.warn('Missing required param: venueId');
        logger.separator();
        
        return res.status(400).json({
            error: 'Missing required param: venueId'
        });
    }

    try 
    {
        const service = await AvailabilityService.getServiceDetails(
            Number(serviceId),
            Number(venueId)
        );

        if (!service)
        {
            return res.status(404).json({
                error: 'Service not found'
            });
        }

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
    finally
    {
        logger.info('Response sent');
        logger.separator();
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

        const canPerform = await AvailabilityService.canStaffPerformService(
            Number(staffId),
            Number(serviceId)
        );

        res.json({ canPerform });
    } 
    catch (error) 
    {
        logger.error('Error checking staff service availability', error);
        res.status(500).json({
            error: 'Failed to check staff capability'
        });
    }
    finally
    {
        logger.info('Response sent');
        logger.separator();
    }
});

export default router;