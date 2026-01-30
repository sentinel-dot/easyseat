# Implementierung: Mindestvorlaufzeit für Buchungen (booking_advance_hours)

## Problem

Kunden konnten Termine zu kurzfristig buchen (z.B. in 5 Stunden), die sie dann aufgrund der Stornierungsfrist nicht mehr stornieren konnten.

## Lösung

**Ansatz 1 + Admin-Bypass**: Kunden müssen mindestens X Stunden im Voraus buchen, ABER Admins können im Dashboard auch kurzfristige Termine manuell anlegen (für Walk-ins, Familie, Notfälle).

## Implementierte Änderungen

### 1. Database Migration

**Datei**: `backend/src/config/database/add_booking_advance_hours.sql`

```sql
ALTER TABLE venues 
ADD COLUMN booking_advance_hours INT DEFAULT 48 
COMMENT 'Minimum hours in advance customers must book (admins can bypass)';
```

- Neues Feld `booking_advance_hours` mit Standard: **48 Stunden**
- Separat von `cancellation_hours` (24h)

### 2. Backend - Types

**Datei**: `backend/src/config/utils/types.ts`

```typescript
export interface Venue {
    // ...
    booking_advance_hours: number;  // Neu
    cancellation_hours: number;
    // ...
}
```

### 3. Backend - Validation Logic

**Datei**: `backend/src/services/availability.service.ts`

#### A) `validateBookingRequest()` - Erweitert um Vorlaufzeit-Check

```typescript
static async validateBookingRequest(
    // ... existing params
    bypassAdvanceCheck?: boolean    // NEU: Für Admin-Buchungen
): Promise<{ valid: boolean; errors: string[] }>
```

- Lädt `booking_advance_hours` aus Venue
- Berechnet Stunden bis zum Termin
- Prüft: `hoursUntilBooking >= booking_advance_hours`
- **Wichtig**: Check wird übersprungen wenn `bypassAdvanceCheck = true`

#### B) `getAvailableSlots()` - Filtert zu nahe Slots

```typescript
// Filter Slots basierend auf Mindestvorlaufzeit
const now = new Date();
uniqueSlots = uniqueSlots.filter(slot => {
    const slotDateTime = new Date(date + ' ' + slot.start_time);
    const hoursUntilSlot = (slotDateTime - now) / (1000 * 60 * 60);
    return hoursUntilSlot >= bookingAdvanceHours;
});
```

- Verhindert, dass zu nahe Slots im Frontend angezeigt werden
- Arbeitet zusätzlich zur Validierung (Defense in Depth)

### 4. Backend - Service Updates

**Datei**: `backend/src/services/booking.service.ts`

```typescript
static async createBooking(
    bookingData: CreateBookingData, 
    bypassAdvanceCheck: boolean = false  // NEU
): Promise<Booking>
```

- Parameter wird an `validateBookingRequest()` weitergereicht

**Datei**: `backend/src/services/venue.service.ts`

- Alle Venue-Queries enthalten jetzt `booking_advance_hours`

### 5. Backend - Admin Routes

**Datei**: `backend/src/routes/admin.routes.ts`

#### A) POST `/admin/bookings` - Manuelle Buchung erstellen

```typescript
router.post('/admin/bookings', async (req, res) => {
    // ...
    const booking = await BookingService.createBooking(bookingData, true);
    //                                                             ^^^^ bypass = true
});
```

#### B) GET `/admin/venue/settings` - Settings abrufen

```typescript
router.get('/admin/venue/settings', async (req, res) => {
    const venue = await VenueService.getVenueById(venueId);
    // Enthält booking_advance_hours & cancellation_hours
});
```

#### C) PATCH `/admin/venue/settings` - Settings bearbeiten

```typescript
router.patch('/admin/venue/settings', async (req, res) => {
    const { booking_advance_hours, cancellation_hours } = req.body;
    await AdminService.updateVenueSettings(venueId, { 
        booking_advance_hours, 
        cancellation_hours 
    });
});
```

**Datei**: `backend/src/services/admin.service.ts`

```typescript
static async updateVenueSettings(
    venueId: number,
    updates: {
        booking_advance_hours?: number;
        cancellation_hours?: number;
    }
): Promise<void>
```

### 6. Frontend - Types

**Datei**: `frontend/lib/types/index.ts`

```typescript
export interface Venue {
    // ...
    booking_advance_hours: number;  // Neu
    cancellation_hours: number;
    // ...
}
```

### 7. Frontend - API Client

**Datei**: `frontend/lib/api/admin.ts`

#### A) Manuelle Buchung erstellen

```typescript
export async function createManualBooking(
    bookingData: Omit<CreateBookingData, 'venue_id'>
): Promise<{ success: boolean; data?: Booking; message?: string }>
```

#### B) Venue Settings

```typescript
export async function getVenueSettings(): Promise<...>
export async function updateVenueSettings(updates: {
    booking_advance_hours?: number;
    cancellation_hours?: number;
}): Promise<...>
```

### 8. Frontend - Admin UI

**Datei**: `frontend/app/admin/settings/page.tsx` (NEU)

- Bearbeitbare Felder für `booking_advance_hours` und `cancellation_hours`
- Live-Validierung (nur positive Zahlen)
- Info-Box mit empfohlenen Werten
- Beispiel-Szenarien zur Veranschaulichung

**Datei**: `frontend/app/admin/layout.tsx`

- Neuer Menüpunkt "Einstellungen" mit Zahnrad-Icon

## Datenfluss

### Kunde bucht Termin (Standard-Flow)

1. **Frontend**: Kunde wählt Datum/Zeit im Kalender
2. **Backend**: `getAvailableSlots()` filtert Slots < 48h raus
3. **Frontend**: Nur verfügbare Slots werden angezeigt
4. **Backend**: `validateBookingRequest()` prüft nochmal (bypassAdvanceCheck = false)
5. **Erfolg**: Buchung wird erstellt

### Admin erstellt manuelle Buchung

1. **Frontend**: Admin wählt Datum/Zeit im Dashboard
2. **Backend**: `POST /admin/bookings` mit `bypassAdvanceCheck = true`
3. **Backend**: `validateBookingRequest()` überspringt Vorlaufzeit-Check
4. **Erfolg**: Auch kurzfristige Termine möglich

### Admin ändert Einstellungen

1. **Frontend**: `/admin/settings` - Werte ändern
2. **Backend**: `PATCH /admin/venue/settings`
3. **Backend**: `AdminService.updateVenueSettings()` updated DB
4. **Erfolg**: Neue Werte gelten sofort für alle Buchungen

## Testing

### Manuelle Tests

1. **Standard-Buchung**:
   ```bash
   # Sollte fehlschlagen (< 48h)
   POST /bookings
   { "booking_date": "2026-02-01", "start_time": "10:00", ... }
   
   # Sollte klappen (> 48h)
   POST /bookings
   { "booking_date": "2026-02-05", "start_time": "10:00", ... }
   ```

2. **Admin-Buchung**:
   ```bash
   # Sollte auch für heute klappen
   POST /admin/bookings
   { "booking_date": "2026-01-30", "start_time": "15:00", ... }
   ```

3. **Settings ändern**:
   ```bash
   PATCH /admin/venue/settings
   { "booking_advance_hours": 24, "cancellation_hours": 12 }
   ```

### Database Verification

```sql
-- Check migration
DESCRIBE venues;
-- Sollte booking_advance_hours zeigen (default: 48)

-- Check current values
SELECT id, name, booking_advance_hours, cancellation_hours 
FROM venues;
```

## Vorteile dieser Lösung

✅ **Kunden**: Können immer stornieren, wenn sie buchen konnten (kein Frust)  
✅ **Owner**: Maximale Kontrolle über Buchungsrichtlinien  
✅ **Flexibilität**: Admin kann trotzdem kurzfristige Termine vergeben  
✅ **Klarheit**: Kunden sehen von Anfang an nur buchbare Slots  
✅ **Defense in Depth**: Validierung sowohl Frontend (Slot-Filter) als auch Backend

## Empfohlene Werte

| Szenario | booking_advance_hours | cancellation_hours |
|----------|----------------------|-------------------|
| Restaurant | 24-48h | 24h |
| Friseur | 48-72h | 24h |
| Massage | 24-48h | 12h |

**Faustregel**: `booking_advance_hours >= cancellation_hours`

So kann der Kunde seinen Termin immer noch stornieren, wenn die Buchung möglich war.

## Migration durchführen

```bash
cd backend
mysql -u dev -pdevpw easyseatdb < src/config/database/add_booking_advance_hours.sql
```

## Status

✅ Database Migration ausgeführt  
✅ Backend Types aktualisiert  
✅ Validation Logic implementiert  
✅ Admin Routes erstellt  
✅ Frontend API Client erweitert  
✅ Admin UI erstellt (/admin/settings)  
✅ Navigation erweitert  

**Bereit für Testing!**
