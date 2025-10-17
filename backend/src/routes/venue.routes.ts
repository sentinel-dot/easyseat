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

export default router;