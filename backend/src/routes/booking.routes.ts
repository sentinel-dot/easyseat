/**
 * BOOKING ROUTES
 * 
 * Alle HTTP-Endpunkte für Buchungsoperationen:
 * - POST   /bookings                           -> Neue Buchung erstellen
 * - GET    /bookings/:id                       -> Einzelne Buchung abrufen
 * - GET    /venues/:venueId/bookings           -> Buchungen eines Venues abrufen
 * - GET    /bookings/customer/me               -> Buchungen eines Kunden abrufen
 * - PATCH  /bookings/manage/:token             -> Buchung aktualisieren (Token-basiert)
 * - POST   /bookings/:id/confirm               -> Buchung bestätigen
 * - POST   /bookings/manage/:token/cancel      -> Buchung stornieren
 * - DELETE /bookings/:id                       -> Buchung löschen (HARD DELETE)
 * - GET /bookings/manage/:token -> Hole Buchung via Token (für Management-Seite)
 * 
 * ARCHITEKTUR-PATTERN:
 * --------------------
 * Request → Route (Validierung) → Service (Business Logic) → Database
 *                ↓
 *         Response mit ApiResponse-Format
 */

import express, { Request, Response } from 'express';
import { createLogger } from '../config/utils/logger';
import { BookingService } from '../services/booking.service';
import {
    Booking,
    CreateBookingData,
    UpdateBookingData,
    ApiResponse
} from '../config/utils/types';
import { getTokenPrefix, validateBookingToken } from '../config/utils/helper';

const router = express.Router();
const logger = createLogger('booking.routes');




/**
 * =====================================================================================================
 * POST /bookings
 * =====================================================================================================
 * Erstellt eine neue Buchung in der Datenbank
 * 
 * FLOW:
 * 1. Request-Body validieren (Required Fields, Format-Checks)
 * 2. BookingService aufrufen (führt Availability-Check) durch
 * 3. Response zurücksenden (201 bei Erfolg, 4xx/5xx bei Fehler)
 * 
 * REQUEST BODY (CreateBookingData):
 * {
 *   venue_id: number,              // ID des Venues (Restaurant, Salon, etc.)
 *   service_id: number,            // ID des gewünschten Service
 *   staff_member_id?: number,      // Optional: Nur bei Services die Staff benötigen
 *   customer_name: string,         // Name des Kunden
 *   customer_email: string,        // Email für Bestätigung/Updates
 *   customer_phone?: string,       // Optional: Telefonnummer
 *   booking_date: string,          // Format: "YYYY-MM-DD" (z.B. "2025-10-25")
 *   start_time: string,            // Format: "HH:MM" (z.B. "14:00")
 *   end_time: string,              // Format: "HH:MM" (z.B. "15:30")
 *   party_size: number,            // Anzahl Personen (1-50)
 *   special_requests?: string,     // Optional: Besondere Wünsche
 *   total_amount?: number          // Optional: Gesamtpreis
 * }
 * 
 * RESPONSE (Success - 201 Created):
 * {
 *   success: true,
 *   message: "Booking created successfully",
 *   data: { ...booking mit ID und allen Feldern }
 * }
 * 
 * RESPONSE (Error):
 * - 400: Validierungsfehler (fehlende Felder, falsches Format)
 * - 409: Slot nicht verfügbar (Konflikt mit existierender Buchung)
 * - 500: Serverfehler
 */
router.post('/', async (req: Request, res: Response) => 
{
    logger.separator();
    logger.info('Received Request - POST /bookings');

    // WICHTIG: Prüfe zuerst ob überhaupt ein Body gesendet wurde
    if (!req.body || Object.keys(req.body).length === 0)
    {
        logger.warn('Empty request body');
        logger.separator();

        return res.status(400).json({
            success: false,
            message: 'Request body is required'
        } as ApiResponse<void>);
    }

    const bookingData: CreateBookingData = req.body;

    // SCHRITT 1: VALIDIERUNG DER PFLICHTFELDER
    // Alle Felder die zwingend erforderlich sind
    const requiredFields = [
        'venue_id',
        'service_id',
        'customer_name',
        'customer_email',
        'booking_date',
        'start_time',
        'end_time',
        'party_size'
    ];

    // Filter alle fehlenden Felder
    // .filter() durchläuft das Array und behält nur Elemente die die Bedingung erfüllen
    // Hier: Behalte nur Felder die NICHT im Request Body sind
    const missingFields = requiredFields.filter(field => !bookingData[field as keyof CreateBookingData]);

    // Falls irgendwelche Felder fehlen, lehne Request ab
    if (missingFields.length > 0)
    {
        logger.warn('Missing required fields', { missing: missingFields });
        logger.separator();

        // 400 - Bad Request = Client hat Fehler gemacht
        return res.status(400).json({
            success: false,
            message: `Missing required fields: ${missingFields.join(', ')}`
        } as ApiResponse<void>);
    }

    // SCHRITT 2: EMAIL-FORMAT VALIDIERUNG
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    //.test() gibt true/false zurück, ob String dem Pattern entspricht
    if (!emailRegex.test(bookingData.customer_email))
    {
        logger.warn('Invalid email format', { email: bookingData.customer_email });
        logger.separator();

        return res.status(400).json({
            success: false,
            message: 'Invalid email format'
        } as ApiResponse<void>);
    }

    // SCHRITT 3: DATUMS-FORMAT VALIDIERUNG
    // Erwartetes Format: YYYY-MM-DD (z.B. 2025-10-25)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(bookingData.booking_date))
    {
        logger.warn('Invalid date format', { date: bookingData.booking_date });
        logger.separator();

        return res.status(400).json({
            success: false,
            message: 'Invalid date format. Expected: YYYY-MM-DD'
        } as ApiResponse<void>);
    }

    // SCHRITT 4: ZEIT-FORMAT VALIDIERUNG
    // Erwartetes Format: HH:MM (z.B. 14:00, 09:30)
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(bookingData.start_time) || !timeRegex.test(bookingData.end_time))
    {
        logger.warn('Invalid time format', {
            start: bookingData.start_time,
            end: bookingData.end_time
        });
        logger.separator();

        return res.status(400).json({
            success: false,
            message: 'Invalid time format. Expected: HH:MM'
        } as ApiResponse<void>);
    }

    // SCHRITT 5: PARTY SIZE VALIDIERUNG
    // Sinnvolle Grenzen: Minimum 1 Person, Maximum 50 Personen
    // Verhindert absurde Werte wie 0 oder 1000
    if (bookingData.party_size < 1 || bookingData.party_size > 50)
    {
        logger.warn('Invalid party size', { party_size: bookingData.party_size });
        logger.separator();

        return res.status(400).json({
            success: false,
            message: 'Party size must be betweem 1 and 50'
        } as ApiResponse<void>);
    }

    // SCHRITT 6: BUCHUNG ERSTELLEN
    try 
    {
        const newBooking = await BookingService.createBooking(bookingData);

        logger.info('Booking created successfully', { booking_id: newBooking.id });

        return res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            data: newBooking
        } as ApiResponse<Booking>);
    } 
    catch (error) 
    {
        logger.error('Error creating booking', error);

        // Error in String umwandeln für Analyse
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        // KONFLIKT: Slot ist nicht verfügbar (z.B. schon gebucht)
        // 409 Conflict = Request ist valid, aber Ressourcen-Zustand erlaubt Operation nicht
        if (errorMessage.includes('not available') || errorMessage.includes('Booking not available'))   // Error-Message von CreateBooking - Service => ValidateBookingRequest failed
        {
            return res.status(409).json({
                success: false,
                message: errorMessage,
                error: process.env.NODE_ENV === 'development' ? String(error) : undefined
            } as ApiResponse<void>);
        }


        // ALLGEMEINER SERVERFEHLER
        // 500 Internal Server Error = Etwas ist auf dem Server schiefgelaufen
        res.status(500).json({
            success: false,
            message: 'Failed to create booking',
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
 * GET /bookings/:id
 * =====================================================================================================
 * Ruft eine einzelne Buchung anhand ihrer ID ab
 * 
 * URL PARAMETER:
 * - :id = Booking ID (z.B. /bookings/42)
 * 
 * USE CASES:
 * - Kunde will Buchungsdetails sehen
 * - Admin will spezifische Buchung überprüfen
 * - Frontend braucht aktuelle Daten nach Update
 * 
 * RESPONSE (Success - 200 OK):
 * {
 *      success: true,
 *      message: 'Booking retrieved successfully',
 *      data: { ...booking }
 * }
 * 
 * RESPONSE (Error):
 * - 400: Ungültige ID (nicht numerisch oder <= 0)
 * - 404: Buchung nicht gefunden
 * - 500: Serverfehler
 */
router.get('/:id', async (req: Request<{ id: string }>, res: Response) => 
{
    logger.separator();
    logger.info('Received Request - GET /bookings/:id');

    // URL-Parameter ist immer ein String -> muss zu Number konvertiert werden
    const bookingId = parseInt(req.params.id);


    // ID-VALIDIERUNG
    if (isNaN(bookingId) || bookingId <= 0)
    {
        logger.warn('Invalid booking ID', { provided: req.params.id });
        logger.separator();

        return res.status(400).json({
            success: false,
            message: 'Invalid booking ID'
        } as ApiResponse<void>);
    }

    try 
    {
        // Service-Aufruf: Hole Buchung aus Database
        const booking = await BookingService.getBookingById(bookingId);
        
        if (!booking)
        {
            logger.warn('Booking not found');

            // 404 Not Found = Ressource existiert nicht
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            } as ApiResponse<void>);
        }

        return res.status(200).json({
            success: true,
            message: 'Booking retrieved successfully',
            data: booking
        } as ApiResponse<Booking>);
    } 
    catch (error) 
    {
        logger.error('Error fetching booking', error);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch booking',
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
router.get('/venues/:venueId/bookings', async (req: Request<{ venueId: string }>, res: Response) => 
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






/**
 * ============================================================================
 * GET /bookings/customer/:email
 * ============================================================================
 * Ruft alle Buchungen eines Kunden ab (Email-basiert, kein Login erforderlich)
 * 
 * URL PARAMETER:
 * - :email = Customer Email (z.B. /bookings/customer/max@example.com)
 * 
 * USE CASES:
 * - Gast will alle seine Buchungen sehen (ohne Account)
 * - "Meine Buchungen" Seite im Frontend
 * - Buchungshistorie für Email-Adresse anzeigen
 * 
 * SICHERHEIT:
 * - KEINE Authentifizierung erforderlich (Guest-Access)
 * - Jeder mit einer Email kann ALLE Buchungen dieser Email sehen
 * - ⚠️ In Production: Rate-Limiting hinzufügen (z.B. max 10 requests/min pro IP)
 * - ⚠️ Alternative: Magic-Link per Email senden statt direktem Zugriff
 * 
 * RESPONSE (Success - 200 OK):
 * {
 *   success: true,
 *   message: "X booking(s) found",
 *   data: [ ...array von bookings ]
 * }
 * 
 * RESPONSE (Error):
 * - 400: Ungültige Email
 * - 500: Serverfehler
 */
router.get('/customer/:email', async (req: Request<{ email: string }>, res: Response) => 
{
    logger.separator();
    logger.info('Received Request - GET /bookings/customer/:email');

    const customerEmail = req.params.email;

    // ========================================================================
    // EMAIL-VALIDIERUNG
    // ========================================================================
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(customerEmail))
    {
        logger.warn('Invalid email format', { email: customerEmail });
        logger.separator();

        return res.status(400).json({
            success: false,
            message: 'Invalid email format'
        } as ApiResponse<void>);
    }

    // Optional: Email-Präfix loggen (Datenschutz)
    // max@example.com -> m***@example.com
    const maskedEmail = customerEmail.replace(/^(.)(.*)(@.*)$/, '$1***$3');
    logger.info('Fetching bookings for customer', { email: maskedEmail });

    try 
    {
        // Service-Aufruf: Hole alle Buchungen für diese Email
        const bookings = await BookingService.getBookingsByEmail(customerEmail);

        // Auch bei 0 Ergebnissen ist das ein Success (200 OK)
        res.json({
            success: true,
            message: `${bookings.length} booking${bookings.length !== 1 ? 's' : ''} found`,
            data: bookings
        } as ApiResponse<Booking[]>);
    } 
    catch (error) 
    {
        logger.error('Error fetching customer bookings', error);

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








/**
 * ============================================================================
 * PATCH /bookings/manage/:token
 * ============================================================================
 * Aktualisiert eine existierende Buchung (partielles Update)
 * 
 * WICHTIG: Token-basierte Authentifizierung!
 * - Nur wer den korrekten booking_token kennt, kann die Buchung ändern
 * - Kein Email-Abgleich mehr nötig
 * - Token kommt aus Bestätigungs-Email oder QR-Code
 * 
 * URL PARAMETER:
 * - :token = booking_token (UUID) aus der Bestätigungs-Email
 * 
 * REQUEST BODY:
 * {
 *   booking_date?: string,          // Optional: Neues Datum
 *   start_time?: string,            // Optional: Neue Startzeit
 *   end_time?: string,              // Optional: Neue Endzeit
 *   party_size?: number,            // Optional: Neue Personenzahl
 *   staff_member_id?: number,       // Optional: Anderer Mitarbeiter
 *   special_requests?: string       // Optional: Neue Wünsche
 * }
 * 
 * BEISPIEL:
 * PATCH /bookings/manage/a1b2c3d4-5e6f-7g8h-9i0j-k1l2m3n4o5p6
 * Body: {
 *   "booking_date": "2025-10-26",
 *   "start_time": "15:00",
 *   "party_size": 4
 * }
 * 
 * WICHTIG:
 * - Wenn Datum/Zeit geändert wird → Verfügbarkeit wird neu geprüft!
 * - Reminder wird automatisch zurückgesetzt bei Datum/Zeit-Änderung
 * - Stornierte/abgeschlossene Buchungen können NICHT geändert werden
 * 
 * RESPONSE (Success - 200 OK):
 * {
 *   success: true,
 *   message: "Booking updated successfully",
 *   data: { ...updated booking }
 * }
 * 
 * RESPONSE (Error):
 * - 400: Validierungsfehler, keine Updates, oder Status verhindert Update
 * - 401: Token ungültig oder abgelaufen (Unauthorized)
 * - 404: Buchung nicht gefunden
 * - 409: Neuer Slot nicht verfügbar (Conflict)
 * - 500: Serverfehler
 */
router.patch('/manage/:token', async (req: Request<{ token: string }>, res: Response) => 
{
    logger.separator();
    logger.info('Received Request - PATCH /bookings/:id');

    const { token } = req.params;
    const updates = req.body;


    // ========================================================================
    // VALIDIERUNG
    // ========================================================================
    
    // 1. Token-Format-Validierung (UUID v4)
    if (!validateBookingToken(token))
    {
        logger.warn('Invalid booking token format', { provided: token });
        logger.separator();

        return res.status(400).json({
            success: false,
            message: 'Invalid booking token format'
        } as ApiResponse<void>);
    }


    // 2. Updates-Validierung
    // Object.keys() gibt Array aller Property-Namen zurück
    // Beispiel: { date: "2025-10-25", time: "14:00" } → ["date", "time"]
    if (!updates || Object.keys(updates).length === 0)
    {
        logger.warn('No updates provided');
        logger.separator();

        return res.status(400).json({
            success: false,
            message: 'No updates provided'
        } as ApiResponse<void>);
    }


    // 3. Validiere einzelne Update-Felder (optional, aber empfohlen)
    const allowedFields = [
        'booking_date', 
        'start_time', 
        'end_time', 
        'party_size', 
        'staff_member_id', 
        'special_requests'
    ];

    const invalidFields = Object.keys(updates).filter(
        field => !allowedFields.includes(field)
    );

    if (invalidFields.length > 0)
    {
        logger.warn('Invalid update fields', { invalid: invalidFields });
        logger.separator();

        return res.status(400).json({
            success: false,
            message: `Invalid fields: ${invalidFields.join(', ')}`
        } as ApiResponse<void>);
    }


    // ========================================================================
    // UPDATE DURCHFÜHREN
    // ========================================================================
    try 
    {
        // Service-Aufruf mit Token-Verifizierung
        // Der Service prüft:
        // 1. Existiert eine Buchung mit diesem Token?
        // 2. Ist der Status updatebar? (nicht cancelled/completed)
        // 3. Wenn Datum/Zeit geändert → Ist der neue Slot verfügbar?
        const updatedBooking = await BookingService.updateBooking(
            token, 
            updates as UpdateBookingData
        );

        logger.info('Booking updated successfully', { 
            booking_id: updatedBooking.id,
            token_used: getTokenPrefix(token)
        });

        res.json({
            success: true,
            message: 'Booking updated successfully',
            data: updatedBooking
        } as ApiResponse<Booking>);
    } 
    catch (error) 
    {
        // ====================================================================
        // DETAILLIERTES ERROR HANDLING
        // ====================================================================
        // Verschiedene Error-Typen werden unterschiedlich behandelt
        logger.error('Error updating booking', error);

        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        // ERROR 1: INVALID/EXPIRED TOKEN
        // 401 Unauthorized = Token ungültig oder abgelaufen
        if (errorMessage.includes('Invalid token') || 
            errorMessage.includes('Token not found') ||
            errorMessage.includes('Unauthorized'))
        {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired booking token',
                error: process.env.NODE_ENV === 'development' ? String(error) : undefined
            } as ApiResponse<void>);
        }

        // ERROR 2: NOT FOUND (Buchung existiert nicht)
        if (errorMessage.includes('not found'))
        {
            return res.status(404).json({
                success: false,
                message: 'Booking not found',
                error: process.env.NODE_ENV === 'development' ? String(error) : undefined
            } as ApiResponse<void>);
        }

        // ERROR 3: CANNOT UPDATE (Status verhindert Update)
        // z.B. "Cannot update booking with status: cancelled"
        if (errorMessage.includes('Cannot update'))
        {
            return res.status(400).json({
                success: false,
                message: errorMessage,
                error: process.env.NODE_ENV === 'development' ? String(error) : undefined
            } as ApiResponse<void>);
        }

        // ERROR 4: SLOT NOT AVAILABLE (neuer Zeitslot ist belegt)
        // 409 Conflict = Ressourcen-Zustand erlaubt Operation nicht
        if (errorMessage.includes('not available'))
        {
            return res.status(409).json({
                success: false,
                message: errorMessage,
                error: process.env.NODE_ENV === 'development' ? String(error) : undefined
            } as ApiResponse<void>);
        }

        // ERROR 5: ALLGEMEINER SERVERFEHLER
        res.status(500).json({
            success: false,
            message: 'Failed to update booking',
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
 * ============================================================================
 * POST /bookings/:id/confirm
 * ============================================================================
 * Bestätigt eine Buchung (ändert Status von 'pending' zu 'confirmed')
 * 
 * USE CASES:
 * - Admin/Venue bestätigt manuelle Buchung
 * - Automatische Bestätigung nach Zahlung
 * - Email-Bestätigungs-Link wurde geklickt
 * 
 * FLOW:
 * 1. Kunde bucht → Status: 'pending'
 * 2. Admin/System bestätigt → Status: 'confirmed'
 * 3. Kunde erhält Bestätigungsmail
 * 
 * WICHTIG:
 * - Setzt confirmation_sent_at Timestamp
 * - In Production: Auth-Middleware für Admin/Venue-Owner
 * - TODO: Email-Bestätigung nach Confirm senden
 * 
 * RESPONSE (Success - 200 OK):
 * {
 *   success: true,
 *   message: "Booking confirmed successfully",
 *   data: { ...confirmed booking }
 * }
 * 
 * RESPONSE (Error):
 * - 400: Ungültige Booking ID
 * - 404: Buchung nicht gefunden
 * - 500: Serverfehler
 */
router.post('/:id/confirm', async (req: Request<{ id: string }>, res: Response) => 
{
    logger.separator();
    logger.info('Received Request - POST /bookings/:id/confirm');

    const bookingId = parseInt(req.params.id);

    // ========================================================================
    // ID-VALIDIERUNG
    // ========================================================================
    if (isNaN(bookingId) || bookingId <= 0)
    {
        logger.warn('Invalid booking ID', { provided: req.params.id });
        logger.separator();

        return res.status(400).json({
            success: false,
            message: 'Invalid booking ID'
        } as ApiResponse<void>);
    }

    try 
    {
        // Service-Aufruf: Ändere Status und setze confirmation_sent_at
        const confirmedBooking = await BookingService.confirmBooking(bookingId);

        logger.info('Booking confirmed successfully', { booking_id: bookingId });

        // TODO: Sobald SMTP ready ist
        // await EmailService.sendConfirmationEmail(confirmedBooking);

        res.json({
            success: true,
            message: 'Booking confirmed successfully',
            data: confirmedBooking
        } as ApiResponse<Booking>);
    } 
    catch (error) 
    {
        logger.error('Error confirming booking', error);

        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        // Buchung nicht gefunden
        if (errorMessage.includes('not found'))
        {
            return res.status(404).json({
                success: false,
                message: 'Booking not found',
                error: process.env.NODE_ENV === 'development' ? String(error) : undefined
            } as ApiResponse<void>);
        }

        // Allgemeiner Fehler
        res.status(500).json({
            success: false,
            message: 'Failed to confirm booking',
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
 * ============================================================================
 * POST /bookings/manage/:token/cancel
 * ============================================================================
 * Storniert eine Buchung (ändert Status zu 'cancelled')
 * 
 * URL PARAMETER:
 * - :token = booking_token (UUID) aus der Bestätigungs-Email
 * 
 * REQUEST BODY:
 * {
 *   reason?: string,              // Optional: Stornierungsgrund
 *   bypassPolicy?: boolean        // Optional: Nur für Admin (ignoriert Frist)
 * }
 * 
 * STORNIERUNGSRICHTLINIE:
 * - Standard: Stornierung nur bis X Stunden vor Termin erlaubt
 * - X wird in venues.cancellation_hours definiert (z.B. 24 Stunden)
 * - Admin kann mit bypassPolicy=true die Frist ignorieren
 * 
 * BEISPIEL:
 * {
 *   "reason": "Krankheit",
 *   "bypassPolicy": false
 * }
 * 
 * WAS PASSIERT BEI STORNIERUNG:
 * - Status → 'cancelled'
 * - cancelled_at → NOW()
 * - cancellation_reason → gespeichert
 * - Slot wird wieder verfügbar für andere Buchungen
 * - TODO: Stornierungsmail an Kunden
 * 
 * USE CASES:
 * - Kunde kann nicht zum Termin
 * - Venue muss Termin absagen
 * - Admin storniert aus Kulanz (auch nach Frist)
 * 
 * RESPONSE (Success - 200 OK):
 * {
 *   success: true,
 *   message: "Booking cancelled successfully",
 *   data: { ...cancelled booking }
 * }
 * 
 * RESPONSE (Error):
 * - 400: Validierungsfehler, bereits storniert, oder Frist überschritten
 * - 401: Email-Verifizierung fehlgeschlagen
 * - 404: Buchung nicht gefunden
 * - 500: Serverfehler
 */
router.post('/manage/:token/cancel', async (req: Request<{ token: string }>, res: Response) => 
{
    logger.separator();
    logger.info('Received Request - POST /manage/:token/cancel');

    const { token } = req.params;
    const { reason, bypassPolicy } = req.body;

    // ========================================================================
    // VALIDIERUNG
    // ========================================================================
    
    // Token-Format-Validierung
    if (!validateBookingToken(token)) {
        logger.warn('Invalid booking token format');
        logger.separator();

        return res.status(400).json({
            success: false,
            message: 'Invalid booking token format'
        } as ApiResponse<void>);
    }

    // ========================================================================
    // STORNIERUNG DURCHFÜHREN
    // ========================================================================
    try 
    {
        // Service-Aufruf mit allen Parametern
        // Der Service prüft:
        // 1. Existiert die Buchung?
        // 2. Stimmt die Email?
        // 3. Ist sie schon storniert?
        // 4. Ist die Stornierungsfrist eingehalten? (außer bypassPolicy=true)
        const cancelledBooking = await BookingService.cancelBooking(
            token,
            reason,                         // Optional: Stornierungsgrund
            bypassPolicy || false           // Default: false (Frist gilt!)
        );

        logger.info('Booking cancelled successfully', { booking_id: cancelledBooking.id });

        // TODO: Sobald SMTP ready ist
        // await EmailService.sendCancellationEmail(cancelledBooking);

        res.json({
            success: true,
            message: 'Booking cancelled successfully',
            data: cancelledBooking
        } as ApiResponse<Booking>);
    } 
    catch (error) 
    {
        // ====================================================================
        // DETAILLIERTES ERROR HANDLING
        // ====================================================================
        logger.error('Error cancelling booking', error);

        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        if (errorMessage.includes('Invalid token') || errorMessage.includes('Unauthorized')) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired booking token',
                error: process.env.NODE_ENV === 'development' ? String(error) : undefined
            } as ApiResponse<void>);
        }

        if (errorMessage.includes('not found')) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found',
                error: process.env.NODE_ENV === 'development' ? String(error) : undefined
            } as ApiResponse<void>);
        }

        if (errorMessage.includes('already cancelled')) {
            return res.status(400).json({
                success: false,
                message: 'Booking is already cancelled',
                error: process.env.NODE_ENV === 'development' ? String(error) : undefined
            } as ApiResponse<void>);
        }

        if (errorMessage.includes('cancellation policy')) {
            return res.status(400).json({
                success: false,
                message: errorMessage,
                error: process.env.NODE_ENV === 'development' ? String(error) : undefined
            } as ApiResponse<void>);
        }

        res.status(500).json({
            success: false,
            message: 'Failed to cancel booking',
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
 * GET /bookings/manage/:token (NEU!)
 * =====================================================================================================
 * Ruft eine Buchung via Token ab - für Booking Management Page
 * 
 * FLOW:
 * 1. Kunde erhält Email mit Link: https://easyseat.de/booking/manage/a1b2c3d4-...
 * 2. Frontend ruft diese Route auf
 * 3. Route gibt Buchungsdetails zurück
 * 4. Frontend zeigt Management-Seite (Ändern/Stornieren)
 * 
 * URL PARAMETER:
 * - :token = booking_token (UUID v4)
 * 
 * VORTEILE:
 * - Keine Login nötig
 * - Keine Email-Eingabe nötig
 * - Link ist shareable (z.B. an Begleiter)
 * - Funktioniert auch als QR-Code
 * 
 * RESPONSE (Success - 200 OK):
 * {
 *   success: true,
 *   message: "Booking retrieved successfully",
 *   data: {
 *     id: 42,
 *     booking_token: "a1b2c3d4-...",
 *     venue_name: "Restaurant Bella Vista",
 *     customer_name: "Max Mustermann",
 *     booking_date: "2025-11-15",
 *     start_time: "19:00",
 *     ...
 *   }
 * }
 * 
 * RESPONSE (Error):
 * - 400: Ungültiges Token-Format
 * - 404: Buchung nicht gefunden (falscher Token)
 * - 500: Serverfehler
 */
router.get('/manage/:token', async (req: Request<{ token: string }>, res: Response) => 
{
    logger.separator();
    logger.info('Received Request - GET /bookings/manage/:token');

    const { token } = req.params;
    const tokenPrefix = getTokenPrefix(token);

    logger.info('Token provided', { token_prefix: tokenPrefix });


    // ========================================================================
    // VALIDIERUNG
    // ========================================================================
    
    // Token-Format-Validierung (UUID v4)
    if (!validateBookingToken(token))
    {
        logger.warn('Invalid booking token format', { token_prefix: tokenPrefix });
        logger.separator();

        return res.status(400).json({
            success: false,
            message: 'Invalid booking token format'
        } as ApiResponse<void>);
    }


    // ========================================================================
    // SERVICE CALL
    // ========================================================================
    
    try 
    {
        const booking = await BookingService.getBookingByToken(token);
        
        if (!booking)
        {
            logger.warn('Booking not found', { token_prefix: tokenPrefix });

            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            } as ApiResponse<void>);
        }

        logger.info('Booking retrieved successfully', { 
            booking_id: booking.id,
            token_prefix: tokenPrefix
        });

        return res.status(200).json({
            success: true,
            message: 'Booking retrieved successfully',
            data: booking
        } as ApiResponse<Booking>);
    } 
    catch (error) 
    {
        logger.error('Error fetching booking by token', error);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch booking',
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
 * ============================================================================
 * DELETE /bookings/:id
 * ============================================================================
 * Löscht eine Buchung PERMANENT aus der Datenbank (HARD DELETE)
 * 
 * ⚠️⚠️⚠️ ACHTUNG - KRITISCHE OPERATION ⚠️⚠️⚠️
 * 
 * WICHTIG ZU WISSEN:
 * - Dies ist ein HARD DELETE = Buchung wird UNWIDERRUFLICH gelöscht!
 * - Alle Daten sind weg (keine Wiederherstellung möglich)
 * - Es wird KEIN Audit-Trail erstellt
 * - Diese Operation sollte SEHR SELTEN verwendet werden
 * 
 * WANN SOLLTE HARD DELETE VERWENDET WERDEN?
 * ✅ Spam-Buchungen entfernen
 * ✅ Test-Daten in Development bereinigen
 * ✅ GDPR-Anfragen (Recht auf Löschung)
 * ✅ Duplikate entfernen
 * ❌ NICHT für normale Stornierungen! (verwende cancelBooking)
 * ❌ NICHT für "Kunde ist nicht erschienen" (verwende Status: 'no_show')
 * 
 * UNTERSCHIED: DELETE vs CANCEL
 * ┌─────────────┬──────────────────┬────────────────────┐
 * │ Operation   │ DELETE           │ CANCEL             │
 * ├─────────────┼──────────────────┼────────────────────┤
 * │ Daten       │ Komplett weg     │ Bleiben erhalten   │
 * │ Status      │ N/A (gelöscht)   │ 'cancelled'        │
 * │ History     │ Verloren         │ Nachvollziehbar    │
 * │ Analytics   │ Nicht möglich    │ Auswertbar         │
 * │ Use Case    │ Spam, GDPR       │ Normale Storno     │
 * └─────────────┴──────────────────┴────────────────────┘
 * 
 * SICHERHEIT:
 * - In Production: Nur für Admin-Rolle!
 * - Aktuell KEINE Auth-Middleware (TODO!)
 * - Später: if (req.user.role !== 'admin') return 403
 * 
 * BESSERE ALTERNATIVE (Post-MVP):
 * Implementiere "Soft Delete" statt Hard Delete:
 * - Setze nur Flag: deleted_at = NOW()
 * - Daten bleiben für Audit/Analytics
 * - Siehe TODO.md für Details
 * 
 * RESPONSE (Success - 200 OK):
 * {
 *   success: true,
 *   message: "Booking deleted permanently"
 * }
 * 
 * RESPONSE (Error):
 * - 400: Ungültige Booking ID
 * - 403: Forbidden (falls Auth-Middleware aktiv und kein Admin)
 * - 500: Serverfehler
 */
router.delete('/:id', async (req: Request<{ id: string }>, res: Response) => 
{
    logger.separator();
    logger.info('Received Request - DELETE /bookings/:id');
    
    // Spezielle Warnung für HARD DELETE Operation
    // Dies erscheint prominent in den Logs für Audit-Zwecke
    logger.warn('⚠️ HARD DELETE operation requested');

    const bookingId = parseInt(req.params.id);

    // ========================================================================
    // VALIDIERUNG
    // ========================================================================
    if (isNaN(bookingId) || bookingId <= 0)
    {
        logger.warn('Invalid booking ID', { provided: req.params.id });
        logger.separator();

        return res.status(400).json({
            success: false,
            message: 'Invalid booking ID'
        } as ApiResponse<void>);
    }

    // ========================================================================
    // AUTH-CHECK (TODO für Production!)
    // ========================================================================
    // TODO: Hier sollte später Auth-Middleware prüfen ob Admin
    // Beispiel-Code (nicht aktiv):
    // 
    // if (!req.user || req.user.role !== 'admin') {
    //     logger.warn('Unauthorized DELETE attempt', { 
    //         user: req.user?.email,
    //         booking_id: bookingId 
    //     });
    //     
    //     return res.status(403).json({
    //         success: false,
    //         message: 'Forbidden: Admin privileges required'
    //     } as ApiResponse<void>);
    // }

    // ========================================================================
    // HARD DELETE DURCHFÜHREN
    // ========================================================================
    try 
    {
        // Service-Aufruf: Führt DELETE FROM bookings WHERE id = ? aus
        // Danach ist die Buchung UNWIDERRUFLICH weg!
        await BookingService.deleteBooking(bookingId);

        // Erfolgreiche Löschung wird geloggt (für Audit-Trail in Logs)
        logger.info('Booking deleted permanently', { booking_id: bookingId });

        // 200 OK (nicht 204 No Content, weil wir JSON Response senden)
        res.json({
            success: true,
            message: 'Booking deleted permanently'
        } as ApiResponse<void>);
    } 
    catch (error) 
    {
        // Fehler beim Löschen (z.B. Foreign Key Constraints)
        logger.error('Error deleting booking', error);

        res.status(500).json({
            success: false,
            message: 'Failed to delete booking',
            error: process.env.NODE_ENV === 'development' ? String(error) : undefined
        } as ApiResponse<void>);
    }
    finally
    {
        logger.info('Response sent');
        logger.separator();
    }
});


// ============================================================================
// ROUTER EXPORTIEREN
// ============================================================================
// Der Router wird in server.ts importiert und unter /bookings gemountet
// Beispiel in server.ts:
// 
// import bookingRoutes from './routes/booking.routes';
// app.use('/bookings', bookingRoutes);
// 
// Dann sind alle Routes verfügbar:
// - POST   http://localhost:3000/bookings
// - GET    http://localhost:3000/bookings/:id
// - PATCH  http://localhost:3000/bookings/:id
// - etc.
export default router;
