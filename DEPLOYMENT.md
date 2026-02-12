# Deployment: Backend (Railway) + Frontend (Vercel)

Anleitung, um das easyseat Backend auf **Railway** und das Frontend auf **Vercel** sicher und produktionsreif zu betreiben.

---

## Übersicht

| Komponente | Plattform | Wichtig |
|------------|-----------|---------|
| Backend (Express API) | Railway | Port, DB, CORS, JWT_SECRET |
| Frontend (Next.js) | Vercel | `NEXT_PUBLIC_API_URL` |
| Datenbank (MySQL/MariaDB) | Railway (MySQL-Plugin) | Schema einmal anwenden |

---

## 1. Backend auf Railway

### 1.1 Projekt anlegen

1. [Railway](https://railway.app) öffnen und ein neues Projekt erstellen.
2. **MySQL** hinzufügen: Im Projekt auf **+ New** → **Database** → **MySQL**.
3. **Backend-Service** hinzufügen: **+ New** → **GitHub Repo** (oder **Empty**) und Repo `easyseat` verbinden.
4. **Root Directory** setzen: Wenn das Repo Monorepo ist, unter **Settings** → **Build** → **Root Directory** auf `backend` setzen.

### 1.2 Build & Start (Railway)

- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- **Watch Paths** (optional): `backend/**` damit nur bei Änderungen im Backend neu gebaut wird.

Railway erkennt Node oft automatisch; falls nicht, in den Service-Settings angeben.

### 1.3 Umgebungsvariablen (Backend auf Railway)

In **Variables** des Backend-Services setzen:

| Variable | Wert | Hinweis |
|----------|------|---------|
| `NODE_ENV` | `production` | Wichtig für CORS und Fehlerantworten |
| `PORT` | *(leer lassen)* | Railway setzt `PORT` automatisch |
| **Datenbank** (Option A – empfohlen) | | |
| `MYSQL_PRIVATE_URL` | `${{MySQL.MYSQL_PRIVATE_URL}}` | Referenz auf MySQL-Service (gleiches Projekt) |
| **Oder** (Option B) | | |
| `DB_HOST` | `${{MySQL.MYSQLHOST}}` | Einzelne Referenzen |
| `DB_PORT` | `${{MySQL.MYSQLPORT}}` | |
| `DB_USER` | `${{MySQL.MYSQLUSER}}` | |
| `DB_PASSWORD` | `${{MySQL.MYSQLPASSWORD}}` | |
| `DB_NAME` | `${{MySQL.MYSQLDATABASE}}` | |
| **CORS** | | |
| `FRONTEND_URL` | `https://deine-app.vercel.app` | Exakte Vercel-URL |
| **Oder** mehrere (Production + Previews): | | |
| `FRONTEND_URLS` | `https://easyseat.vercel.app,https://easyseat-xxx.vercel.app` | Komma-getrennt, keine Leerzeichen |
| **Sicherheit** | | |
| `JWT_SECRET` | *(starkes Geheimnis)* | **Pflicht in Production.** z. B. `openssl rand -base64 32` |
| `JWT_EXPIRES_IN` | `24h` | Optional |

**Hinweis:** Ohne gesetztes, starkes `JWT_SECRET` startet das Backend in Production nicht (Sicherheitscheck).

### 1.4 Domain & URL

Unter **Settings** → **Networking** → **Public Networking** eine **Domain** generieren (z. B. `easyseat-backend.up.railway.app`). Diese URL ist die **Backend-API-URL** für das Frontend.

### 1.5 Datenbank-Schema (einmalig)

Das Schema muss einmal auf der Railway-MySQL-Datenbank laufen:

- **Option A:** Lokal mit Railway-Datenbank verbinden (TCP Proxy in Railway aktivieren, dann mit z. B. TablePlus/DBeaver und den DB-Variablen verbinden) und `backend/src/config/database/schema.sql` sowie ggf. `seed.sql` ausführen.
- **Option B:** In Railway einen **Cron Job** oder **One-off** Service anlegen, der einmal z. B. `mysql ... < schema.sql` ausführt, oder die SQL-Dateien per Hand im Railway MySQL-Dashboard (falls angeboten) ausführen.

Schema-Dateien: `backend/src/config/database/schema.sql`, optional `seed.sql`.

---

## 2. Frontend auf Vercel

### 2.1 Projekt anlegen

1. [Vercel](https://vercel.com) → **Add New** → **Project**.
2. GitHub-Repo `easyseat` importieren.
3. **Root Directory** auf `frontend` setzen (wenn Monorepo).
4. Framework Preset: **Next.js** (wird meist erkannt).

### 2.2 Umgebungsvariablen (Frontend auf Vercel)

Unter **Settings** → **Environment Variables**:

| Variable | Wert | Environments |
|----------|------|----------------|
| `NEXT_PUBLIC_API_URL` | `https://easyseat-backend.up.railway.app` | Production, Preview, Development (nach Bedarf) |
| `NEXT_PUBLIC_SITE_URL` | `https://deine-app.vercel.app` | Für sitemap.xml und robots.txt (optional, sonst Fallback auf Vercel-URL) |

Die API-URL muss **ohne** abschließenden Schrägstrich sein und mit der Railway-Backend-Domain übereinstimmen.

### 2.3 Deploy

- **Build Command:** `npm run build` (Vercel Standard).
- **Output Directory:** Standard für Next.js.
- Nach dem Deploy: Frontend-URL notieren (z. B. `https://easyseat.vercel.app`) und diese **genau** in der Backend-Variable `FRONTEND_URL` bzw. `FRONTEND_URLS` eintragen.

---

## 3. CORS & Sicherheit

- **CORS:** Das Backend erlaubt nur die in `FRONTEND_URL` oder `FRONTEND_URLS` eingetragenen Origins. Für Vercel-Preview-Deployments die jeweilige Preview-URL in `FRONTEND_URLS` (komma-getrennt) eintragen, sonst blockiert der Browser die API-Aufrufe.
- **Admin-Auth (Cookie, sicher in Dev & Prod):** Das Admin-Token wird ausschließlich in einem **HttpOnly-Cookie** gespeichert (kein Token im Response-Body, kein sessionStorage). Damit das Cookie unabhängig von Port/Host immer funktioniert (lokal andere Ports, Prod Frontend auf Vercel / Backend auf Railway), gehen **alle Admin-API-Aufrufe im Browser über die Frontend-Origin** unter dem Pfad `/api/*`. Ein Next.js Route Handler (`app/api/[...path]/route.ts`) leitet diese Anfragen an das Backend weiter und reicht Cookie sowie Set-Cookie durch. Der Browser spricht also nur mit derselben Origin (z. B. `https://easyseat.vercel.app/api/...`) – keine Cross-Origin-Cookies, keine CORS-Probleme für die Admin-Auth. Das Backend wird nur von deinem Frontend-Server (Vercel/lokal) aufgerufen, nicht direkt vom Browser.
- **JWT:** In Production muss `JWT_SECRET` gesetzt und sicher sein (mind. 32 Zeichen, zufällig). Das Backend startet sonst nicht.
- **Secrets:** `.env` liegt nicht im Git. Auf Railway und Vercel nur über die jeweiligen **Variables** setzen, keine Secrets ins Repo committen.

---

## 4. Eigene Domain (optional)

- **Vercel:** Unter **Settings** → **Domains** eigene Domain hinzufügen (z. B. `easyseat.de`). Danach `NEXT_PUBLIC_SITE_URL` und `FRONTEND_URL`/`FRONTEND_URLS` auf diese URL setzen.
- **Railway:** Unter **Settings** → **Networking** eigene Domain für das Backend eintragen; `NEXT_PUBLIC_API_URL` im Frontend entsprechend anpassen.

---

## 5. Nach dem Deploy: Monitoring & Backup

- **Monitoring:** Health-Check überwachen (z. B. [UptimeRobot](https://uptimerobot.com) auf `GET /health`). Optional: Error-Tracking z. B. mit [Sentry](https://sentry.io) für Backend/Frontend.
- **Backup:** DB-Backups über Railway (oder den genutzten DB-Provider) einrichten; Intervall und Aufbewahrung nach Bedarf wählen.

---

## 6. Checkliste Deploy (Railway + Vercel)

- [ ] Backend auf Railway mit `NODE_ENV=production`.
- [ ] MySQL auf Railway angelegt, Schema (und optional Seed) ausgeführt.
- [ ] `JWT_SECRET` stark und nur in Railway Variables gesetzt.
- [ ] `FRONTEND_URL` / `FRONTEND_URLS` mit der exakten Vercel-URL (und ggf. Previews).
- [ ] Frontend auf Vercel mit `NEXT_PUBLIC_API_URL` = Railway-Backend-URL; bei eigener Domain `NEXT_PUBLIC_SITE_URL` setzen.
- [ ] Beide Seiten getestet: Buchungsflow, Admin-Login, Health-Check (`GET /health`).
- [ ] Monitoring (z. B. UptimeRobot) und DB-Backup eingerichtet.
- [ ] Keine .env/Secrets im Repo; alle Secrets nur über Railway/Vercel Variables.

---

## 7. Nützliche Befehle

- **JWT-Secret erzeugen:** `openssl rand -base64 32`
- **Backend Health-Check:** `curl https://deine-backend-url.up.railway.app/health`
- **Lokal mit Production-API testen:** Im Frontend `NEXT_PUBLIC_API_URL` auf die Railway-URL setzen und `npm run dev` (nur zum Testen).

Mit diesen Schritten läuft die App sicher und produktionsreif mit Backend auf Railway und Frontend auf Vercel.

---

## 8. Admin (Systemsteuerung)

Rollen: **admin** = System-Admin (keine Venue), **owner** = Venue-Inhaber, **staff** = Mitarbeiter.  
Der **Admin** verwaltet das gesamte System (Venues, Benutzer). Das **Dashboard** ist für **Owner** und **Staff** (ein Betrieb).

### Einrichtung

- **Neue Installation:** `schema.sql` und `seed.sql` ausführen. Der Seed legt einen System-Admin an:
  - E-Mail: `admin@easyseat.local`
  - Passwort: `superadmin123`
  - Rolle: `admin`, `venue_id`: NULL
- **Bestehende Installation** (ältere Rollen-Struktur):  
  `migrate_roles_admin_owner.sql` ausführen (Rollen-Migration: z. B. frühere System-Admin-Rolle → admin, Venue-Admin → owner).

### Nach dem Login

- **Alle** melden sich unter **/admin/login** an.
- **System-Admin** (Rolle `admin`, ohne Venue): **Admin-Übersicht** (Venues, Admins, Stats).
- **Owner / Staff** (mit Venue): **Dashboard** (Buchungen, Leistungen, Einstellungen).
