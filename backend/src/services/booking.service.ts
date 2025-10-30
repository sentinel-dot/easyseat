/**
 * BOOKING SERVICE
 * 
 * Dieser Service ist verantortlich für alle Buchungsoperationen:
 * - Erstellen neuer Buchungen
 * - Abrufen von Buchungen (nach ID, Venue, Kunde)
 * - Aktualisieren von Buchungen (email benötigt)
 * - Stornieren von Buchungen (was ist benötigt?)
 * - Verwalten von Buchungsstatus (email benötigt oder?)
 */

import { getConnection } from "../config/database";
import { createLogger } from "../config/utils/logger";
import { AvailabilityService } from "./availability.service";
import { 
    Booking,
    CreateBookingData,
    UpdateBookingData
 } from "../config/utils/types";


 const logger = createLogger('booking.service');



 export class BookingService
 {
    /**
     * ERSTELLE NEUE BUCHUNG
     * 
     * Prüft zuerst die Verfügbarkeit, dann erstellt die Buchung in der DB
     * 
     * @param bookingData - Daten für die neue Buchung
     * @returns Die erstellte Buchung mit ID oder Exception, welche dann von der Route abgefangen wird
     */
    static async createBooking(bookingData: CreateBookingData): Promise<Booking>
    {
        logger.info('Creating new booking...', {
            venue_id: bookingData.venue_id,
            service_id: bookingData.service_id,
            date: bookingData.booking_date,
            time: `${bookingData.start_time} - ${bookingData.end_time}`
        });

        let conn;
        try 
        {
            conn = await getConnection();
            logger.debug('Database connection established');
            
            // SCHRITT 1: Validiere die Verfügbarkeit
            // Bevor wir buchen, müssen wir sicherstellen, dass der Slot verfügbar ist
            const validation = await AvailabilityService.validateBookingRequest(
                bookingData.venue_id,
                bookingData.service_id,
                bookingData.staff_member_id || null,
                bookingData.booking_date,
                bookingData.start_time,
                bookingData.end_time,
                bookingData.party_size
            );

            // Falls nicht verfügbar, wirf einen Fehler
            if (!validation.valid)
            {
                logger.warn('Booking validation failed');
                throw new Error(`Booking not available: ${validation.errors?.join(', ')}`);
            }

            // SCHRITT 1.5: Erstelle booking_token
            const bookingToken = crypto.randomUUID();


            // SCHRITT 2: Füge die Buchung in die Datenbank ein
            const result = await conn.query(`
                INSERT INTO bookings (
                    booking_token
                    venue_id,
                    service_id,
                    staff_member_id,
                    customer_name,
                    customer_email,
                    customer_phone,
                    booking_date,
                    start_time,
                    end_time,
                    party_size,
                    special_requests,
                    total_amount,
                    status
                ) 
                VALUES
                (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
                [
                    bookingToken,
                    bookingData.venue_id,
                    bookingData.service_id,
                    bookingData.staff_member_id || null,
                    bookingData.customer_name,
                    bookingData.customer_email,
                    bookingData.customer_phone || null,
                    bookingData.booking_date,
                    bookingData.start_time,
                    bookingData.end_time,
                    bookingData.party_size,
                    bookingData.special_requests || null,
                    bookingData.total_amount || null
                ]
            ) as { insertId: number };

            logger.info(`Booking created successfully with ID: ${result.insertId}`);


            // SCHRITT 3: Hole die vollständige Buchung mit der neuen ID
            const newBooking = await this.getBookingById(result.insertId);

            if (!newBooking)
            {
                throw new Error('Failed to retrieve newly created booking');
            }

            // Confirmation E-Mail -> "${frontendUrl}/booking/manage/${bookingToken}"

            return newBooking;
        } 
        catch (error) 
        {
            logger.error('Error creating booking');
            throw error;
        }
        finally
        {
            if (conn)
            {
                conn.release();
                logger.debug('Database connection released');
            }
        }
    }




    /**
     * HOLE BUCHUNG NACH ID
     * 
     * @params bookingId
     * @returns Die Buchung oder null wenn nicht gefunden
     */
    static async getBookingById(bookingId: number): Promise<Booking | null>
    {
        logger.info(`Fetching booking with ID: ${bookingId}...`);

        let conn;
        try 
        {
            conn = await getConnection();
            
            const bookings = await conn.query(`
                SELECT *
                FROM bookings
                WHERE id = ?`,
                [bookingId]
            ) as Booking[];     // SQL gibt immer Array zurück

            if (bookings.length === 0)
            {
                logger.warn('Booking not found');
                return null;
            }

            logger.info('Booking found');
            return bookings[0];
        } 
        catch (error) 
        {
            logger.error('Error fetching booking by ID', error);
            throw error;
        }
        finally
        {
            if (conn)
            {
                conn.release();
                logger.debug('Database connection released');
            }
        }
    }




    /**
     * HOLE BUCHUNG NACH TOKEN
     * 
     * @params token
     * @returns Die Buchung oder null wenn nicht gefunden
     */
    static async getBookingByToken(token: string): Promise<Booking | null>
    {
        logger.info(`Fetching booking with token: ${token}...`);

        let conn;
        try 
        {
            conn = await getConnection();
            
            const bookings = await conn.query(`
                SELECT *
                FROM bookings
                WHERE booking_token = ?`,
                [token]
            ) as Booking[];     // SQL gibt immer Array zurück

            if (bookings.length === 0)
            {
                logger.warn('Booking not found');
                return null;
            }

            logger.info('Booking found');
            return bookings[0];
        } 
        catch (error) 
        {
            logger.error('Error fetching booking by ID', error);
            throw error;
        }
        finally
        {
            if (conn)
            {
                conn.release();
                logger.debug('Database connection released');
            }
        }
    }




    /**
     * HOLE ALLE BUCHUNGEN FÜR EIN VENUE
     * 
     * Optional können Buchungen nach Datum und Status gefiltert werden
     * 
     * @param venueId - ID des Venues
     * @param filters - Optional: Datum und/oder Status zum filtern
     * @returns Array von Buchungen
     */
    static async getBookingsByVenue(
        venueId: number,
        filters?: {
            date?: string;          // Format: YYYY-MM-DD
            status?: string;        // z.B. 'confirmed', 'pending'
            startDate?: string;     // Für Datumsbereich: Von
            endDate?: string;       // Für Datumsbereich: Bis
        }
    ): Promise<Booking[]>
    {
        logger.info('Fetching bookings for venue...', {
            venue_id: venueId,
            filters
        });

        let conn;
        try 
        {
            conn = await getConnection();
            
            // Baue die Query dynamisch auf, je nachdem welche Filter gesetzt sind
            // Da staff_member_id in der bookings Tabelle optional ist (kann NULL sein), brauchen wir LEFT JOIN!
            // INNER JOIN würde nur das zeigen was matched (sm id kann null sein, daher würde er da nicht zeigen)
            let query = `
                SELECT b.*,
                        s.name as service_name,
                        sm.name as staff_member_name
                FROM bookings b
                LEFT JOIN services s ON b.service_id = s.id
                LEFT JOIN staff_members sm ON b.staff_member_id = sm.id
                WHERE b.venue_id = ?
            `;

            // params ist ein array von entweder strings oder number
            // der erste wert ist ein Array mit venueId drin
            const params: (string | number)[] = [venueId]; 

            // Filter nach exaktem Datum
            if (filters?.date)
            {
                query += ' AND b.booking_date = ?';
                params.push(filters.date);
            }

            // Filter nach Datumsbereich
            if (filters?.startDate)
            {
                query += ' AND b.booking_date >= ?';
                params.push(filters.startDate);
            }

            if (filters?.endDate)
            {
                query += ' AND b.booking_date <= ?';
                params.push(filters.endDate);
            }

            // Filter nach Status
            if (filters?.status)
            {
                query += ' AND b.status = ?';
                params.push(filters.status);
            }

            // Sortiere nach Datum und Zeit (neueste zuerst)
            query += ' ORDER BY b.booking_date DESC, b.start_time DESC';


            const bookings = await conn.query(query, params) as Booking[];

            logger.info(`Found ${bookings.length} bookings for venue ${venueId}`);
            return bookings;
        } 
        catch (error) 
        {
            logger.error('Error fetching bookings by venue', error);
            throw error;
        }
        finally
        {
            if (conn)
            {
                conn.release();
                logger.debug('Database conncetion released');
            } 
        }
    }




    /**
     * HOLE BUCHUNGEN FÜR EINEN KUNDEN
     * 
     * Findet alle Buchungen anhand der E-Mail-Adresse
     * 
     * @param customerEmail - E-Mail des Kunden
     * @param onlyFuture - Optional: Nur zukünftige Buchungen (default: false)
     * @returns Array von Buchungen
     */
    static async getBookingsByCustomer(
        customerEmail: string,
        onlyFuture: boolean = false
    ): Promise<Booking[]>
    {
        logger.info(`Fetching bookings for customer...`, {
            email: customerEmail,
            only_future: onlyFuture
        });

        let conn;
        try 
        {
            conn = await getConnection();
            
            // LEFT JOIN ist hier technisch nicht nötig (venue_id und service_id sind NOT NULL in der DB), 
            // aber defensiver: Falls durch Bugs Daten fehlen, crasht die Query nicht 
            // sondern gibt venue_name = NULL zurück statt gar nichts.Retry
            let query = `
                SELECT b.*,
                    v.name as venue_name,
                    s.name as service_name
                FROM bookings b
                LEFT JOIN venues v ON b.venue_id = v.id
                LEFT JOIN services s ON b.service_id = s.id
                WHERE b.customer_email = ?
            `;

            const params: (string | number)[] = [customerEmail];

            // Wenn nur zukünftige Buchungen gewünscht, füge Datumsfilter hinzu
            if (onlyFuture)
            {
                query += ' AND b.booking_date >= CURDATE()';
            }

            query += ' ORDER BY b.booking_date DESC, b.start_time DESC';

            const bookings = await conn.query(query, params) as Booking[];

            logger.info(`Found ${bookings.length} bookings for customer`);
            
            return bookings;
        } 
        catch (error) 
        {
            logger.error('Error fetching bookings by customer', error);
            throw error;
        }
        finally
        {
            if (conn)
            {
                conn.release();
                logger.debug('Database connection released');
            }
        }
    }




    /**
     * AKTUALISIERE BUCHUNG
     * 
     * Erlaubt das Ändern von Buchungsdetails (Datum, Zeit, Personenzahl, etc.)
     * Prüft bei Änderung von Datum/Zeit die Verfügbarkeit neu
     * Setzt reminder_sent_at zurück, wenn Datum/Zeit geändert wird
     * 
     * @param token - booking_token der zu aktualisierenden Buchung
     * @param updates - Objekt mit den zu ändernden Feldern
     * 
     * @returns Die aktualisierte Buchung
     */
    static async updateBooking(
        token: string,
        updates: UpdateBookingData
    ): Promise<Booking>
    {
        logger.info(`Updating booking ${token}...`, { updates });

        let conn;
        try 
        {
            conn = await getConnection();
            
            // SCHRITT 1: Hole aktuelle Buchung
            const currentBooking = await this.getBookingByToken(token);

            if (!currentBooking)
            {
                throw new Error('Booking not found');
            }

            // SCHRITT 2: Prüfe, ob Buchung geändert werden kann
            if (currentBooking.status === 'cancelled' || currentBooking.status === 'completed')
            {
                logger.warn(`Cannot update booking with status: ${currentBooking.status}`);
                throw new Error(`Cannot update booking with status: ${currentBooking.status}`);
            }

            // SCHRITT 3: Wenn Datum/Zeit/Mitarbeiter geändert wird -> Verfügbarkeit prüfen
            // Wenn etwas von diesen Parametern da ist -> hat sich was geändert (Was wenn genau das gleiche eingegeben wird? - wird vlt abgefangen von excludebookingid)
            const dateTimeChanged = 
                updates.booking_date ||
                updates.start_time ||
                updates.end_time ||
                updates.staff_member_id !== undefined;

            if (dateTimeChanged)
            {
                logger.info('Date/time/staff changed - validating availability...');    // Wenn genau das gleiche geändert wurde - stimmt das dann?...

                const validation = await AvailabilityService.validateBookingRequest(
                    currentBooking.venue_id,
                    currentBooking.service_id,
                    updates.staff_member_id !== undefined
                        ? updates.staff_member_id
                        : (currentBooking.staff_member_id ?? null),                     // In currentBooking MUSS NICHT staff_member_id enthalten sein (dann wäre es undefined, aber validateBookingRequest akzeptiert kein undefined)
                    updates.booking_date ?? currentBooking.booking_date,                // Wenn links was drin ist, nimm das, ansonsten rechts
                    updates.start_time ?? currentBooking.start_time,
                    updates.end_time ?? currentBooking.end_time,
                    updates.party_size ?? currentBooking.party_size,
                    currentBooking.id
                );

                if (!validation.valid)
                {
                    logger.warn('Availability validation failed', { errors: validation.errors });
                    throw new Error(`Update not possible: ${validation.errors.join(', ')}`);
                }
            }

            // SCHRITT 4: Baue UPDATE Query dynamisch
            const updateFields: string[] = [];
            const updateValues: (string | number)[] = [];

            // Für jedes Feld in updates, füge zum Query hinzu
            if (updates.booking_date !== undefined) 
            {
                updateFields.push('booking_date = ?');
                updateValues.push(updates.booking_date);
            }

            if (updates.start_time !== undefined) 
            {
                updateFields.push('start_time = ?');
                updateValues.push(updates.start_time);
            }
            
            if (updates.end_time !== undefined) 
            {
                updateFields.push('end_time = ?');
                updateValues.push(updates.end_time);
            }
            
            if (updates.staff_member_id !== undefined) 
            {
                updateFields.push('staff_member_id = ?');
                updateValues.push(updates.staff_member_id);
            }
            
            if (updates.party_size !== undefined) 
            {
                updateFields.push('party_size = ?');
                updateValues.push(updates.party_size);
            }
            
            if (updates.special_requests !== undefined) 
            {
                updateFields.push('special_requests = ?');
                updateValues.push(updates.special_requests);
            }


            // WICHTIG: Wenn Datum/Zeit geändert -> Reminder zurücksetzen
            if (dateTimeChanged)
            {
                updateFields.push('reminder_sent_at = NULL');
                logger.info('Resetting reminder_sent_at due to date/time change');
            }

            // Falls keine Änderungen
            if (updateFields.length === 0)
            {
                logger.info('No changes detected');
                return currentBooking;
            }


            // SCHRITT 5: Führe Update aus
            updateValues.push(token);       // Für WHERE clause

            await conn.query(`
                UPDATE bookings
                SET ${updateFields.join(', ')}
                WHERE booking_token = ?`,
                updateValues                    // Ist schon ein Array, daher kein [updateValues]
            );

            logger.info('Booking updated successfully');


            // SCHRITT 7: Hole aktualisierte Buchung
            const updatedBooking = await this.getBookingByToken(token);

            if (!updatedBooking)
            {
                throw new Error('Failed to retrieve updated booking');
            }

            return updatedBooking;
        } 
        catch (error) 
        {
            logger.error('Error updating booking', error);
            throw error;
        }
        finally
        {
            if (conn)
            {
                conn.release();
                logger.debug('Database connection released');
            }
        }
    }




    /**
     * STORNIERE BUCHUNG
     * 
     * Setzt den Status auf 'cancelled' und speichert Zeitpunkt + Grund
     * Benötigt Email-Verifizierung für Sicherheit
     * 
     * @param bookingId - ID der zu stornierenden Buchung
     * @param customerEmail - Email zur Verifizierung
     * @param reason - Optional: Grund für die Stornierung
     * @param bypassPolicy - Optional: Für Admin-Stornierungen (ignoriert Stornierungsfrist)
     * @returns Die stornierte Buchung
     */
    static async cancelBooking(
        bookingId: number,
        customerEmail: string,
        reason?: string,
        bypassPolicy: boolean = false  // Für Admin-Stornierungen
    ): Promise<Booking>
    {
        logger.info(`Cancelling booking ${bookingId}...` ,{ reason, bypassPolicy });

        let conn;
        try 
        {
            conn = await getConnection();
            
            // SCHRITT 1: Hole Buchung MIT Venue-Daten (für cancellation_hours)
            const bookings = await conn.query(`
                SELECT b.*, v.cancellation_hours
                FROM bookings b
                JOIN venues v ON b.venue_id = v.id
                WHERE b.id = ?`,
                [bookingId]
            ) as Array<Booking & { cancellation_hours: number }>;

            if (bookings.length === 0)
            {
                logger.warn('Booking bot found');
                throw new Error('Booking not found');
            }

            const booking = bookings[0];

            // SCHRITT 2: Verifiziere Email (Sicherheitsmaßnahme)
            if (booking.customer_email !== customerEmail)
            {
                logger.warn('Email verification failed for cancellation');
                throw new Error('Unauthorized: Email does not match booking');
            }


            // SCHRITT 3: Prüfe ob Stornierung möglich ist
            if (booking.status === 'cancelled')
            {
                logger.warn('Booking already cancelled');
                throw new Error('Booking is already cancelled');
            }

            if (booking.status === 'completed')
            {
                logger.warn('Cannot cancel completed booking');
                throw new Error('Cannot cancel completed booking');
            }


            // SCHRITT 4: Prüfe Stornierungsfrist (außer bei Admin-Bypass)
            if (!bypassPolicy)
            {
                const bookingDateTime = new Date(`${booking.booking_date}T${booking.start_time}`);
                const now = new Date();
                const hoursUntilBooking = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

                if (hoursUntilBooking < booking.cancellation_hours)
                {
                    logger.warn('Cancellation too late', {
                        hoursUntilBooking: Math.round(hoursUntilBooking),
                        require: booking.cancellation_hours
                    });
                    throw new Error(
                        `Cancellation must be made at least ${booking.cancellation_hours} hours in advance. ` +
                        `Only ${Math.round(hoursUntilBooking)} hours remaining.`
                    );
                }
            }

            // SCHRITT 5: Storniere Buchung
            await conn.query(`
                UPDATE bookings
                SET
                    status = 'cancelled',
                    cancelled_at = NOW(),
                    cancellation_reason = ?
                WHERE id = ?`,
                [reason || null, bookingId]
            );

            logger.info('Booking cancelled successfully');


            // SCHRITT 6: Hole die aktualisierte Buchung
            const cancelledBooking = await this.getBookingById(bookingId);

            if (!cancelledBooking)
            {
                logger.warn('Failed to retrieve cancelled booking');
                throw new Error('Failed to retrieve cancelled booking');
            }

            // TODO: Sobald SMTP ready ist, Stornierungsmail senden
            // await EmailService.sendCancellationEmail(cancelledBooking);

            return cancelledBooking;
        } 
        catch (error) 
        {
            logger.error('Error cancelling booking', error)
            throw error;
        }
        finally
        {
            if (conn)
            {
                conn.release();
                logger.debug('Database connection released');
            }
        }
    }





    /**
     * BESTÄTIGE BUCHUNG
     * 
     * Ändert Status von 'pending' zu 'confirmed'
     * 
     * @param bookingId - ID der zu bestätigenden Buchung
     * @returns Die bestätigte Buchung
     */
    static async confirmBooking(bookingId: number): Promise<Booking>
    {
        logger.info(`Confirming booking ${bookingId}...`);

        let conn;
        try 
        {
            conn = await getConnection();
            
            await conn.query(`
                UPDATE bookings
                SET status = 'confirmed',
                    confirmation_sent_at = NOW(),
                    updated_at = NOW()
                WHERE id = ?`,
                [bookingId]
            );

            logger.info(`Booking confirmed`);

            const confirmedBooking = await this.getBookingById(bookingId);

            if (!confirmedBooking)
            {
                throw new Error('Failed to retrieve confirmed booking');
            }

            return confirmedBooking;
        } 
        catch (error) 
        {
            logger.error('Error confirming booking', error);
            throw error;
        }
        finally
        {
            if (conn)
            {
                conn.release();
                logger.debug('Database connection released');
            }
        }
    }



    /**
     * LÖSCHE BUCHUNG (HARD DELETE)
     * 
     * ACHTUNG: Dies löscht die Buchung permanent aus der Datenbank!
     * In den meisten Fällen sollte stattdessen cancelBooking() verwendet werden.
     * 
     * @param bookingId - ID der zu löschenden Buchung
     */
    static async deleteBooking(bookingId: number): Promise<void>
    {
        logger.warn(`HARD DELETE booking ${bookingId}`);

        let conn;
        try 
        {
            conn = await getConnection();
            
            await conn.query(`
                DELETE FROM bookings
                WHERE id = ?`,
                [bookingId]
            );

            logger.info('Booking deleted permanently');
        } 
        catch (error) 
        {
            logger.error('Error deleting booking', error);
            throw error;
        }
        finally
        {
            if (conn)
            {
                conn.release();
                logger.debug('Database connection released');
            }
        }
    }
 }