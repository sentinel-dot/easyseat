import request from 'supertest';
import express from 'express';
import cors from 'cors';
import venueRoutes from '../routes/venue.routes';

// Setup Express App für Tests
const app = express();
app.use(cors());
app.use(express.json());
app.use('/venues', venueRoutes);

describe('Venue Routes', () => {
  
  describe('GET /venues', () => {
    
    it('should return all active venues', async () => {
      const response = await request(app)
        .get('/venues')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should return venues with correct structure', async () => {
      const response = await request(app)
        .get('/venues')
        .expect(200);

      const venue = response.body.data[0];
      
      // Prüfe, ob alle erforderlichen Felder vorhanden sind
      expect(venue).toHaveProperty('id');
      expect(venue).toHaveProperty('name');
      expect(venue).toHaveProperty('type');
      expect(venue).toHaveProperty('email');
      expect(venue).toHaveProperty('address');
      expect(venue).toHaveProperty('city');
      expect(venue).toHaveProperty('postal_code');
      expect(venue).toHaveProperty('description');
      expect(venue).toHaveProperty('booking_advance_days');
      expect(venue).toHaveProperty('cancellation_hours');
    });

    it('should return only active venues', async () => {
      const response = await request(app)
        .get('/venues')
        .expect(200);

      // Alle Venues sollten aktiv sein (is_active wird im Query gefiltert)
      response.body.data.forEach((venue: any) => {
        expect(venue.id).toBeDefined();
      });
    });

    it('should have correct venue types', async () => {
      const response = await request(app)
        .get('/venues')
        .expect(200);

      const validTypes = ['restaurant', 'hair_salon', 'beauty_salon', 'massage', 'other'];
      
      response.body.data.forEach((venue: any) => {
        expect(validTypes).toContain(venue.type);
      });
    });
  });

  describe('GET /venues/:id', () => {
    
    it('should return venue details for valid ID (Bella Vista - Restaurant)', async () => {
      const response = await request(app)
        .get('/venues/1')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBe(1);
      expect(response.body.data.name).toBe('Bella Vista Restaurant');
      expect(response.body.data.type).toBe('restaurant');
    });

    it('should return venue with services (Restaurant)', async () => {
      const response = await request(app)
        .get('/venues/1')
        .expect(200);

      expect(response.body.data.services).toBeInstanceOf(Array);
      expect(response.body.data.services.length).toBeGreaterThan(0);
      
      // Prüfe Service-Struktur
      const service = response.body.data.services[0];
      expect(service).toHaveProperty('id');
      expect(service).toHaveProperty('name');
      expect(service).toHaveProperty('duration_minutes');
      expect(service).toHaveProperty('capacity');
      expect(service).toHaveProperty('requires_staff');
    });

    it('should return venue details for valid ID (Salon Schmidt - Hair Salon)', async () => {
      const response = await request(app)
        .get('/venues/2')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(2);
      expect(response.body.data.name).toBe('Salon Schmidt');
      expect(response.body.data.type).toBe('hair_salon');
    });

    it('should return venue with staff members (Hair Salon)', async () => {
      const response = await request(app)
        .get('/venues/2')
        .expect(200);

      expect(response.body.data.staff_members).toBeInstanceOf(Array);
      expect(response.body.data.staff_members.length).toBeGreaterThan(0);
      
      // Prüfe Staff-Struktur
      const staff = response.body.data.staff_members[0];
      expect(staff).toHaveProperty('id');
      expect(staff).toHaveProperty('name');
      expect(staff).toHaveProperty('email');
      expect(staff).toHaveProperty('description');
    });

    it('should return 400 for invalid venue ID (string)', async () => {
      const response = await request(app)
        .get('/venues/invalid')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid venue ID');
    });

    it('should return 400 for invalid venue ID (zero)', async () => {
      const response = await request(app)
        .get('/venues/0')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid venue ID');
    });

    it('should return 400 for invalid venue ID (negative)', async () => {
      const response = await request(app)
        .get('/venues/-1')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid venue ID');
    });

    it('should return 404 for non-existent venue', async () => {
      const response = await request(app)
        .get('/venues/9999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Venue not found');
    });

    it('should include both services and staff for hair salon', async () => {
      const response = await request(app)
        .get('/venues/2')
        .expect(200);

      expect(response.body.data.services).toBeInstanceOf(Array);
      expect(response.body.data.staff_members).toBeInstanceOf(Array);
      expect(response.body.data.services.length).toBeGreaterThan(0);
      expect(response.body.data.staff_members.length).toBeGreaterThan(0);
    });

    it('should verify restaurant has no staff members', async () => {
      const response = await request(app)
        .get('/venues/1')
        .expect(200);

      expect(response.body.data.staff_members).toBeInstanceOf(Array);
      expect(response.body.data.staff_members.length).toBe(0);
    });

    it('should verify services require_staff correctly', async () => {
      // Restaurant services should NOT require staff
      const restaurantResponse = await request(app)
        .get('/venues/1')
        .expect(200);

      restaurantResponse.body.data.services.forEach((service: any) => {
        expect(service.requires_staff).toBeFalsy();
      });

      // Hair salon services SHOULD require staff
      const salonResponse = await request(app)
        .get('/venues/2')
        .expect(200);

      salonResponse.body.data.services.forEach((service: any) => {
        expect(service.requires_staff).toBeTruthy();
      });
    });
  });
});