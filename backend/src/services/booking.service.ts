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
                logger.warn('Booking validation failed', { errors: validation.errors });
                throw new Error(`Booking not available: ${validation.errors?.join(', ')}`);
            }


            // SCHRITT 2: Füge die Buchung in die Datenbank ein
            const result = await conn.query(`
                INSERT INTO bookings (
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
                (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
                [
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

            return newBooking;
        } 
        catch (error) 
        {
            logger.error('Error creating booking', error);
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
                WHERE b.venueId = ?
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

            query += ' ORDER BY b.booking_date DESC, b.start_time DESC'

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
     * Bei Zeitänderungen wird automatisch die Verfügbarkeit geprüft
     * 
     * @param bookingId - ID der zu aktualisierenden Buchung
     * @param updateData - Objekt mit den zu ändernden Feldern
     * @returns Die aktualisierte Buchung
     */
    static async updateBooking(
        bookingId: number,
        updateData: UpdateBookingData
    ): Promise<Booking>
    {
        logger.info(`Updating booking ${bookingId}...`, { updateData });

        let conn;
        try 
        {
            conn = await getConnection();
            
            // SCHRITT 1: Hole die aktuelle Buchung
            const currentBooking = await this.getBookingById(bookingId);

            if (!currentBooking)
            {
                logger.warn('Booking not found');
                throw new Error(`Booking not found: ${bookingId}`);
            }


            // SCHRITT 2: Prüfe ob Datum/Zeit geändert werden
            // Falls ja, validiere die neue Verfügbarkeit
            // Wenn eins davon true ist, ist timeChange
            const isTimeChange = 
                updateData.booking_date ||
                updateData.start_time ||
                updateData.end_time ||
                updateData.party_size ||
                updateData.staff_member_id;

            if (isTimeChange)
            {
                // Nutze die neuen Werte oder behalte die alten
                const dateToCheck = updateData.booking_date || currentBooking.bokoing_date;
                const startTimeToCheck = updateData.start_time || currentBooking.start_time;
                const endTimeToCheck = updateData.end_time || currentBooking.end_time;
                const partySizeToCheck = updateData.party_size || currentBooking.party_size;
                const staffIdToCheck = updateData.staff_member_id ?? currentBooking.staff_member_id;    // Nimmt rechts NUR wenn links null oder undefined ist


                // Validiere die neue Zeit (excludeBookingId sorgt dafür, dass die
                // aktuelle Buchung nicht als Konflikt gewertet wird)
                const validation = await AvailabilityService.validateBookingRequest(
                    currentBooking.venue_id,
                    currentBooking.service_id,
                    staffIdToCheck || null,
                    dateToCheck,
                    startTimeToCheck,
                    endTimeToCheck,
                    partySizeToCheck,
                    bookingId       // Diese Buchung ignorieren
                );

                if (!validation.valid)
                {
                    logger.warn('Update validation failed', {
                        errors: validation.errors
                    });
                    throw new Error(`Update not possible: ${validation.errors?.join(', ')}`);
                }
            }

            // SCHRITT 3: Baue die UPDATE Query dynamisch
            // Nur die übergebenen Felder werden aktualisiert
            const updateFields: string[] = [];
            const updateValues: (string | number | null)[] = [];

            // Für jedes Feld in uodateData, füge es zur Query hinzu
            if (updateData.booking_date !== undefined)
            {
                updateFields.push('booking_date = ?');
                updateValues.push(updateData.booking_date);
            }

            if (updateData.start_time !== undefined)
            {
                updateFields.push('start_time = ?');
                updateValues.push(updateData.start_time);
            }

            if (updateData.end_time !== undefined)
            {
                updateFields.push('end_time = ?');
                updateValues.push(updateData.end_time);
            }

            if (updateData.party_size !== undefined)
            {
                updateFields.push('party_size = ?');
                updateValues.push(updateData.party_size);
            }

            if (updateData.staff_member_id !== undefined)
            {
                updateFields.push('staff_member_id = ?');
                updateValues.push(updateData.staff_member_id || null);
            }

            if (updateData.special_requests !== undefined)
            {
                updateFields.push('special_requests = ?');
                updateValues.push(updateData.special_requests);
            }

            if (updateData.status !== undefined)
            {
                updateFields.push('status = ?');
                updateValues.push(updateData.status);

                // Wenn Status auf 'cancelled' gesetzt wird, setze cancelled_at
                if (updateData.status === 'cancelled')
                {
                    updateFields.push('cancelled_at = NOW()');

                    if (updateData.cancellation_reason)
                    {
                        updateFields.push('cancellation_reason = ?');
                        updateValues.push(updateData.cancellation_reason);
                    }
                }
            }

            // Mindestens ein Feld muss aktualisiert werden
            if (updateFields.length === 0)
            {
                throw new Error('No fields to update');
            }

            // SCHRITT 4: Führe das Update aus
            // ... ist der Spread-Operator - er "packt das Array aus": 
            // [...updateValues, bookingId] wird zu ['2025-01-20', 4, 123].
            //
            // Ohne ... hätten wir ein Array im Array: [updateValues, bookingId] 
            // würde [['2025-01-20', 4], 123] ergeben - SQL würde crashen!
            await conn.query(`
                UPDATE bookings
                SET ${updateFields.join(', ')}, updated_at = NOW()
                WHERE id = ?`,
                [...updateValues, bookingId]                        
            );

            logger.info(`Booking ${bookingId} updated successfully`);

            // SCHRITT 5: Hole die aktualisierte Buchung
            const updatedBooking = await this.getBookingById(bookingId);

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
     * 
     * @param bookingId - ID der zu stornierenden Buchung
     * @param reason - Optional: Grund für die Stornierung
     * @returns Die stornierte Buchung
     */
    static async cancelBooking(
        bookingId: number,
        reason?: string
    ): Promise<Booking>
    {
        logger.info(`Cancelling booking ${bookingId}...`, { reason });

        // Nutze die updateBooking Methode für Stornierung
        return this.updateBooking(bookingId, {
            status: 'cancelled',
            cancellation_reason: reason
        });
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