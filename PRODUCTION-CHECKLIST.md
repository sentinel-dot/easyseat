# Produktions-Checkliste

- [ ] **Rechtliches:** Impressum, Datenschutz und AGB mit echten Daten (Name, Adresse, Kontakt).
- [ ] **Deploy:** Technischen Deploy wie in DEPLOYMENT.md durchgeführt (Railway + Vercel).

- [ ] **Kundendaten:** Nur notwendige Daten erheben; Umgang mit personenbezogenen Daten geklärt (DSGVO).

- [ ] **Monitoring:** Health-Check überwachen (z. B. UptimeRobot) oder Error-Tracking (z. B. Sentry)
- [ ] **Backup:** DB-Backup-Strategie (Railway/Provider) einrichten
- [ ] **Tests:** Buchungsflow + Admin-Login manuell durchspielen; optional E2E-Tests
- [ ] **DB:** Schema (und optional Seed) auf Production-DB ausgeführt
- [ ] **EMAIL:** E-Mail Service
- [ ] **Superadmin:** Superadmin dashboard for me (dev)