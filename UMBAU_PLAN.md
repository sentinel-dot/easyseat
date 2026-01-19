# Umbaup plan: EasySeat → Beauty-Business Website

## 📋 Übersicht

Das bestehende EasySeat-Projekt ist bereits sehr gut für ein Beauty-Business geeignet! Die meisten Funktionen können direkt übernommen werden. Hier ist der detaillierte Plan zur Umstellung.

---

## ✅ Was bereits passt (kann so bleiben)

### Backend & Datenbank
- ✅ **Buchungssystem** - Funktioniert perfekt für Beauty-Termine
- ✅ **Verfügbarkeitsprüfung** - Ideal für Terminbuchungen
- ✅ **Service-Verwaltung** - Kann direkt für die beiden Behandlungen genutzt werden
- ✅ **Staff-System** - Perfekt für deine Schwägerin als einzige Mitarbeiterin
- ✅ **Token-basierte Buchungsverwaltung** - Kunden können Termine selbst verwalten
- ✅ **Email-Bestätigungen** - Bereits vorhanden
- ✅ **Datenbank-Schema** - Passt bereits für Beauty-Salon (Typ: `beauty_salon`)

### Frontend
- ✅ **Kalender-Buchungssystem** - Funktioniert bereits
- ✅ **Service-Auswahl** - Kann direkt genutzt werden
- ✅ **Buchungsformular** - Passt für Beauty-Termine
- ✅ **Buchungsverwaltung** - Kunden können Termine ändern/stornieren

---

## 🔄 Was angepasst werden muss

### 1. **Branding & Texte** (Priorität: HOCH)

#### Frontend
- [ ] **Homepage** (`frontend/app/page.tsx`)
  - Titel ändern von "easyseat" zu Business-Name
  - Beschreibung anpassen für Beauty-Business
  - Call-to-Action anpassen
  
- [ ] **Metadata** (`frontend/app/layout.tsx`)
  - Title: "Business-Name - Augenbrauen Lifting & Extensions"
  - Description: Professionelle Beschreibung
  
- [ ] **Navigation/Header** (`frontend/components/layout/header.tsx`)
  - Logo/Branding hinzufügen
  - Navigation anpassen
  
- [ ] **Footer** (`frontend/components/layout/footer.tsx`)
  - Kontaktdaten der Schwägerin
  - Impressum/Datenschutz Links

#### Backend
- [ ] **API-Messages** (`backend/src/server.ts`)
  - "easyseat backend api" → "Beauty-Business API"

### 2. **Datenbank-Seed** (Priorität: HOCH)

#### `backend/src/config/database/seed.sql`
- [ ] **Venue erstellen**
  - Name: Business-Name der Schwägerin
  - Type: `'beauty_salon'`
  - Kontaktdaten (Email, Telefon, Adresse)
  - Beschreibung des Studios
  
- [ ] **Services erstellen**
  - Service 1: "Augenbrauen Lifting"
    - Dauer: z.B. 60 Minuten
    - Preis: z.B. 89€
  - Service 2: "Augenbrauen Extensions"
    - Dauer: z.B. 90 Minuten
    - Preis: z.B. 129€
  
- [ ] **Staff Member erstellen**
  - Name: Name der Schwägerin
  - Email: Ihre Geschäfts-Email
  - Beschreibung: Kurze Vorstellung
  
- [ ] **Staff-Service Verknüpfung**
  - Schwägerin kann beide Services durchführen
  
- [ ] **Verfügbarkeitszeiten**
  - Ihre Arbeitszeiten eintragen (z.B. Mo-Fr 9-18 Uhr)

### 3. **UI/UX Anpassungen** (Priorität: MITTEL)

#### Design
- [ ] **Farbschema anpassen**
  - Von blau zu Beauty-Farben (z.B. Rosa, Gold, Beige)
  - `frontend/app/globals.css` anpassen
  
- [ ] **Icons & Bilder**
  - Beauty-relevante Icons hinzufügen
  - Platzhalter für Vorher/Nachher Bilder
  
- [ ] **Service-Darstellung**
  - Schönere Karten für die Services
  - Bilder für jede Behandlung hinzufügen

#### Texte
- [ ] **Alle "Venue"-Referenzen**
  - "Venue" → "Studio" oder "Salon"
  - "Venues entdecken" → "Termin buchen"
  
- [ ] **Buchungsformular**
  - "party_size" → entfernen oder auf 1 setzen (nur Einzeltermine)
  - "special_requests" → "Besondere Wünsche/Allergien"

### 4. **Funktionale Anpassungen** (Priorität: MITTEL)

#### Frontend
- [ ] **Homepage verbessern**
  - Hero-Section mit Bild
  - Kurze Vorstellung der Schwägerin
  - Services-Vorschau
  - Testimonials-Bereich (später)
  
- [ ] **Venue-Detail-Seite**
  - Da es nur ein Studio gibt, könnte man direkt zur Buchung weiterleiten
  - Oder: Schöne Studio-Seite mit Galerie
  
- [ ] **Buchungsbestätigung**
  - Schönere Bestätigungsseite
  - Nächste Schritte für Kunden

#### Backend
- [ ] **Validierungen**
  - `party_size` sollte für Beauty-Services immer 1 sein
  - Eventuell Mindestbuchungszeit (z.B. 24h im Voraus)

---

## 🆕 Was neu hinzugefügt werden sollte

### 1. **Galerie/Vorher-Nachher** (Priorität: NIEDRIG)
- [ ] Bildergalerie auf der Homepage
- [ ] Vorher/Nachher Slider

### 2. **Über mich Seite** (Priorität: MITTEL)
- [ ] Seite mit Vorstellung der Schwägerin
- [ ] Qualifikationen, Ausbildung
- [ ] Warum sie das macht

### 3. **Preisliste** (Priorität: MITTEL)
- [ ] Übersichtliche Preisliste
- [ ] Kombi-Angebote (z.B. Lifting + Extensions)

### 4. **Kontaktformular** (Priorität: NIEDRIG)
- [ ] Zusätzlich zur Buchung
- [ ] Für allgemeine Anfragen

### 5. **Email-Benachrichtigungen** (Priorität: HOCH)
- [ ] Bestätigungs-Emails an Kunden
- [ ] Erinnerungs-Emails (z.B. 24h vorher)
- [ ] Benachrichtigung an Schwägerin bei neuer Buchung

### 6. **Admin-Dashboard** (Priorität: NIEDRIG)
- [ ] Übersicht aller Buchungen
- [ ] Kalenderansicht für Schwägerin
- [ ] Statistiken

---

## 📝 Schritt-für-Schritt Umsetzung

### Phase 1: Grundlegende Umstellung (1-2 Stunden)
1. ✅ Datenbank-Seed anpassen (Business-Daten eintragen)
2. ✅ Homepage umbenennen und Texte anpassen
3. ✅ Metadata anpassen
4. ✅ Backend-Messages anpassen

### Phase 2: Design & Branding (2-3 Stunden)
1. ✅ Farbschema ändern
2. ✅ Header/Footer anpassen
3. ✅ Service-Karten verschönern
4. ✅ Navigation anpassen

### Phase 3: Funktionale Verbesserungen (2-3 Stunden)
1. ✅ Homepage mit Hero-Section
2. ✅ "Über mich" Seite erstellen
3. ✅ Buchungsbestätigung verbessern
4. ✅ Validierungen anpassen

### Phase 4: Erweiterungen (Optional, später)
1. ⏳ Galerie hinzufügen
2. ⏳ Email-Benachrichtigungen implementieren
3. ⏳ Admin-Dashboard
4. ⏳ Kontaktformular

---

## 🎨 Design-Vorschläge

### Farbpalette (Beispiel)
- **Primär**: Rosa/Beige (#F5E6E0 oder #E8D5C4)
- **Sekundär**: Gold (#D4AF37)
- **Akzent**: Dunkelbraun (#3C2414)
- **Text**: Dunkelgrau (#2C2C2C)

### Typografie
- Elegante, moderne Schriftart
- Gut lesbar für alle Altersgruppen

---

## 📋 Checkliste für die Umsetzung

### Sofort umsetzbar:
- [ ] Seed-Datei mit Business-Daten füllen
- [ ] Homepage-Texte ändern
- [ ] Metadata anpassen
- [ ] Backend-Messages ändern

### Kurzfristig:
- [ ] Design anpassen (Farben, Styling)
- [ ] Header/Footer anpassen
- [ ] Service-Darstellung verbessern
- [ ] "Über mich" Seite erstellen

### Mittelfristig:
- [ ] Email-Benachrichtigungen
- [ ] Galerie hinzufügen
- [ ] Preisliste-Seite
- [ ] Kontaktformular

### Langfristig:
- [ ] Admin-Dashboard
- [ ] Analytics/Statistiken
- [ ] Online-Zahlungen
- [ ] Kundenbewertungen

---

## 💡 Tipps

1. **Starte klein**: Erst die Grundfunktionen umstellen, dann erweitern
2. **Teste gründlich**: Nach jeder Änderung die Buchung testen
3. **Mobile-first**: Stelle sicher, dass alles auf dem Handy gut aussieht
4. **Bilder**: Professionelle Bilder machen einen großen Unterschied
5. **SEO**: Denke an Google-Suche (Meta-Tags, Beschreibungen)

---

## 🚀 Nächste Schritte

Soll ich mit der Umsetzung beginnen? Ich kann:
1. Die Seed-Datei mit den Business-Daten füllen
2. Die Homepage umgestalten
3. Das Design anpassen
4. Weitere Seiten erstellen

Sag mir einfach, womit ich anfangen soll! 🎨
