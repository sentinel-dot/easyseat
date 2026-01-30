import { Router, Request, Response } from 'express';
import { login, findAdminById, toPublicUser } from '../services/auth.service';
import { authenticateToken } from '../middleware/auth.middleware';
import { createLogger } from '../config/utils/logger';

const router = Router();
const logger = createLogger('auth.routes');

/**
 * POST /auth/login
 * Login with email and password
 */
router.post('/login', async (req: Request, res: Response) => {
    logger.info('POST /auth/login');
    
    const { email, password } = req.body;
    
    if (!email || !password) {
        res.status(400).json({
            success: false,
            message: 'E-Mail und Passwort sind erforderlich'
        });
        return;
    }
    
    const result = await login(email, password);
    
    if (result.success) {
        res.json(result);
    } else {
        res.status(401).json(result);
    }
});

/**
 * GET /auth/me
 * Get current user info (requires authentication)
 */
router.get('/me', authenticateToken, async (req: Request, res: Response) => {
    logger.info('GET /auth/me');
    
    try {
        if (!req.jwtPayload) {
            res.status(401).json({
                success: false,
                message: 'Nicht authentifiziert'
            });
            return;
        }
        
        const user = await findAdminById(req.jwtPayload.userId);
        
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'Benutzer nicht gefunden'
            });
            return;
        }
        
        res.json({
            success: true,
            data: toPublicUser(user)
        });
    } catch (error) {
        logger.error('Error getting current user', error);
        res.status(500).json({
            success: false,
            message: 'Interner Serverfehler'
        });
    }
});

/**
 * POST /auth/logout
 * Logout (client-side token removal, server-side optional blacklisting)
 */
router.post('/logout', authenticateToken, (req: Request, res: Response) => {
    logger.info('POST /auth/logout');
    
    // In a production app, you might want to blacklist the token here
    // For simplicity, we just return success and let the client remove the token
    
    res.json({
        success: true,
        message: 'Erfolgreich abgemeldet'
    });
});

export default router;
