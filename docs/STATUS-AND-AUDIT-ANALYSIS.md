# Status-Änderungslogik & Audit-Log – Analyse

## 1. Übersicht: Wer darf was?

| Aktion | Admin | User (Manage-Seite) |
|--------|--------|----------------------|
| Status auf **pending** setzen | ✅ (beliebig) | ❌ |
| Status auf **confirmed** setzen | ✅ | ❌ |
| Status auf **cancelled** setzen | ✅ (jederzeit, ohne Frist) | ✅ nur Stornierung, mit Frist |
| Status auf **completed** setzen | ✅ | ❌ |
| Status auf **no_show** setzen | ✅ | ❌ |
| Buchung **bearbeiten** (Datum, Zeit, etc.) | ❌ (nur über anderes UI?) | ✅ PATCH /manage/:token |

---

## 2. Admin-Seite: Status-Änderung

### Ablauf
- **Route:** `PATCH /admin/bookings/:id/status`
- **Service:** `AdminService.updateBookingStatus(bookingId, status, reason?)`
- **UI:** Buchungsliste (Quick-Buttons: Bestätigen, Ablehnen, Abgeschlossen, Stornieren) + **BookingDetailModal** mit Dropdown für alle 5 Status.

### Logik (Backend)
- Buchung muss existieren.
- Erlaubte Status: `pending`, `confirmed`, `cancelled`, `completed`, `no_show`.
- Bei `cancelled`: `cancelled_at = NOW()`, `cancellation_reason = reason`.
- Bei `confirmed`: `confirmation_sent_at = NOW()`.

### Bewertung
- **Stärken:** Einfach, flexibel, Admin hat volle Kontrolle.
- **Schwächen:**
  1. **Keine Übergangsregeln:** Im Modal kann z.B. von `cancelled` direkt auf `confirmed` gewechselt werden. Ob das gewollt ist („Reaktivierung“), sollte bewusst entschieden werden.
  2. **Alte Stornierungsfelder:** Bei Wechsel `cancelled` → `confirmed` bleiben `cancelled_at` und `cancellation_reason` in der DB stehen – semantisch etwas unsauber (optional bereinigen).
  3. **Kein Audit:** Es wird nicht gespeichert, **wer** (welcher Admin) **wann** den Status geändert hat – nur Application-Logs.

---

## 3. User-Seite: Manage-Buchung (Stornierung)

### Ablauf
- **Route:** `POST /bookings/manage/:token/cancel`
- **Service:** `BookingService.cancelBooking(token, reason?, bypassPolicy?)`
- **UI:** `ManageBookingActions` – nur Button „Buchung stornieren“ (wenn `pending` oder `confirmed`).

### Logik (Backend)
1. Buchung per Token laden (inkl. `venue.cancellation_hours`).
2. Bereits `cancelled` → Fehler.
3. Bereits `completed` → Fehler.
4. **Stornierungsfrist:** Wenn `!bypassPolicy`: Stornierung nur erlaubt, wenn mindestens `cancellation_hours` Stunden bis zum Termin verbleiben.
5. UPDATE: `status = 'cancelled'`, `cancelled_at = NOW()`, `cancellation_reason = reason`.

### Bewertung
- **Stärken:**
  - Klar begrenzt: User kann **nur** stornieren, keine anderen Status.
  - Frist wird sauber geprüft (`cancellation_hours` aus Venue).
  - Token-basiert, keine Login-Pflicht.
- **Schwächen:**
  - Kein Audit: „User hat über Manage-Link storniert“ wird nirgends dauerhaft festgehalten (nur in Logs).

---

## 4. Ist ein AUDIT_LOG nötig?

### Ja, sinnvoll für:
- **Nachvollziehbarkeit:** Wer hat wann welche Buchung auf welchen Status geändert (Admin vs. User)?
- **Support/Recht:** Bei Streit („Ich habe nie storniert“) oder DSGVO-Anfragen.
- **Analysen:** Wie oft stornieren Kunden selbst vs. Admin? Welche Admins ändern am meisten?

### Wo aktuell nur Logs:
- Admin: `logger.info('Admin: Booking X status updated to Y')` – aber ohne Admin-User-ID, nur in Log-Dateien.
- User-Stornierung: `logger.info('Booking cancelled successfully', { booking_id })` – kein dauerhafter Eintrag in der DB.

### Empfehlung: **AUDIT_LOG in der Datenbank**

Eine dedizierte Tabelle ist besser als nur Logs, weil:
- Durchsuchbar und filterbar (z.B. „alle Änderungen an Buchung 123“).
- Unabhängig von Log-Rotation und Server-Wechsel.
- Kann später für ein kleines „Aktivitätsverlauf“ im Admin-UI genutzt werden.

---

## 5. Vorschlag: Tabelle `booking_audit_log`

```sql
CREATE TABLE booking_audit_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  venue_id INT NOT NULL,

  -- Was wurde geändert
  action VARCHAR(50) NOT NULL,           -- z.B. 'status_change', 'cancel', 'update'
  old_status VARCHAR(20),                -- vorher (bei Status-Änderung)
  new_status VARCHAR(20),                 -- nachher
  cancellation_reason VARCHAR(255),     -- falls bei Stornierung gesetzt

  -- Wer / Wie
  actor_type ENUM('admin', 'customer', 'system') NOT NULL,
  admin_user_id INT NULL,                -- wenn actor_type = 'admin'
  customer_identifier VARCHAR(255) NULL, -- z.B. IP oder "manage_token" (ohne Token speichern!)
  request_meta JSON NULL,                -- optional: User-Agent, IP (vorsichtig mit DSGVO)

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE CASCADE,
  FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE SET NULL,
  INDEX idx_booking (booking_id),
  INDEX idx_venue_created (venue_id, created_at)
);
```

### Wann eintragen?
- **Admin:** Bei `AdminService.updateBookingStatus`: einen Eintrag mit `actor_type = 'admin'`, `admin_user_id = req.user.id` (sobald Admin-Auth die User-ID liefert), `old_status` / `new_status`.
- **User:** Bei `BookingService.cancelBooking` (token-basiert): einen Eintrag mit `actor_type = 'customer'`, `admin_user_id = NULL`, `customer_identifier = 'manage_link'` (kein Token speichern).

Optional später: auch bei PATCH `/bookings/manage/:token` (Datum/Zeit-Änderung) einen Eintrag `action = 'update'` ohne Status-Änderung.

---

## 6. Kurzfassung

| Thema | Stand | Empfehlung |
|-------|--------|------------|
| **Admin-Status-Logik** | Flexibel, keine Übergangsregeln | Optional: Übergangsregeln oder Hinweis im UI bei „Reaktivierung“; bei cancelled→nicht-cancelled evtl. `cancelled_at`/`cancellation_reason` zurücksetzen. |
| **User-Stornierung** | Klar, mit Frist, nur Stornierung | Logik beibehalten; evtl. Fehlermeldung bei Frist-Überschreitung noch nutzerfreundlicher (z.B. „Bitte rufen Sie uns an“). |
| **Audit** | Nur Application-Logs | **AUDIT_LOG-Tabelle** einführen; bei jeder Status-Änderung (Admin + User) einen Eintrag schreiben; später im Admin „Verlauf“ anzeigen. |

Wenn du möchtest, können wir als Nächstes konkret die Migration für `booking_audit_log` und die Einträge in `AdminService.updateBookingStatus` sowie `BookingService.cancelBooking` ausarbeiten.
