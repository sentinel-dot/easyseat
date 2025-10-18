import request from 'supertest';
import express from 'express';
import cors from 'cors';
import mariadb from 'mariadb';
import dotenv from 'dotenv';
import venueRoutes from '../routes/venue.routes';
import availabilityRoutes from '../routes/availability.routes';

dotenv.config({ path: '.env.test' });

// Setup Express App
const app = express();
app.use(cors());
app.use(express.json());
app.use('/venues', venueRoutes);
app.use('/availability', availabilityRoutes);

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// DB Connection Pool
const mariadbSocket = '/run/mysqld/mysqld.sock';
const pool = mariadb.createPool({
  socketPath: mariadbSocket,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 5,
});

describe('🚀 Smoke Tests - Critical System Checks', () => {
  
  afterAll(async () => {
    await pool.end();
  });

  describe('System Health', () => {
    
    it('should start server and respond to health check', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('ok');
      expect(response.body.timestamp).toBeDefined();
    });

    it('should have CORS enabled', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      // CORS headers sollten vorhanden sein
      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });

  describe('Database Connection', () => {
    
    it('should connect to database successfully', async () => {
      let conn;
      try {
        conn = await pool.getConnection();
        expect(conn).toBeDefined();
      } finally {
        if (conn) conn.release();
      }
    });

    it('should query database successfully', async () => {
      const conn = await pool.getConnection();
      try {
        const result = await conn.query('SELECT 1 as test');
        expect(result).toBeDefined();
        expect(result[0].test).toBe(1);
      } finally {
        conn.release();
      }
    });

    it('should have required tables', async () => {
      const conn = await pool.getConnection();
      try {
        const tables = await conn.query(`
          SHOW TABLES LIKE 'venues'
        `);
        expect(tables.length).toBeGreaterThan(0);
      } finally {
        conn.release();
      }
    });

    it('should have seed data in venues table', async () => {
      const conn = await pool.getConnection();
      try {
        const venues = await conn.query(`
          SELECT COUNT(*) as count FROM venues WHERE is_active = 1
        `);
        expect(venues[0].count).toBeGreaterThan(0);
      } finally {
        conn.release();
      }
    });
  });

  describe('Critical Endpoints Accessibility', () => {
    
    it('should access GET /venues', async () => {
      const response = await request(app)
        .get('/venues')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('should access GET /venues/:id', async () => {
      const response = await request(app)
        .get('/venues/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
    });

    it('should access GET /availability/slots', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const date = tomorrow.toISOString().split('T')[0];

      const response = await request(app)
        .get('/availability/slots')
        .query({
          venueId: 1,
          serviceId: 1,
          date: date
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should access POST /availability/check', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const date = tomorrow.toISOString().split('T')[0];

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
    });

    it('should access POST /availability/validate', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const date = tomorrow.toISOString().split('T')[0];

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
      expect(response.body.data).toHaveProperty('valid');
    });
  });

  describe('Error Handling', () => {
    
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/non-existent-route')
        .expect(404);
    });

    it('should handle invalid JSON gracefully', async () => {
      const response = await request(app)
        .post('/availability/check')
        .set('Content-Type', 'application/json')
        .send('invalid json{')
        .expect(400);
    });

    it('should validate required parameters', async () => {
      const response = await request(app)
        .post('/availability/check')
        .send({
          // Missing required fields
          venueId: 1
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Response Format Consistency', () => {
    
    it('should return consistent success response format', async () => {
      const response = await request(app)
        .get('/venues')
        .expect(200);

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('data');
      expect(response.body.success).toBe(true);
    });

    it('should return consistent error response format', async () => {
      const response = await request(app)
        .get('/venues/invalid')
        .expect(400);

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('message');
      expect(response.body.success).toBe(false);
    });
  });

  describe('Performance - Basic Response Time', () => {
    
    it('should respond to /venues within acceptable time', async () => {
      const start = Date.now();
      
      await request(app)
        .get('/venues')
        .expect(200);
      
      const duration = Date.now() - start;
      
      // Sollte unter 1 Sekunde sein
      expect(duration).toBeLessThan(1000);
    }, 5000);

    it('should respond to availability check within acceptable time', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const date = tomorrow.toISOString().split('T')[0];

      const start = Date.now();
      
      await request(app)
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
      
      const duration = Date.now() - start;
      
      // Sollte unter 2 Sekunden sein
      expect(duration).toBeLessThan(2000);
    }, 5000);
  });
});