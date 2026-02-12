# White-Box-Analyse – easyseat

**Kurzüberblick:** **docs/PROJEKT-DOKUMENTATION.md** (Abschnitt 3. Code-Review).

Durchführung: Code-Review aller relevanten Bestandteile (Backend, Frontend, API, DB-Schema, Types).  
Gefundene Fehler und Verbesserungen sind nach Kategorie und Priorität geordnet.

**Stand der Umsetzung:** Alle im Report genannten Punkte (kritisch, mittel, klein) sind umgesetzt – siehe Abschnitt 6 und Checkliste.

---

## 1. Kritische Fehler (behoben)

### 1.1 API-Proxy leitet Query-Parameter nicht weiter ✅

**Datei:** `frontend/app/api/[...path]/route.ts`

**Problem:** Die Proxy-Funktion baut die Backend-URL nur aus dem Pfad. Query-Parameter wurden nicht weitergegeben.

**Umsetzung:** `request.nextUrl.searchParams` werden an die Backend-URL angehängt.

---

### 1.2 Admin-Routen: „Owner“ ohne venueId erhält überall 403

**Dateien:** `backend/src/routes/admin.routes.ts`

**Status:** Unverändert (Design-Entscheidung). Die Logik setzt voraus, dass jeder Admin ein `venueId` hat. Für „Owner über mehrere Venues“ wäre eine Erweiterung (z. B. optionales `venue_id` als Query-Parameter) nötig.

---

### 1.3 DELETE /bookings/:id ohne Authentifizierung ✅

**Datei:** `backend/src/routes/booking.routes.ts`

**Umsetzung:** Route mit `authenticateToken` und `requireRole('owner', 'admin')` geschützt.

---

## 2. Fehler mittlerer Priorität (behoben)

### 2.1 Tippfehler in Nutzer-sichtbaren Texten ✅

**Datei:** `backend/src/routes/booking.routes.ts`  
`'Party size must be betweem 1 and 50'` → **between**

---

### 2.2 Tippfehler in Logs ✅

- `backend/src/services/booking.service.ts`: „conncetion“ → **connection**, „bot“ → **not**
- `backend/src/config/database/index.ts`: „aquired“ → **acquired**

---

### 2.3 Backend-Types: Service/StaffMember mit `venue_id` ✅

**Datei:** `backend/src/config/utils/types.ts`

**Umsetzung:** `business_id` in beiden Interfaces durch `venue_id` ersetzt; Kommentar ergänzt (DB/API verwenden venue_id). Keine weiteren Referenzen auf `business_id` im Backend.

---

### 2.4 PATCH /admin/venue/settings: Zahl-Validierung (Strings akzeptieren) ✅

**Datei:** `backend/src/routes/admin.routes.ts`

**Umsetzung:** Hilfsfunktion `parseNonNegativeNumber` parst `number` oder string aus JSON; Werte werden mit `Number(v)` konvertiert und auf `>= 0` bzw. gültige Zahl geprüft. Ungültige Werte liefern 400 mit klarer Meldung.

---

### 2.5 PATCH /admin/services/:id: Zahlen aus JSON parsen ✅

**Datei:** `backend/src/routes/admin.routes.ts`

**Umsetzung:** `duration_minutes` und `price` werden aus dem Body geparst (number oder string); bei ungültigen Werten 400 mit Fehlermeldung.

---

### 2.6 Frontend getBookings: serviceId/limit/offset 0 ✅

**Datei:** `frontend/lib/api/admin.ts`  
Prüfung auf `!= null` und `String(...)` für serviceId, limit, offset.

---

## 3. Kleinere / optionale Punkte (behoben)

### 3.1 server.ts: Einrückung

**Status:** Vorhandene Einrückung ist einheitlich; keine Änderung nötig.

---

### 3.2 apiClient Rückgabe-Typ: Boolean → boolean ✅

**Datei:** `frontend/lib/api/client.ts`  
Rückgabe typisiert mit primitivem `boolean`.

---

### 3.3 auth.middleware: requireVenueAccess und NaN ✅

**Datei:** `backend/src/middleware/auth.middleware.ts`

**Umsetzung:** `venueId`/`venue_id` werden einheitlich gelesen; nach Parsen wird mit `Number.isInteger(requestedVenueId) && requestedVenueId >= 1` geprüft. Bei ungültiger oder fehlender ID: 400 „Ungültige oder fehlende Venue-ID“. Vergleich mit `req.jwtPayload.venueId` nur mit gültiger Zahl.

---

### 3.4 booking.service: getBookingByToken – Rückgabe-Typ

**Status:** Unverändert. Rückgabe bleibt `Booking`; die zusätzlichen Spalten (venue_name, etc.) sind Laufzeit-Daten. Ein erweitertes Interface wäre optional für striktere Typisierung.

---

## 4. Architektur- / Konsistenz-Hinweise

- **Owner vs. Venue:** Siehe 1.2 – aktuell muss jeder Admin ein Venue haben.
- **DELETE /bookings/:id:** Auth ist umgesetzt (1.3).
- **Migration booking_advance_hours:** Deployment-Checkliste sollte „Migrationen anwenden“ enthalten.

---

## 5. Kurzüberblick (Checkliste)

| # | Kategorie        | Beschreibung                                      | Status     |
|---|------------------|---------------------------------------------------|------------|
| 1 | API-Proxy        | Query-Parameter an Backend weiterleiten           | ✅ Behoben |
| 2 | Admin/Owner       | Owner ohne venueId erhält 403                     | ⏸ Design  |
| 3 | Sicherheit        | DELETE /bookings/:id ohne Auth                    | ✅ Behoben |
| 4 | Texte             | „betweem“ → between                               | ✅ Behoben |
| 5 | Logs              | conncetion, bot, aquired → korrigieren            | ✅ Behoben |
| 6 | Backend-Types     | business_id → venue_id                            | ✅ Behoben |
| 7 | Admin-Route       | venue/settings Zahl-Validierung (String erlauben) | ✅ Behoben |
| 8 | Admin-Route       | services/:id duration_minutes, price parsen      | ✅ Behoben |
| 9 | Frontend API      | getBookings serviceId/limit/offset 0              | ✅ Behoben |
|10 | Typen/Style       | Boolean → boolean                                 | ✅ Behoben |
|11 | requireVenueAccess| NaN / ungültige venueId abfangen                  | ✅ Behoben |

---

## 6. Zusammenfassung der Code-Änderungen

- **Backend Types:** `Service` und `StaffMember` verwenden `venue_id` statt `business_id`.
- **JSON-Zahlen:** PATCH `/admin/venue/settings` und PATCH `/admin/services/:id` parsen Zahlen aus Body (number oder string) und validieren; ungültige Werte → 400.
- **Kleinere Punkte:** requireVenueAccess prüft auf gültige Integer-venueId und antwortet bei NaN/ungültig mit 400; apiClient nutzt `boolean`; Tippfehler und DELETE-Auth wie zuvor umgesetzt.

Diese Analyse ersetzt keine automatisierten Tests oder Security-Audits, sondern dient als strukturierter White-Box-Report aus dem Code-Review.
