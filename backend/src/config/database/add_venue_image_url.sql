-- Migration: image_url für Venues (bestehende Datenbanken)
USE easyseatdb;

-- 1) Spalte hinzufügen (nur ausführen wenn noch nicht vorhanden)
ALTER TABLE venues
ADD COLUMN image_url VARCHAR(500) NULL AFTER description;

-- 2) Bestehende Venues mit passenden Bild-URLs aktualisieren (IDs wie im Seed: 1, 2, 3)
UPDATE venues SET image_url = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800' WHERE id = 1 AND name = 'Bella Vista Restaurant';
UPDATE venues SET image_url = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800' WHERE id = 2 AND name = 'Salon Schmidt';
UPDATE venues SET image_url = 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800' WHERE id = 3 AND name = 'Leloluxee Lashes';
