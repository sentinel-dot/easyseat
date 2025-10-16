import express from 'express';
import { createLogger } from '../config/utils/logger';
import { VenueService } from '../services/venue.service';
import { Venue, VenueWithStaff, ApiResponse } from '../config/utils/types';

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

        logger.info(`${venues.length} venue${venues.length !== 1 ? 's' : ''} found`);
        logger.separator();

        res.json({
            success: true,
            message: `${venues.length} venue${venues.length !== 1 ? 's' : ''} found`,
            data: venues
        } as ApiResponse<Venue[]>);
    } 
    catch (error) 
    {
        logger.error('Failed to retrieve venues', error);
        logger.separator();
        
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve venues',
            error: process.env.NODE_ENV === 'development' ? String(error) : undefined
        } as ApiResponse<void>);
    }
});

/**
 * GET /venues/:id
 * Ein spezifisches Venue mit Services und Staff
 */
router.get('/:id', async (req, res) => 
{
    logger.separator();
    const id = parseInt(req.params.id);
    logger.info(`Received request - GET /venues/${id}`);

    // Validierung
    if (isNaN(id) || id <= 0)
    {
        logger.warn('Invalid venue ID provided', { provided_id: req.params.id });
        
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
            logger.warn('Venue not found', { venue_id: id });

            return res.status(404).json({
                success: false,
                message: 'Venue not found'
            } as ApiResponse<void>);
        }

        logger.info('Venue details retrieved successfully', {
            venue_id: id,
            services_count: venue.services.length,
            staff_count: venue.staff_members.length
        });
        logger.separator();

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
        logger.separator();
    }
});

export default router;