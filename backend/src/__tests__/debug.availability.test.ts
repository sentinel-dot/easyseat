import request from 'supertest';
import express from 'express';
import cors from 'cors';
import mariadb from 'mariadb';
import dotenv from 'dotenv';
import availabilityRoutes from '../routes/availability.routes';

dotenv.config({ path: '.env.test' });

const app = express();
app.use(cors());
app.use(express.json());
app.use('/availability', availabilityRoutes);

// Direct DB connection for debugging
const mariadbSocket = '/run/mysqld/mysqld.sock';
const pool = mariadb.createPool({
    socketPath: mariadbSocket,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 10,
});

describe('🐛 DEBUG: Availability Day of Week Issues', () => {
  
  describe('Database Availability Rules Check', () => {
    
    it('should show all availability rules for Restaurant (Venue 1)', async () => {
      const conn = await pool.getConnection();
      
      const rules = await conn.query(`
        SELECT id, venue_id, day_of_week, start_time, end_time, is_active
        FROM availability_rules
        WHERE venue_id = 1
        ORDER BY day_of_week
      `) as Array<{
        id: number;
        venue_id: number;
        day_of_week: number;
        start_time: string;
        end_time: string;
        is_active: boolean | number;
      }>;
      
      conn.release();
      
      console.log('\n📋 RESTAURANT AVAILABILITY RULES:');
      console.log('==================================');
      rules.forEach((rule) => {
        const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][rule.day_of_week];
        console.log(`Day ${rule.day_of_week} (${dayName}): ${rule.start_time}-${rule.end_time} | Active: ${rule.is_active}`);
      });
      console.log('');
      
      // Assertions
      expect(rules.length).toBeGreaterThan(0);
      
      // Finde Montag-Regel
      const mondayRule = rules.find((r) => r.day_of_week === 1);
      if (mondayRule) {
        console.log('✅ Monday rule found:', mondayRule.start_time, '-', mondayRule.end_time);
        expect(mondayRule.start_time).toBe('17:00');
        expect(mondayRule.end_time).toBe('22:00');
      } else {
        console.log('❌ No Monday rule found!');
      }
    });

    it('should show all availability rules for Hair Salon (Venue 2)', async () => {
      const conn = await pool.getConnection();
      
      const rules = await conn.query(`
        SELECT sm.id as staff_id, sm.name, ar.day_of_week, ar.start_time, ar.end_time
        FROM availability_rules ar
        JOIN staff_members sm ON ar.staff_member_id = sm.id
        WHERE sm.venue_id = 2
        ORDER BY sm.id, ar.day_of_week
      `) as Array<{
        staff_id: number;
        name: string;
        day_of_week: number;
        start_time: string;
        end_time: string;
      }>;
      
      conn.release();
      
      console.log('\n📋 HAIR SALON STAFF AVAILABILITY:');
      console.log('==================================');
      
      let currentStaffId: number | null = null;
      rules.forEach((rule) => {
        if (rule.staff_id !== currentStaffId) {
          console.log(`\n👤 ${rule.name} (ID: ${rule.staff_id}):`);
          currentStaffId = rule.staff_id;
        }
        const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][rule.day_of_week];
        console.log(`   Day ${rule.day_of_week} (${dayName}): ${rule.start_time}-${rule.end_time}`);
      });
      console.log('');
      
      expect(rules.length).toBeGreaterThan(0);
    });
  });

  describe('JavaScript Date.getDay() vs Database day_of_week', () => {
    
    it('should verify JavaScript date calculations', () => {
      console.log('\n📅 JAVASCRIPT DATE CALCULATIONS:');
      console.log('==================================');
      
      // Test verschiedene Daten
      const testDates = [
        '2025-10-20', // Montag
        '2025-10-21', // Dienstag
        '2025-10-22', // Mittwoch
        '2025-10-23', // Donnerstag
        '2025-10-24', // Freitag
        '2025-10-25', // Samstag
        '2025-10-26', // Sonntag
      ];
      
      testDates.forEach(dateStr => {
        const date = new Date(dateStr);
        const jsDay = date.getDay(); // 0=Sunday, 1=Monday, ...
        const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][jsDay];
        
        console.log(`${dateStr} → JS getDay()=${jsDay} (${dayName})`);
      });
      
      console.log('\n⚠️  JavaScript: 0=Sunday, 1=Monday, ..., 6=Saturday');
      console.log('⚠️  MySQL DAYOFWEEK(): 1=Sunday, 2=Monday, ..., 7=Saturday');
      console.log('');
    });

    it('should test actual API behavior for Monday', async () => {
      // Feste Daten verwenden statt "next Monday"
      const testDate = '2025-10-20'; // Ein bekannter Montag
      const dateObj = new Date(testDate);
      const jsDay = dateObj.getDay();
      
      console.log('\n🧪 TESTING MONDAY API CALL:');
      console.log('==================================');
      console.log('Test Date:', testDate);
      console.log('JavaScript getDay():', jsDay);
      console.log('Expected: 1 (Monday)');
      console.log('');
      
      const response = await request(app)
        .get('/availability/slots')
        .query({
          venueId: 1,
          serviceId: 1,
          date: testDate
        });
      
      console.log('Response Status:', response.status);
      
      if (response.status === 200) {
        const slots = response.body.data.time_slots;
        console.log('Total Slots:', slots.length);
        
        if (slots.length > 0) {
          console.log('First Slot:', slots[0].start_time);
          console.log('Last Slot:', slots[slots.length - 1].start_time);
          
          // Analysiere alle Slot-Zeiten
          const hours: number[] = slots.map((s: any) => parseInt(s.start_time.split(':')[0]));
          const uniqueHours = [...new Set(hours)].sort((a, b) => a - b);
          
          console.log('Hours with slots:', uniqueHours.join(', '));
          
          // Prüfe ob Slots vor 17:00 existieren
          const morningSlots = slots.filter((s: any) => 
            parseInt(s.start_time.split(':')[0]) < 17
          );
          
          if (morningSlots.length > 0) {
            console.log('');
            console.log('❌ PROBLEM FOUND:');
            console.log(`   ${morningSlots.length} slots before 17:00 on Monday!`);
            console.log('   Expected: Only slots from 17:00-22:00');
            console.log('   First morning slot:', morningSlots[0].start_time);
          } else {
            console.log('');
            console.log('✅ All slots are after 17:00 - CORRECT');
          }
        } else {
          console.log('⚠️  No slots returned');
        }
      }
      
      console.log('');
    });

    it('should test actual API behavior for Tuesday', async () => {
      const testDate = '2025-10-21'; // Ein bekannter Dienstag
      const dateObj = new Date(testDate);
      const jsDay = dateObj.getDay();
      
      console.log('\n🧪 TESTING TUESDAY API CALL:');
      console.log('==================================');
      console.log('Test Date:', testDate);
      console.log('JavaScript getDay():', jsDay);
      console.log('Expected: 2 (Tuesday)');
      console.log('');
      
      const response = await request(app)
        .get('/availability/slots')
        .query({
          venueId: 1,
          serviceId: 1,
          date: testDate
        });
      
      console.log('Response Status:', response.status);
      
      if (response.status === 200) {
        const slots = response.body.data.time_slots;
        console.log('Total Slots:', slots.length);
        
        if (slots.length > 0) {
          console.log('First Slot:', slots[0].start_time);
          console.log('Last Slot:', slots[slots.length - 1].start_time);
          
          const firstHour = parseInt(slots[0].start_time.split(':')[0]);
          const firstMinute = parseInt(slots[0].start_time.split(':')[1]);
          
          console.log('');
          console.log('Expected first slot: >= 11:30');
          console.log(`Actual first slot: ${slots[0].start_time}`);
          
          if (firstHour < 11 || (firstHour === 11 && firstMinute < 30)) {
            console.log('❌ PROBLEM: Slots start before 11:30!');
          } else {
            console.log('✅ First slot is correct');
          }
        }
      }
      
      console.log('');
    });
  });

  describe('Database Query Debugging', () => {
    
    it('should show what query returns for Monday', async () => {
      const conn = await pool.getConnection();
      
      const testDate = '2025-10-20'; // Montag
      const jsDate = new Date(testDate);
      const jsDayOfWeek = jsDate.getDay();
      
      console.log('\n🔍 DATABASE QUERY DEBUG:');
      console.log('==================================');
      console.log('Test Date:', testDate);
      console.log('JavaScript getDay():', jsDayOfWeek);
      console.log('');
      
      // Query wie im Service
      const rules = await conn.query(`
        SELECT start_time, end_time
        FROM availability_rules
        WHERE venue_id = ?
        AND day_of_week = ?
        AND is_active = true
      `, [1, jsDayOfWeek]) as Array<{
        start_time: string;
        end_time: string;
      }>;
      
      console.log('Query: WHERE venue_id=1 AND day_of_week=' + jsDayOfWeek);
      console.log('Results:', rules.length);
      
      if (rules.length > 0) {
        rules.forEach((rule, i) => {
          console.log(`  Rule ${i + 1}: ${rule.start_time} - ${rule.end_time}`);
        });
      } else {
        console.log('  ❌ No rules found!');
        
        // Zeige was tatsächlich in der DB ist
        const allRules = await conn.query(`
          SELECT day_of_week, start_time, end_time
          FROM availability_rules
          WHERE venue_id = 1
        `) as Array<{
          day_of_week: number;
          start_time: string;
          end_time: string;
        }>;
        
        console.log('');
        console.log('All rules in database for venue 1:');
        allRules.forEach((rule) => {
          console.log(`  day_of_week=${rule.day_of_week}: ${rule.start_time}-${rule.end_time}`);
        });
      }
      
      conn.release();
      console.log('');
    });
  });

  afterAll(async () => {
    await pool.end();
  });
});