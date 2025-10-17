import request from 'supertest';
import express from 'express';
import cors from 'cors';
import availabilityRoutes from '../routes/availability.routes';

// Setup Express App für Tests
const app = express();
app.use(cors());
app.use(express.json());
app.use('/availability', availabilityRoutes);

// Helper: Generiere Datum für Tests (morgen)
const getTomorrowDate = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};

// Helper: Generiere Datum für Tests (nächste Woche)
const getNextWeekDate = (): string => {
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  return nextWeek.toISOString().split('T')[0];
};

// Helper: Finde einen Dienstag (Salon ist Di-Sa offen)
const getNextTuesday = (): string => {
  const date = new Date();
  const day = date.getDay();
  const daysUntilTuesday = (2 - day + 7) % 7 || 7;
  date.setDate(date.getDate() + daysUntilTuesday);
  return date.toISOString().split('T')[0];
};

// Helper: Finde einen Montag (Restaurant nur abends offen)
const getNextMonday = (): string => {
  const date = new Date();
  const day = date.getDay();
  // Berechne Tage bis Montag
  let daysUntilMonday = (1 - day + 7) % 7;
  
  // Falls heute Montag ist (0), nimm nächsten Montag (7 Tage)
  if (daysUntilMonday === 0) {
    daysUntilMonday = 7;
  }
  
  date.setDate(date.getDate() + daysUntilMonday);
  return date.toISOString().split('T')[0];
};

describe('Availability Routes', () => {
  
  describe('GET /availability/slots', () => {
    
    it('should return available slots for restaurant table', async () => {
      const date = getTomorrowDate();
      
      const response = await request(app)
        .get('/availability/slots')
        .query({
          venueId: 1,
          serviceId: 1, // Tisch für 2 Personen
          date: date
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.date).toBe(date);
      expect(response.body.data.time_slots).toBeInstanceOf(Array);
    });

    it('should return slots with correct structure', async () => {
      const date = getTomorrowDate();
      
      const response = await request(app)
        .get('/availability/slots')
        .query({
          venueId: 1,
          serviceId: 1,
          date: date
        })
        .expect(200);

      if (response.body.data.time_slots.length > 0) {
        const slot = response.body.data.time_slots[0];
        expect(slot).toHaveProperty('start_time');
        expect(slot).toHaveProperty('end_time');
        expect(slot).toHaveProperty('available');
        expect(typeof slot.available).toBe('boolean');
      }
    });

    it('should return slots for hair salon service with staff', async () => {
      const date = getNextTuesday();
      
      const response = await request(app)
        .get('/availability/slots')
        .query({
          venueId: 2,
          serviceId: 4, // Herrenhaarschnitt (45 Min)
          date: date
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.time_slots).toBeInstanceOf(Array);
      
      // Für Mitarbeiter-Services sollten Slots staff_member_id haben
      if (response.body.data.time_slots.length > 0) {
        const slot = response.body.data.time_slots[0];
        expect(slot).toHaveProperty('staff_member_id');
      }
    });

    it('should return 400 if venueId is missing', async () => {
      const response = await request(app)
        .get('/availability/slots')
        .query({
          serviceId: 1,
          date: getTomorrowDate()
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Missing');
    });

    it('should return 400 if serviceId is missing', async () => {
      const response = await request(app)
        .get('/availability/slots')
        .query({
          venueId: 1,
          date: getTomorrowDate()
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 if date is missing', async () => {
      const response = await request(app)
        .get('/availability/slots')
        .query({
          venueId: 1,
          serviceId: 1
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should respect opening hours for specific weekdays', async () => {
      // Test Montag (festes Datum: 2025-10-20)
      const mondayResponse = await request(app)
        .get('/availability/slots')
        .query({
          venueId: 1,
          serviceId: 1,
          date: '2025-10-20' // Montag
        })
        .expect(200);

      const mondaySlots = mondayResponse.body.data.time_slots;
      
      if (mondaySlots.length > 0) {
        // Montag: nur abends (17:00-22:00)
        const firstMondayHour = parseInt(mondaySlots[0].start_time.split(':')[0]);
        expect(firstMondayHour).toBeGreaterThanOrEqual(17);
      }

      // Test Dienstag (festes Datum: 2025-10-21)
      const tuesdayResponse = await request(app)
        .get('/availability/slots')
        .query({
          venueId: 1,
          serviceId: 1,
          date: '2025-10-21' // Dienstag
        })
        .expect(200);

      const tuesdaySlots = tuesdayResponse.body.data.time_slots;
      
      if (tuesdaySlots.length > 0) {
        // Dienstag: ab 11:30
        const firstTuesdaySlot = tuesdaySlots[0].start_time;
        const [hours, minutes] = firstTuesdaySlot.split(':').map(Number);
        const firstTimeMinutes = hours * 60 + minutes;
        
        // 11:30 = 690 Minuten
        expect(firstTimeMinutes).toBeGreaterThanOrEqual(690);
      }
    });

    it('should respect service duration for slot generation', async () => {
      const date = getNextTuesday();
      
      // Herrenhaarschnitt: 45 Min
      const response = await request(app)
        .get('/availability/slots')
        .query({
          venueId: 2,
          serviceId: 4,
          date: date
        })
        .expect(200);

      if (response.body.data.time_slots.length > 0) {
        const slot = response.body.data.time_slots[0];
        const startMinutes = parseInt(slot.start_time.split(':')[0]) * 60 + 
                           parseInt(slot.start_time.split(':')[1]);
        const endMinutes = parseInt(slot.end_time.split(':')[0]) * 60 + 
                         parseInt(slot.end_time.split(':')[1]);
        
        expect(endMinutes - startMinutes).toBe(45);
      }
    });
  });

  describe('GET /availability/week', () => {
    
    it('should return week availability for restaurant', async () => {
      const startDate = getTomorrowDate();
      
      const response = await request(app)
        .get('/availability/week')
        .query({
          venueId: 1,
          serviceId: 1,
          startDate: startDate
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(7); // 7 Tage
    });

    it('should return week availability with correct dates', async () => {
      const startDate = getTomorrowDate();
      
      const response = await request(app)
        .get('/availability/week')
        .query({
          venueId: 1,
          serviceId: 1,
          startDate: startDate
        })
        .expect(200);

      // Prüfe, ob alle 7 Tage vorhanden sind
      response.body.data.forEach((day: any, index: number) => {
        expect(day).toHaveProperty('date');
        expect(day).toHaveProperty('day_of_week');
        expect(day).toHaveProperty('time_slots');
      });
    });

    it('should return 400 if venueId is missing', async () => {
      const response = await request(app)
        .get('/availability/week')
        .query({
          serviceId: 1,
          startDate: getTomorrowDate()
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 if serviceId is missing', async () => {
      const response = await request(app)
        .get('/availability/week')
        .query({
          venueId: 1,
          startDate: getTomorrowDate()
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 if startDate is missing', async () => {
      const response = await request(app)
        .get('/availability/week')
        .query({
          venueId: 1,
          serviceId: 1
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /availability/check', () => {
    
    it('should confirm available slot for restaurant', async () => {
      const date = getTomorrowDate();
      
      const response = await request(app)
        .post('/availability/check')
        .send({
          venueId: 1,
          serviceId: 1,
          date: date,
          startTime: '19:00',
          endTime: '21:00',
          partySize: 2
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('available');
      expect(typeof response.body.data.available).toBe('boolean');
    });

    it('should reject slot outside opening hours', async () => {
      const date = getTomorrowDate();
      
      const response = await request(app)
        .post('/availability/check')
        .send({
          venueId: 1,
          serviceId: 1,
          date: date,
          startTime: '08:00', // Zu früh
          endTime: '10:00',
          partySize: 2
        })
        .expect(200);

      expect(response.body.data.available).toBe(false);
      expect(response.body.data.reason).toBeDefined();
    });

    it('should check staff availability for hair salon', async () => {
      const date = getNextTuesday();
      
      const response = await request(app)
        .post('/availability/check')
        .send({
          venueId: 2,
          serviceId: 4,
          staffMemberId: 2, // Klaus Meyer
          date: date,
          startTime: '10:00',
          endTime: '10:45',
          partySize: 1
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('available');
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/availability/check')
        .send({
          venueId: 1,
          serviceId: 1
          // date, startTime, endTime fehlen
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should allow checking past dates (validation happens elsewhere)', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const pastDate = yesterday.toISOString().split('T')[0];
      
      const response = await request(app)
        .post('/availability/check')
        .send({
          venueId: 1,
          serviceId: 1,
          date: pastDate,
          startTime: '19:00',
          endTime: '21:00',
          partySize: 2
        })
        .expect(200);

      // Der check-Endpoint prüft nur Verfügbarkeit, nicht ob Datum in Vergangenheit
      // Die Validierung auf past dates erfolgt im /validate Endpoint
      expect(response.body.data).toHaveProperty('available');
      expect(typeof response.body.data.available).toBe('boolean');
    });

    it('should reject party size exceeding capacity', async () => {
      const date = getTomorrowDate();
      
      const response = await request(app)
        .post('/availability/check')
        .send({
          venueId: 1,
          serviceId: 1, // Kapazität: 2
          date: date,
          startTime: '19:00',
          endTime: '21:00',
          partySize: 5 // Zu groß
        })
        .expect(200);

      expect(response.body.data.available).toBe(false);
      expect(response.body.data.reason).toContain('capacity');
    });
  });

  describe('POST /availability/validate', () => {
    
    it('should validate correct booking request', async () => {
      const date = getTomorrowDate();
      
      const response = await request(app)
        .post('/availability/validate')
        .send({
          venueId: 1,
          serviceId: 1,
          bookingDate: date,
          startTime: '19:00',
          endTime: '21:00',
          partySize: 2
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.valid).toBe(true);
      expect(response.body.data.errors).toBeInstanceOf(Array);
      expect(response.body.data.errors.length).toBe(0);
    });

    it('should return validation errors for invalid request', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const pastDate = yesterday.toISOString().split('T')[0];
      
      const response = await request(app)
        .post('/availability/validate')
        .send({
          venueId: 1,
          serviceId: 1,
          bookingDate: pastDate, // Vergangenheit
          startTime: '08:00', // Außerhalb Öffnungszeiten
          endTime: '10:00',
          partySize: 10 // Zu groß
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.data.valid).toBe(false);
      expect(response.body.data.errors.length).toBeGreaterThan(0);
    });

    it('should validate staff requirement for salon service', async () => {
      const date = getNextTuesday();
      
      // Ohne staffMemberId sollte Fehler kommen
      const responseWithoutStaff = await request(app)
        .post('/availability/validate')
        .send({
          venueId: 2,
          serviceId: 4, // Herrenhaarschnitt - requires_staff: true
          bookingDate: date,
          startTime: '10:00',
          endTime: '10:45',
          partySize: 1
          // staffMemberId fehlt
        })
        .expect(400);

      expect(responseWithoutStaff.body.data.valid).toBe(false);
      expect(responseWithoutStaff.body.data.errors).toContain('Staff member is required for this service');

      // Mit staffMemberId sollte OK sein ODER einen anderen Validierungsfehler geben
      const responseWithStaff = await request(app)
        .post('/availability/validate')
        .send({
          venueId: 2,
          serviceId: 4,
          staffMemberId: 2, // Klaus Meyer
          bookingDate: date,
          startTime: '10:00',
          endTime: '10:45',
          partySize: 1
        });

      // Wenn Status 200: sollte valid sein
      // Wenn Status 400: sollte NICHT "Staff member is required" sein
      if (responseWithStaff.status === 200) {
        expect(responseWithStaff.body.data.valid).toBe(true);
      } else if (responseWithStaff.status === 400) {
        // Andere Fehler sind OK (z.B. "already booked"), aber nicht Staff-Requirement
        expect(responseWithStaff.body.data.errors).not.toContain('Staff member is required for this service');
      }
    });

    it('should validate correctly with valid staff and future date', async () => {
      // Wähle ein Datum in 14 Tagen (sicher in Zukunft)
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 14);
      
      // Finde nächsten Dienstag ab diesem Datum
      const dayOfWeek = futureDate.getDay();
      const daysUntilTuesday = (2 - dayOfWeek + 7) % 7;
      futureDate.setDate(futureDate.getDate() + daysUntilTuesday);
      const dateStr = futureDate.toISOString().split('T')[0];
      
      const response = await request(app)
        .post('/availability/validate')
        .send({
          venueId: 2,
          serviceId: 4,
          staffMemberId: 2, // Klaus Meyer
          bookingDate: dateStr,
          startTime: '11:00', // Mitten in Arbeitszeit (09:00-18:00)
          endTime: '11:45',
          partySize: 1
        });

      // Sollte entweder valid sein oder einen anderen Fehler haben (nicht Staff-Requirement)
      if (response.status === 200) {
        expect(response.body.data.valid).toBe(true);
      } else {
        expect(response.body.data.errors).not.toContain('Staff member is required for this service');
      }
    });

    it('should validate invalid time format', async () => {
      const date = getTomorrowDate();
      
      const response = await request(app)
        .post('/availability/validate')
        .send({
          venueId: 1,
          serviceId: 1,
          bookingDate: date,
          startTime: '25:00', // Ungültig
          endTime: '26:00',
          partySize: 2
        })
        .expect(400);

      expect(response.body.data.valid).toBe(false);
      expect(response.body.data.errors.some((e: string) => e.includes('time format'))).toBe(true);
    });

    it('should reject past dates in validation', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const pastDate = yesterday.toISOString().split('T')[0];
      
      const response = await request(app)
        .post('/availability/validate')
        .send({
          venueId: 1,
          serviceId: 1,
          bookingDate: pastDate,
          startTime: '19:00',
          endTime: '21:00',
          partySize: 2
        })
        .expect(400);

      expect(response.body.data.valid).toBe(false);
      expect(response.body.data.errors.some((e: string) => e.includes('past'))).toBe(true);
    });

    it('should validate end time before start time', async () => {
      const date = getTomorrowDate();
      
      const response = await request(app)
        .post('/availability/validate')
        .send({
          venueId: 1,
          serviceId: 1,
          bookingDate: date,
          startTime: '20:00',
          endTime: '19:00', // Vor Startzeit
          partySize: 2
        })
        .expect(400);

      expect(response.body.data.valid).toBe(false);
      expect(response.body.data.errors.some((e: string) => e.includes('after start time'))).toBe(true);
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/availability/validate')
        .send({
          venueId: 1
          // Alle anderen Felder fehlen
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /availability/service/:serviceId', () => {
    
    it('should return service details for restaurant table', async () => {
      const response = await request(app)
        .get('/availability/service/1')
        .query({ venueId: 1 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBe(1);
      expect(response.body.data.name).toBe('Tisch für 2 Personen');
      // MariaDB gibt BOOLEAN als 0/1 zurück, nicht true/false
      expect(response.body.data.requires_staff).toBeFalsy(); // 0 oder false
    });

    it('should return service details for hair cut', async () => {
      const response = await request(app)
        .get('/availability/service/4')
        .query({ venueId: 2 });

      // Debug: Log bei Fehler
      if (response.status !== 200) {
        console.log('Response Status:', response.status);
        console.log('Response Body:', response.body);
      }

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(4);
      expect(response.body.data.name).toBe('Herrenhaarschnitt');
      // MariaDB gibt BOOLEAN als 0/1 zurück, nicht true/false
      expect(response.body.data.requires_staff).toBeTruthy(); // 1 oder true
      expect(response.body.data.duration_minutes).toBe(45);
      // MariaDB DECIMAL wird als String zurückgegeben
      expect(parseFloat(response.body.data.price)).toBe(35);
    });

    it('should return 400 if venueId is missing', async () => {
      const response = await request(app)
        .get('/availability/service/1')
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent service', async () => {
      const response = await request(app)
        .get('/availability/service/9999')
        .query({ venueId: 1 })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Service not found');
    });
  });

  describe('GET /availability/staff/:staffId/can-perform/:serviceId', () => {
    
    it('should confirm Anna can perform all services', async () => {
      // Anna (ID 1) kann alle 3 Services
      const services = [4, 5, 6];
      
      for (const serviceId of services) {
        const response = await request(app)
          .get(`/availability/staff/1/can-perform/${serviceId}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.canPerform).toBe(true);
      }
    });

    it('should confirm Klaus can only perform Herrenhaarschnitt', async () => {
      // Klaus (ID 2) kann nur Service 4 (Herrenhaarschnitt)
      const responseYes = await request(app)
        .get('/availability/staff/2/can-perform/4')
        .expect(200);

      expect(responseYes.body.data.canPerform).toBe(true);

      // Klaus kann NICHT Service 5 und 6
      const responseNo1 = await request(app)
        .get('/availability/staff/2/can-perform/5')
        .expect(200);

      expect(responseNo1.body.data.canPerform).toBe(false);

      const responseNo2 = await request(app)
        .get('/availability/staff/2/can-perform/6')
        .expect(200);

      expect(responseNo2.body.data.canPerform).toBe(false);
    });

    it('should return false for non-existent staff-service combination', async () => {
      const response = await request(app)
        .get('/availability/staff/999/can-perform/1')
        .expect(200);

      expect(response.body.data.canPerform).toBe(false);
    });

    it('should return false for invalid IDs', async () => {
      const response = await request(app)
        .get('/availability/staff/1/can-perform/999')
        .expect(200);

      expect(response.body.data.canPerform).toBe(false);
    });
  });
});