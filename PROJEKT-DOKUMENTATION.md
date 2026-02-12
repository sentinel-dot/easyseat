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

### 1.3 Audit-Log (umgesetzt)

- **Tabelle:** `booking_audit_log` (im Schema: `backend/src/config/database/schema.sql`).
- **Service:** `audit.service.ts` – `logBookingAction()`.
- **Einträge bei:** Statusänderung im Dashboard (Owner/Staff), Stornierung über Manage-Link, Änderung Buchungsdetails über Manage-Link. Kein Token, kein request_meta (DSGVO-freundlich).

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
| Übergangsregeln Status (z. B. cancelled → confirmed) | Dashboard | Optional; evtl. Hinweis im UI |
| Bei Reaktivierung cancelled → nicht-cancelled: `cancelled_at`/`cancellation_reason` zurücksetzen | Backend | Optional |
| Stornierungsfrist überschritten: nutzerfreundlichere Meldung (z. B. „Bitte rufen Sie uns an“) | BookingService | Optional |
| Admin-UI „Verlauf“ pro Buchung (Anzeige aus `booking_audit_log`) | Frontend | Später |
| Venue-Timezone für „vergangene Buchung“ (aktuell Server-Zeit) | Backend | Nur bei Multi-Zeitzonen nötig |

---

Die Einzelanalysen (Status/Audit, Suchlogik, Whitebox) liegen weiterhin in **docs/** zur Referenz; diese Datei ist die konsolidierte Stand-Übersicht.
