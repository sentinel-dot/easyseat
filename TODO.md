# EasySeat - TODO Liste

## 🔥 Sofortige TODOs

- [ ] Sobald SMTP ready ist, bei booking.service.ts unter confirmBooking eine Mail senden

---

## 🚀 Feature Enhancements (Post-MVP)

### 🔐 Booking Authentication & Security

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