import dotenv from 'dotenv';

// Lade Test-Umgebungsvariablen
dotenv.config({ path: '.env.test' });

// Global Test Setup
beforeAll(() => {
  console.log('🧪 Starting test suite...');
});

afterAll(() => {
  console.log('✅ Test suite completed');
});