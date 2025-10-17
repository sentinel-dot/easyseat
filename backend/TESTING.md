# 🧪 Easyseat Backend Testing Guide

Umfassende Test-Suite für das Easyseat Backend mit Jest und Postman.

## 📋 Inhaltsverzeichnis

1. [Setup](#setup)
2. [Automatisierte Tests (Jest)](#automatisierte-tests-jest)
3. [Manuelle Tests (Postman)](#manuelle-tests-postman)
4. [Test-Szenarien](#test-szenarien)
5. [Troubleshooting](#troubleshooting)

---

## 🔧 Setup

### 1. Abhängigkeiten installieren

```bash
cd backend
npm install
```

### 2. Test-Datenbank vorbereiten

Stelle sicher, dass deine Datenbank mit dem Seed-Script befüllt ist:

```bash
# MariaDB Shell öffnen
sudo mariadb

# Seed ausführen
USE easyseatdb;
SOURCE src/config/database/seed.sql;
```

### 3. Environment-Variablen

Die `.env.test` Datei ist bereits konfiguriert. Falls nötig, passe die Werte an:

```env
NODE_ENV=test
PORT=3000
DB_USER=dev
DB_PASSWORD=devpw
DB_NAME=easyseatdb
```

---

## 🤖 Automatisierte Tests (Jest)

### Alle Tests ausführen

```bash
npm test
```

### Tests im Watch-Modus

```bash
npm run test:watch
```

### Coverage Report generieren

```bash
npm run test:coverage
```

### Nur Venue Tests

```bash
npm run test:venues
```

### Nur Availability Tests

```bash
npm run test:availability
```

### Verbose Output

```bash
npm run test:verbose
```

---

## 📮 Manuelle Tests (Postman)

### Postman Collection importieren

1. **Postman öffnen**
2. **Import** → **File** → Wähle `Easyseat API Tests.postman_collection.json`
3. **Import** → **File** → Wähle `Easyseat.postman_environment.json`
4. **Environment** auf "Easyseat Local" setzen

### Collection ausführen

#### Manuelle Ausführung
- Klicke auf "Easyseat API Tests"
- Wähle einen Ordner (z.B. "Venues")
- Klicke auf einzelne Requests zum Testen

#### Collection Runner
1. Rechtsklick auf "Easyseat API Tests"
2. **Run collection**
3. Wähle Environment: "Easyseat Local"
4. **Run**

#### Mit Newman (CLI)

```bash
# Newman installieren (global)
npm install -g newman

# Collection ausführen
newman run "Easyseat API Tests.postman_collection.json" \
  -e Easyseat.postman_environment.json \
  --reporters cli,json

# Mit HTML Report
newman run "Easyseat API Tests.postman_collection.json" \
  -e Easyseat.postman_environment.json \
  --reporters cli,htmlextra \
  --reporter-htmlextra-export ./test-results/report.html
```

---

## 🎯 Test-Szenarien

### 1. Venue Tests

#### ✅ Success Cases
- `GET /venues` - Alle aktiven Venues
- `GET /venues/1` - Bella Vista Restaurant Details
- `GET /venues/2` - Salon Schmidt Details

#### ❌ Error Cases
- `GET /venues/invalid` - 400: Invalid ID (String)
- `GET /venues/0` - 400: Invalid ID (Zero)
- `GET /venues/-1` - 400: Invalid ID (Negative)
- `GET /venues/9999` - 404: Venue not found

#### 🔍 Was wird getestet?
- Korrekte Response-Struktur
- Alle benötigten Felder vorhanden
- Restaurant hat **keine** Staff Members
- Hair Salon hat Staff Members
- Services mit korrektem `requires_staff` Flag

---

### 2. Availability Slots Tests

#### ✅ Success Cases
- `GET /availability/slots` - Restaurant Tische für morgen
- `GET /availability/slots` - Hair Salon mit Staff für nächsten Dienstag

#### ❌ Error Cases
- Fehlende `venueId` - 400
- Fehlende `serviceId` - 400
- Fehlende `date` - 400

#### 🔍 Was wird getestet?
- Time Slots haben korrekte Struktur
- `start_time` und `end_time` vorhanden
- `available` ist Boolean
- Staff-Services haben `staff_member_id`
- Slot-Dauer entspricht Service-Duration
- Montag-Vormittag: Restaurant geschlossen (keine Slots)

---

### 3. Week Availability Tests

#### ✅ Success Cases
- `GET /availability/week` - 7 Tage für Restaurant
- `GET /availability/week` - 7 Tage für Hair Salon

#### ❌ Error Cases
- Fehlende Parameter - 400

#### 🔍 Was wird getestet?
- Genau 7 Tage zurückgegeben
- Jeder Tag hat `date`, `day_of_week`, `time_slots`
- Slots korrekt über Woche verteilt

---

### 4. Availability Check Tests

#### ✅ Success Cases
- `POST /availability/check` - Valider Restaurant-Slot
- `POST /availability/check` - Valider Hair-Salon-Slot mit Staff

#### ❌ Error Cases
- Außerhalb Öffnungszeiten - Available: false
- Kapazität überschritten - Available: false, Reason: capacity
- Fehlende Felder - 400

#### 🔍 Was wird getestet?
- `available` Boolean vorhanden
- `reason` bei nicht-verfügbaren Slots
- Öffnungszeiten werden respektiert
- Kapazitäts-Limits funktionieren
- Past Dates werden abgelehnt

---

### 5. Validation Tests

#### ✅ Success Cases
- `POST /availability/validate` - Valide Restaurant-Buchung
- `POST /availability/validate` - Valide Hair-Salon-Buchung mit Staff

#### ❌ Error Cases
- Ungültiges Zeitformat (25:00) - 400, Fehler-Array
- End vor Start - 400, "after start time"
- Staff fehlt bei required Service - 400, "Staff member is required"
- Past Date - 400, "Cannot book in the past"

#### 🔍 Was wird getestet?
- `valid` Boolean
- `errors` Array leer bei Success
- Fehler-Nachrichten spezifisch und hilfreich
- Zeitformat-Validierung (HH:MM)
- Zeitlogik (End > Start)
- Staff-Requirement für Services

---

### 6. Service Details Tests

#### ✅ Success Cases
- `GET /availability/service/1?venueId=1` - Tisch für 2 Personen
- `GET /availability/service/4?venueId=2` - Herrenhaarschnitt

#### ❌ Error Cases
- Fehlende `venueId` - 400
- Service nicht gefunden - 404

#### 🔍 Was wird getestet?
- Service-ID, Name, Description
- `duration_minutes`, `price`, `capacity`
- `requires_staff` Flag korrekt
- Restaurant: requires_staff = false
- Hair Salon: requires_staff = true

---

### 7. Staff Capability Tests

#### ✅ Success Cases
- `GET /staff/1/can-perform/4` - Anna kann Herrenhaarschnitt (true)
- `GET /staff/1/can-perform/5` - Anna kann Damenhaarschnitt (true)
- `GET /staff/1/can-perform/6` - Anna kann Coloration (true)
- `GET /staff/2/can-perform/4` - Klaus kann Herrenhaarschnitt (true)

#### ❌ Negative Cases (Expected false)
- `GET /staff/2/can-perform/5` - Klaus kann NICHT Damenhaarschnitt (false)
- `GET /staff/2/can-perform/6` - Klaus kann NICHT Coloration (false)
- `GET /staff/999/can-perform/4` - Ungültiger Staff (false)
- `GET /staff/2/can-perform/999` - Ungültiger Service (false)

#### 🔍 Was wird getestet?
- Anna (ID 1) kann **alle 3 Services** (4, 5, 6)
- Klaus (ID 2) kann **nur Service 4** (Herrenhaarschnitt)
- Ungültige IDs geben `canPerform: false` zurück
- Keine 404-Fehler, sondern immer 200 mit Boolean

---

## 📊 Test Coverage

### Erwartete Coverage

Nach Ausführung von `npm run test:coverage`:

```
--------------------|---------|----------|---------|---------|
File                | % Stmts | % Branch | % Funcs | % Lines |
--------------------|---------|----------|---------|---------|
venue.routes.ts     |   100   |   100    |   100   |   100   |
venue.service.ts    |   95+   |   90+    |   100   |   95+   |
availability.routes |   100   |   100    |   100   |   100   |
availability.service|   90+   |   85+    |   95+   |   90+   |
--------------------|---------|----------|---------|---------|
```

### Coverage Report ansehen

```bash
npm run test:coverage
# Öffne: coverage/lcov-report/index.html
```

---

## 🗂️ Test-Daten (aus seed.sql)

### Venues

| ID | Name | Type | Öffnungszeiten |
|----|------|------|----------------|
| 1 | Bella Vista Restaurant | restaurant | Mo: 17:00-22:00<br>Di-So: 11:30-22:00 |
| 2 | Salon Schmidt | hair_salon | Di-Sa: 09:00-18:00 |

### Services (Restaurant - Venue 1)

| ID | Name | Duration | Capacity | Requires Staff |
|----|------|----------|----------|----------------|
| 1 | Tisch für 2 Personen | 120 Min | 2 | ❌ false |
| 2 | Tisch für 4 Personen | 120 Min | 4 | ❌ false |
| 3 | Großer Tisch (6-8) | 150 Min | 8 | ❌ false |

### Services (Hair Salon - Venue 2)

| ID | Name | Duration | Price | Requires Staff |
|----|------|----------|-------|----------------|
| 4 | Herrenhaarschnitt | 45 Min | €35 | ✅ true |
| 5 | Damenhaarschnitt | 90 Min | €55 | ✅ true |
| 6 | Coloration | 180 Min | €95 | ✅ true |

### Staff Members (Salon Schmidt)

| ID | Name | Services |
|----|------|----------|
| 1 | Anna Schmidt | 4, 5, 6 (alle) |
| 2 | Klaus Meyer | 4 (nur Herrenhaarschnitt) |

### Bestehende Bookings (aus seed.sql)

| Venue | Service | Date | Time | Party Size | Status |
|-------|---------|------|------|------------|--------|
| 1 | Tisch für 4 | Morgen | 19:00-21:00 | 4 | confirmed |
| 2 | Herrenhaarschnitt (Klaus) | Morgen | 10:00-10:45 | 1 | pending |

---

## 🐛 Troubleshooting

### Problem: Tests schlagen fehl mit "Connection refused"

**Lösung:**
```bash
# Prüfe, ob Server läuft
curl http://localhost:3000/health

# Falls nicht, starte den Server
npm run dev
```

### Problem: Boolean-Werte sind 0/1 statt true/false

**Erklärung:** MariaDB/MySQL gibt BOOLEAN-Felder als `0` und `1` zurück, nicht als `true`/`false`.

**Lösung:** Die Tests verwenden `.toBeTruthy()` und `.toBeFalsy()` statt `.toBe(true)` bzw `.toBe(false)`.

```typescript
// ❌ Falsch
expect(service.requires_staff).toBe(false); // Schlägt fehl wenn 0

// ✅ Richtig
expect(service.requires_staff).toBeFalsy(); // Akzeptiert 0 oder false
```

### Problem: DECIMAL-Werte sind Strings statt Numbers

**Erklärung:** MariaDB/MySQL gibt DECIMAL-Felder als Strings zurück (z.B. `"35.00"` statt `35`).

**Lösung:** Parse mit `parseFloat()` vor dem Vergleich.

```typescript
// ❌ Falsch
expect(service.price).toBe(35); // Schlägt fehl wenn "35.00"

// ✅ Richtig
expect(parseFloat(service.price)).toBe(35); // Konvertiert erst zu Number
```

### Problem: "Service not found" bei gültiger ID

**Lösung:**
```bash
# Prüfe Datenbank
sudo mariadb easyseatdb

# Zeige alle Services
SELECT id, name, venue_id, is_active FROM services;

# Re-seed falls nötig
SOURCE src/config/database/seed.sql;
```

### Problem: Jest findet Tests nicht

**Lösung:**
```bash
# Prüfe Dateistruktur
ls -la src/__tests__/

# Tests sollten im Ordner sein:
# - src/__tests__/setup.ts
# - src/__tests__/venue.routes.test.ts
# - src/__tests__/availability.routes.test.ts
```

### Problem: "tomorrow" Variable ist leer in Postman

**Lösung:**
- Die Variable wird im **Pre-request Script** gesetzt
- Stelle sicher, dass Pre-request Scripts aktiviert sind
- Alternativ: Manuell setzen in Environment:
  ```
  tomorrow: 2025-10-19 (YYYY-MM-DD)
  ```

### Problem: Newman gibt HTML-Fehler zurück

**Lösung:**
```bash
# Newman Reporter installieren
npm install -g newman-reporter-htmlextra

# Test erneut ausführen
newman run "Easyseat API Tests.postman_collection.json" \
  -e Easyseat.postman_environment.json \
  --reporters cli,htmlextra
```

### Problem: Tests sind langsam

**Lösung:**
```bash
# Nur geänderte Tests ausführen
npm run test:watch

# Parallel ausführen (vorsichtig mit DB-Connections!)
jest --maxWorkers=4

# Einzelne Test-Suite
npm run test:venues
```

---

## 📝 Test-Checkliste für neue Features

Wenn du neue Features hinzufügst, stelle sicher:

- [ ] **Unit Tests** für alle neuen Service-Methoden
- [ ] **Route Tests** für alle neuen Endpoints
- [ ] **Success Cases** getestet
- [ ] **Error Cases** getestet (400, 404, 500)
- [ ] **Validation** getestet (ungültige Inputs)
- [ ] **Edge Cases** getestet (Grenzwerte, leere Arrays, null)
- [ ] **Postman Collection** aktualisiert
- [ ] **Documentation** aktualisiert (API Docs)
- [ ] **Coverage** über 80% für neue Dateien

---

## 🎨 Best Practices

### 1. Test-Naming Convention

```typescript
describe('Service/Route Name', () => {
  describe('Method/Endpoint', () => {
    it('should [expected behavior]', async () => {
      // Test
    });
  });
});
```

**Beispiel:**
```typescript
describe('Venue Routes', () => {
  describe('GET /venues/:id', () => {
    it('should return venue details for valid ID', async () => {
      // ...
    });
  });
});
```

### 2. Arrange-Act-Assert Pattern

```typescript
it('should validate booking request', async () => {
  // Arrange
  const bookingData = { venueId: 1, serviceId: 1, ... };
  
  // Act
  const response = await request(app)
    .post('/availability/validate')
    .send(bookingData);
  
  // Assert
  expect(response.status).toBe(200);
  expect(response.body.data.valid).toBe(true);
});
```

### 3. Verwende Helper-Funktionen

```typescript
// Helper für Datum-Generierung
const getTomorrowDate = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};

// Im Test verwenden
it('should accept future dates', async () => {
  const date = getTomorrowDate();
  // ...
});
```

### 4. Cleanup nach Tests

```typescript
afterEach(async () => {
  // Bereinige Test-Daten
  // z.B. Lösche Test-Bookings
});

afterAll(async () => {
  // Schließe DB-Connections
  await pool.end();
});
```

---

## 📚 Weitere Ressourcen

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest GitHub](https://github.com/ladjs/supertest)
- [Postman Learning Center](https://learning.postman.com/)
- [Newman Documentation](https://learning.postman.com/docs/running-collections/using-newman-cli/)

---

## ✅ Quick Test Commands

```bash
# Alles testen
npm test

# Nur ein Test-File
npm test venue.routes.test.ts

# Mit Coverage
npm run test:coverage

# Watch Mode (während Entwicklung)
npm run test:watch

# Postman via Newman
newman run "Easyseat API Tests.postman_collection.json" -e Easyseat.postman_environment.json
```

---

## 🚀 CI/CD Integration

### GitHub Actions Beispiel

```yaml
name: Backend Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      mariadb:
        image: mariadb:latest
        env:
          MYSQL_ROOT_PASSWORD: root
          MYSQL_DATABASE: easyseatdb
          MYSQL_USER: dev
          MYSQL_PASSWORD: devpw
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd backend
          npm install
      
      - name: Run tests
        run: |
          cd backend
          npm test
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./backend/coverage/lcov.info
```

---

## 💡 Pro-Tipps

1. **Teste immer Edge Cases**: 0, -1, null, undefined, sehr große Zahlen
2. **Teste asynchrone Operationen**: Verwende async/await korrekt
3. **Isoliere Tests**: Jeder Test sollte unabhängig laufen
4. **Verwende Mocks sparsam**: Teste gegen echte DB (mit seed)
5. **Coverage ist kein Ziel**: 100% Coverage ≠ Bug-frei
6. **Schreibe lesbare Tests**: Tests sind Dokumentation
7. **Teste das Verhalten, nicht die Implementierung**

---

**Happy Testing! 🎉**