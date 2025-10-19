# EasySeat - TODO Liste

## 🔥 Sofortige TODOs

- [ ] Sobald SMTP ready ist, bei booking.service.ts unter confirmBooking eine Mail senden

---

## 🚀 Feature Enhancements (Post-MVP)

### 🔐 Booking Authentication & Security

#### 1. Token-basierte Buchungs-Authentifizierung
**Priorität:** Medium | **Aufwand:** 3-4 Tage

**Problem:**  
Aktuell erfolgt die Verifizierung von Buchungs-Änderungen ausschließlich über Email-Abgleich. Dies führt zu folgenden Einschränkungen:
- Kunden mit falsch eingegebener Email können ihre Buchung nicht mehr ändern
- Keine Möglichkeit zur Wiederherstellung bei Tippfehlern
- Email ist zwingend erforderlich (schwierig bei Walk-Ins oder Telefon-Buchungen)

**Lösung:**  
Implementiere ein **Token-basiertes System** für Buchungsverwaltung:

```typescript
// Neue Spalte in bookings table
ALTER TABLE bookings ADD COLUMN booking_token VARCHAR(36) UNIQUE NOT NULL;

// Bei Buchungserstellung
const bookingToken = crypto.randomUUID(); // z.B. "a1b2c3d4-..."

// Booking-Link in Bestätigungs-Email
https://easyseat.de/booking/manage/a1b2c3d4-...
```

**Vorteile:**
- ✅ Email wird nur für Benachrichtigungen verwendet
- ✅ Token ist der "Schlüssel" zur Buchung (wie Ticket-Nummer)
- ✅ Kunden können Link bookmarken oder weiterleiten
- ✅ Funktioniert auch ohne Email (QR-Code für Walk-Ins)
- ✅ Bessere UX: Ein Klick zum Ändern/Stornieren

**Implementierungsschritte:**

1. **Database Migration**
   ```sql
   ALTER TABLE bookings 
   ADD COLUMN booking_token VARCHAR(36) UNIQUE NOT NULL AFTER id,
   ADD INDEX idx_booking_token (booking_token);
   ```

2. **Service Layer Updates**
   ```typescript
   // booking.service.ts
   static async createBooking(data: CreateBookingData): Promise<Booking> {
     const bookingToken = crypto.randomUUID();
     
     const [result] = await pool.execute(
       `INSERT INTO bookings (..., booking_token) VALUES (..., ?)`,
       [...values, bookingToken]
     );
     
     // Email mit Link senden
     await EmailService.sendBookingConfirmation(
       data.customer_email,
       `${config.frontendUrl}/booking/manage/${bookingToken}`
     );
     
     return booking;
   }
   
   // Neue Methode für Token-basierte Verifizierung
   static async getBookingByToken(token: string): Promise<Booking | null> {
     // ...
   }
   
   static async updateBookingByToken(
     token: string, 
     updates: UpdateBookingData
   ): Promise<Booking> {
     // Kein Email-Check mehr nötig!
   }
   ```

3. **Route Updates**
   ```typescript
   // booking.routes.ts
   
   // Neue Route: Token-basierter Zugriff
   router.get('/manage/:token', async (req, res) => {
     const { token } = req.params;
     const booking = await BookingService.getBookingByToken(token);
     // ...
   });
   
   // Neue Route: Update via Token
   router.patch('/manage/:token', async (req, res) => {
     const { token } = req.params;
     const updates = req.body;
     const updated = await BookingService.updateBookingByToken(token, updates);
     // ...
   });
   
   // Alte Email-basierte Routes als Fallback behalten
   ```

4. **Frontend Integration**
   - Booking-Bestätigung zeigt shareable Link
   - QR-Code mit Token für Print-Bestätigungen
   - "Manage Booking" Landing Page mit Token in URL

**Backward Compatibility:**
- Email-basierte Authentifizierung **bleibt erhalten** als Fallback
- Alte Bookings ohne Token funktionieren weiterhin
- Migration Script für bestehende Bookings:
  ```sql
  UPDATE bookings 
  SET booking_token = UUID() 
  WHERE booking_token IS NULL;
  ```

**Security Considerations:**
- Token als **unguessable UUID v4** (128-bit random)
- Rate Limiting auf Token-basierten Endpoints
- Optional: Token-Ablauf nach X Monaten (für alte Buchungen)
- Log failed token access attempts

**Testing Checklist:**
- [ ] Unit Tests für Token-Generierung
- [ ] Integration Tests für Token-basierte CRUD
- [ ] Email-Template mit Token-Link
- [ ] Frontend: Token-URL-Parsing
- [ ] Security: Token-Bruteforce-Test
- [ ] Performance: Index auf booking_token

**Effort Breakdown:**
- Database Migration: 1h
- Service Layer: 4h
- Routes & Validation: 3h
- Frontend Integration: 6h
- Testing: 4h
- Documentation: 2h
- **Total: ~20h / 3 Arbeitstage**

---

#### 2. Hard Delete Policy & GDPR Compliance
**Priorität:** Low | **Aufwand:** 2-3 Stunden

**Problem:**  
Aktuell erlaubt `deleteBooking()` ein bedingungsloses Hard Delete. Dies kann problematisch sein für:
- Accounting/Audit-Trails
- Analytics (deleted bookings = lost data)
- Versehentliches Löschen

**Lösung:**  
Implementiere eine **Policy-basierte Delete-Strategie**:

```typescript
// In booking.service.ts
enum DeleteReason {
  GDPR_REQUEST = 'gdpr',
  ADMIN_CLEANUP = 'admin_cleanup',
  SPAM = 'spam',
  DUPLICATE = 'duplicate'
}

static async deleteBooking(
  bookingId: number,
  reason: DeleteReason,
  deletedBy?: string // User-ID oder 'system'
): Promise<void> {
  // Audit-Log vor dem Löschen
  await AuditService.logDeletion({
    entity: 'booking',
    entityId: bookingId,
    reason,
    deletedBy,
    timestamp: new Date()
  });
  
  // Nur bei GDPR tatsächlich löschen
  if (reason === DeleteReason.GDPR_REQUEST) {
    await pool.execute('DELETE FROM bookings WHERE id = ?', [bookingId]);
  } else {
    // Soft Delete für alle anderen Fälle
    await pool.execute(
      'UPDATE bookings SET status = "deleted", deleted_at = NOW() WHERE id = ?',
      [bookingId]
    );
  }
}
```

**Implementierungsschritte:**
1. Neue Spalten: `deleted_at TIMESTAMP NULL`, `deletion_reason VARCHAR(50)`
2. Audit-Log-Tabelle erstellen
3. Route-Update: `DELETE /bookings/:id?reason=...`
4. CRON-Job für automatische Bereinigung nach X Jahren

---

## 📧 Email & Notifications

- [ ] SMTP-Integration (Nodemailer)
- [ ] Email-Templates (Handlebars/EJS)
  - [ ] Booking Confirmation
  - [ ] Booking Reminder (24h vorher)
  - [ ] Booking Update
  - [ ] Cancellation Confirmation
- [ ] SMS-Integration (optional, Twilio)
- [ ] Push-Notifications (optional, Firebase)

---

## 🔍 Analytics & Reporting

- [ ] Admin-Dashboard
  - [ ] Booking-Statistiken (Tages-/Wochen-/Monatsansicht)
  - [ ] Revenue-Tracking
  - [ ] No-Show-Rate
  - [ ] Beliebste Zeitslots
- [ ] Export-Funktionalität (CSV, PDF)

---

## 🌐 Internationalization (i18n)

- [ ] Multi-Language-Support
- [ ] Zeitzone-Handling (momentjs/date-fns-tz)
- [ ] Währungs-Lokalisierung

---

## 🧪 Testing & Quality

- [ ] E2E-Tests (Playwright/Cypress)
- [ ] Load Testing (k6/Artillery)
- [ ] Security Audit (OWASP Top 10)
- [ ] Accessibility Testing (a11y)

---

## 📱 Mobile

- [ ] Progressive Web App (PWA)
- [ ] Native App (React Native)
- [ ] Mobile-optimierte Booking-Flows

---

## 🔌 Integrations

- [ ] Google Calendar Sync
- [ ] Outlook Calendar Sync
- [ ] Stripe Payment Integration
- [ ] PayPal Integration
- [ ] Zapier Integration

---

## 🛠️ DevOps

- [ ] CI/CD Pipeline (GitHub Actions)
- [ ] Docker Containerization
- [ ] Kubernetes Deployment
- [ ] Monitoring (Prometheus/Grafana)
- [ ] Log Aggregation (ELK Stack)
- [ ] Backup Strategy

---

## 📝 Notizen

### Completed
✅ Venue Service & Routes  
✅ Service CRUD  
✅ Availability Service & Routes  
✅ Booking Service & Routes  
✅ Basic Jest Setup  

### In Progress
🔄 Email Integration (waiting for SMTP)

### Blocked
⛔️ Nichts aktuell

---

**Last Updated:** [Datum einfügen bei Änderungen]