# easyseat – Projekt-Dokumentation

Konsolidierte Übersicht: Buchungs- und Statuslogik, Suchlogik, Audit, Code-Review-Stand.  
Deployment und Produktions-Checkliste siehe **DEPLOYMENT.md** im Projektroot.

---

## 1. Status & Buchungslogik

### 1.1 Wer darf was?

| Aktion | Owner/Staff (Dashboard) | Kunde (Manage-Link) |
|--------|--------------------------|----------------------|
| Status **pending** / **confirmed** / **completed** / **no_show** | ✅ (Dashboard) | ❌ |
| Status **cancelled** | ✅ (jederzeit) | ✅ nur Stornierung, mit Frist |
| Buchung bearbeiten (Datum, Zeit, etc.) | ❌ | ✅ PATCH /bookings/manage/:token |

- **Route Status-Änderung:** `PATCH /dashboard/bookings/:id/status` (DashboardService).
- **Stornierung Kunde:** `POST /bookings/manage/:token/cancel` (BookingService.cancelBooking), Frist aus `venue.cancellation_hours`.

### 1.2 Vergangene Buchungen (umgesetzt)

Für Buchungen mit Termin in der Vergangenheit (`booking_date` + `end_time` < jetzt):

- **Erlaubt:** Status setzen auf **completed**, **no_show**, **cancelled** (Nachpflege, Korrekturen).
- **Nicht erlaubt:** Status setzen auf **pending** oder **confirmed**.

Typische Fälle: „Bestätigung vergessen, Kunde kam trotzdem“ → **completed**; No-Show nachtragen → **no_show**; Stornierung per Telefon nachtragen → **cancelled**.

### 1.3 Zukünftige Termine: Abgeschlossen / No-Show (umgesetzt)

Für Buchungen mit Termin in der Zukunft (`booking_date` + `end_time` > jetzt):

- **Nicht erlaubt:** Status setzen auf **completed** oder **no_show** (erst nach Terminende).
- **Erlaubt:** **pending**, **confirmed**, **cancelled** wie gewohnt.

Umsetzung: Backend-Validierung in `DashboardService.updateBookingStatus`; Frontend deaktiviert die Optionen „Abgeschlossen“ und „Nicht erschienen“ für zukünftige Termine.

### 1.4 Audit-Log (umgesetzt)

- **Tabelle:** `booking_audit_log` (im Schema: `backend/src/config/database/schema.sql`).
- **Service:** `audit.service.ts` – `logBookingAction()`.
- **Einträge bei:** Statusänderung im Dashboard (Owner/Staff), Stornierung über Manage-Link, Änderung Buchungsdetails über Manage-Link. Kein Token, kein request_meta (DSGVO-freundlich).

### 1.5 confirmation_sent_at (E-Mail-Service)

- **Semantik:** `confirmation_sent_at` = Zeitpunkt, an dem die **Bestätigungs-E-Mail** versendet wurde (nicht „wann Status auf confirmed gesetzt“).
- **Wer setzt es:** Ausschließlich der E-Mail-Service (`email.service.ts`) nach erfolgreichem Versand.
- **Vorteil:** Einheitlich für Erstbestätigung und Reaktivierung (cancelled → confirmed); ohne SMTP-Konfiguration bleibt das Feld NULL, E-Mails werden nur geloggt.

### 1.6 Wann wird eine E-Mail an den Kunden gesendet? (umgesetzt)

**Grundsatz:** Nicht bei jeder Statusänderung, sondern nur wenn der Kunde **konkret informiert werden muss**. Sonst entsteht E-Mail-Lärm (z. B. bei „Abgeschlossen“ oder „Nicht erschienen“ oft unnötig).

| Anlass / Statuswechsel | E-Mail? | Inhalt / Typ |
|------------------------|--------|--------------|
| **Buchung erstellt** (Status pending) | ✅ Ja | **Buchung eingegangen** – „Vielen Dank für Ihre Buchung. Wir prüfen sie und bestätigen in Kürze.“ |
| **→ confirmed** (von pending oder von cancelled) | ✅ Ja | **Bestätigung** – „Ihre Buchung ist bestätigt …“ (inkl. Reaktivierung: „Ihre Buchung ist wieder gültig …“). |
| **→ cancelled** | ✅ Ja | **Stornierung** – „Ihre Buchung wurde storniert.“ (egal ob durch Staff oder Kunde selbst). |
| **→ completed** | ❌ Nein (oder optional) | Kunde war da; optional: Danke-/Feedback-Mail. |
| **→ no_show** | ❌ Nein (oder optional) | „Termin verpasst“ – je nach Geschäftspolitik, oft unterlassen. |
| **→ pending** | ❌ Nein | Nur interner Zustand (z. B. nach Reaktivierung auf „ausstehend“); Kunde braucht keinen Mail. |

**Erinnerung (zeitgesteuert):** Cron-Job alle 15 Min (`jobs/reminder.job.ts`): Erinnerungs-Mail z. B. 24 h vor Termin (konfigurierbar `REMINDER_HOURS`), nur für Buchungen mit Status `confirmed`, `reminder_sent_at` wird nach Versand gesetzt.

**Fazit:** E-Mail-Versand bei **Buchungserstellung** (pending), bei **confirmed** (Bestätigung, inkl. Reaktivierung), bei **cancelled** (Stornierung) sowie Erinnerung zeitgesteuert.

### 1.7 E-Mail-Versand ohne eigenen SMTP-Server (umgesetzt)

- **Technik:** Nodemailer mit konfigurierbarem SMTP. Wenn `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS` nicht gesetzt sind, werden E-Mails nur geloggt (z. B. lokale Entwicklung).
- **Brevo (empfohlen):** `SMTP_HOST=smtp-relay.brevo.com`, `SMTP_PORT=587`, `SMTP_USER` = Brevo-Login-E-Mail, `SMTP_PASS` = SMTP-Schlüssel (unter E-Mail → SMTP & API → SMTP, nicht der API-Key). Kostenloses Kontingent z. B. 300 E-Mails/Tag.
- **Umgebungsvariablen:** `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, optional `SMTP_SECURE`, `MAIL_FROM`, `PUBLIC_APP_URL` (für Manage-Link in Mails), `REMINDER_HOURS`.

---

## 2. Suchlogik (Stand)

- **Hero-Suche:** Typ, Datum, Uhrzeit, Gäste → Parameter werden an Venue-Liste und Buchungs-Widget übergeben.
- **Venues-Liste:** `GET /venues` kann mit `date`, `party_size`, `time` gefiltert werden → nur Venues mit mindestens einem freien Slot (optional Zeitfenster ±1h).
- **Slots:** `GET /availability/slots` unterstützt `partySize`; bei Restaurants werden nur Slots mit `remaining_capacity >= partySize` zurückgegeben; optional `timeWindowStart`/`timeWindowEnd`.
- **Personenanzahl:** Im Hero nur bei Kategorie „Restaurant“ oder „Alle“ sichtbar; bei Friseur/Kosmetik etc. wird 1 verwendet.

---

## 3. Code-Review (White-Box) – Stand

Alle im White-Box-Report genannten Punkte sind umgesetzt (API-Proxy Query-Parameter, DELETE /bookings/:id mit Auth, Tippfehler, Types business_id → venue_id, Zahl-Validierung Admin-Routen, requireVenueAccess/NaN, etc.).  
Einzige Ausnahme: **Owner ohne venueId** erhält 403 – bewusste Design-Entscheidung (ein Admin = ein Venue). Details siehe **WHITEBOX-ANALYSIS.md**.

---

## 4. Noch offen / optional

| Thema | Wo | Priorität |
|-------|-----|-----------|
| Venue-Timezone für „vergangene Buchung“ (aktuell Server-Zeit) | Backend | Nur bei Multi-Zeitzonen nötig |

---

Die Einzelanalysen (Status/Audit, Suchlogik, Whitebox) liegen weiterhin in **docs/** zur Referenz; diese Datei ist die konsolidierte Stand-Übersicht.
