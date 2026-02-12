# Fachliche Logik der Suche – Analyse

## Aktueller Ablauf

### 1. Hero-Suche (Startseite)
- **Eingaben:** Was suchen Sie? (Typ), Datum, Uhrzeit, Gäste/Personen
- **Aktion:** Weiterleitung zu `/venues?type=…&date=…&time=…&party_size=…`
- **Bedeutung:** Die Parameter sind reine **Voreinstellungen** für die Buchung; sie filtern die Venue-Liste **nicht** nach Verfügbarkeit.

### 2. Venues-Liste
- **API:** `GET /venues` (optional `?type=restaurant` etc.)
- **Logik:** Es werden **alle** Venues des gewählten Typs geladen – **unabhängig** von Datum, Uhrzeit oder Personenanzahl.
- **Folge:** Nutzer sieht z.B. 10 Restaurants, obwohl an dem gewünschten Tag/Uhrzeit nur 2 noch Kapazität haben.

### 3. Venue-Detail & Buchungs-Widget
- **URL-Parameter:** `date`, `time`, `party_size` werden als `initialDate`, `initialTime`, `initialPartySize` übernommen.
- **Ablauf im Widget:**
  1. **Leistung wählen** (Service) – Pflicht, bevor es weitergeht.
  2. **Datum** – wird mit `initialDate` vorbelegt; Nutzer kann es ändern.
  3. **Uhrzeit** – Slots werden mit `GET /availability/slots?venueId=&serviceId=&date=` geladen.  
     **Wichtig:** `party_size` wird **nicht** an die Slots-API übergeben.
  4. **Ihre Daten** – u.a. Gästeanzahl (nur bei Restaurants sichtbar, `showPartySize = venue.type === "restaurant"`).

### 4. Slots-API (Backend)
- **Endpoint:** `GET /availability/slots?venueId=&serviceId=&date=`
- **Parameter:** Kein `partySize`.
- **Logik (Restaurant / kapazitätsbasiert):**
  - Pro Slot wird `remaining_capacity = service.capacity - Summe(party_size der überlappenden Buchungen)` berechnet.
  - Ein Slot gilt als verfügbar, wenn `remaining_capacity > 0`.
- **Folge:** Es werden z.B. alle Slots mit „noch mindestens 1 Platz“ angezeigt. Wenn der Nutzer 4 Gäste eingibt, aber nur 2 Plätze frei sind, erscheint der Slot trotzdem – die Prüfung `party_size <= remaining_capacity` passiert erst beim **Buchungsversuch** (`isTimeSlotAvailable`). Dann kann es zu einer Fehlermeldung kommen.

### 5. Buchung erstellen
- **Validierung:** `POST /availability/validate` bzw. `isTimeSlotAvailable(…, partySize)` prüft u.a. `partySize <= capacity`.
- **Erst hier** wird die gewünschte Personenanzahl gegen die tatsächliche Kapazität geprüft.

---

## Typen-Unterschiede

| Aspekt              | Restaurant              | Friseur / Kosmetik / Massage etc.   |
|---------------------|-------------------------|--------------------------------------|
| **party_size**      | Sichtbar, 1–20 Gäste    | Im UI ausgeblendet, Backend bekommt 1 |
| **Slots**           | Kapazität = Tischgröße (capacity) | Pro Mitarbeiter, oft 1 Person pro Slot |
| **Such-Parameter**  | Datum/Uhrzeit/Gäste sinnvoll | „Gäste“ aktuell ohne Wirkung auf Slots |

---

## Lücken der aktuellen Suchlogik

1. **Keine Verfügbarkeits-Filterung auf Venue-Ebene**  
   Die Liste zeigt alle Venues des Typs, nicht nur solche mit freien Slots am gewünschten Datum (und ggf. Zeitfenster oder Personenanzahl).

2. **Slots unabhängig von gewünschter Personenanzahl**  
   `getAvailableSlots` kennt `party_size` nicht. Bei Restaurants werden Slots mit „noch 1 Platz frei“ angezeigt, auch wenn der Nutzer 4 Gäste eingegeben hat – Fehler erst beim Absenden.

3. **„Gäste/Personen“ bei Nicht-Restaurants**  
   Im Hero kann man „2 Personen“ wählen, aber bei Friseur/Kosmetik wird das ignoriert (immer 1 Person bei Buchung). Unklar ist die fachliche Bedeutung (z.B. 2 Termine nacheinander?).

4. **Service-Pflicht vor Datum/Uhrzeit**  
   Erst nach Auswahl einer **konkreten Leistung** werden Datum und dann Slots geladen. Die Suche „Restaurant, 4 Personen, morgen 19:00“ führt nicht zu einer Liste „nur Venues mit Slot morgen 19:00 für 4 Personen“.

---

## Mögliche Verbesserungen (fachlich)

### A) Slots an gewünschte Personenanzahl koppeln (schnell umsetzbar)
- **Backend:** `GET /availability/slots` um optionales `partySize` erweitern.
- **Logik:** Bei kapazitätsbasierten Services (Restaurant) nur Slots zurückgeben, bei denen `remaining_capacity >= partySize`.
- **Frontend:** Im Buchungs-Widget `party_size` (initialPartySize bzw. aktuelle Gästeanzahl) an die Slots-API übergeben.
- **Effekt:** Keine Slots mehr, die bei Absenden wegen zu geringer Kapazität fehlschlagen.

### B) Venues mit Verfügbarkeit anzeigen (größerer Aufwand)
- **Idee:** Nur Venues anzeigen, die am gewünschten Datum (und optional in einem Zeitfenster) mindestens einen buchbaren Slot für die gewünschte Personenanzahl haben.
- **Voraussetzung:** Pro Venue mehrere Services (z.B. „Tisch 2er“, „Tisch 4er“). Oder ein neuer API-Endpunkt, z.B. „Venues mit Verfügbarkeit“ (Datum, optional Zeit, optional party_size, optional type), der pro Venue prüft, ob **irgendein** Service einen passenden Slot hat.
- **UX:** Weniger „tote“ Klicks auf Venues ohne passende Slots.

### C) Bedeutung von „Personen“ pro Typ klären
- **Restaurant:** Gästeanzahl = Kapazität pro Tisch/Slot (wie heute).
- **Friseur/Kosmetik:**  
  - Entweder: „Personen“ = 1 Termin (aktuelles Verhalten), dann im Hero bei Nicht-Restaurant „Personen“ ausblenden oder auf 1 fixieren.  
  - Oder: Mehrere gleichzeitige Termine (z.B. 2 Stühle) – dann müsste die Slots-/Kapazitätslogik das unterstützen.

### D) Optional: Zeitfenster in der Suche
- Wenn der Nutzer „ca. 19:00“ sucht: Slots in einem Fenster (z.B. 18:00–20:00) berücksichtigen oder anzeigen. Aktuell ist die gewünschte Uhrzeit nur Voreinstellung im Widget (nächstpassenden Slot vorwählen), sie filtert die Venue-Liste nicht.

---

## Umgesetzte Verbesserungen (Stand)

1. **A) party_size in Slots-API** – umgesetzt: `GET /availability/slots?partySize=…`; Backend filtert Slots mit `remaining_capacity >= partySize`; Booking-Widget übergibt `partySize` (Restaurant) bzw. 1 (andere Typen); optional Zeitfenster `timeWindowStart`/`timeWindowEnd`.
2. **C) „Personen“ nur bei Restaurant/Alle** – umgesetzt: Hero-Suche zeigt „Gäste“ nur bei Kategorie Restaurant oder Alle; bei Friseur/Kosmetik etc. wird kein `party_size` in der URL mitgegeben.
3. **B) Venues mit Verfügbarkeit** – umgesetzt: `GET /venues?date=…&party_size=…&time=…`; Backend filtert Venues auf solche mit mindestens einem freien Slot an dem Tag (optional im Zeitfenster ±1h um `time`).
4. **D) Zeitfenster** – umgesetzt: Slots-API und Venues-API unterstützen optional `timeWindowStart`/`timeWindowEnd`; Hero-Zeit „19:00“ wird als Fenster ±1h genutzt (Venues-Liste und Buchungs-Widget).
