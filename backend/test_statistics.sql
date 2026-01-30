-- Test script für Statistik-Queries
-- Testet die "Diese Woche" Berechnung

USE easyseatdb;

-- Zeige aktuelles Datum und Wochentag
SELECT 
    CURDATE() as heute,
    DAYNAME(CURDATE()) as wochentag,
    WEEKDAY(CURDATE()) as weekday_nummer,  -- 0=Montag, 6=Sonntag
    DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE())) DAY) as montag_dieser_woche,
    DATE_ADD(CURDATE(), INTERVAL 1 DAY) as morgen;

-- Test: Wochenberechnung
-- Soll alle Buchungen von Montag dieser Woche bis heute (inkl.) zählen
SELECT 
    'Test: Buchungen diese Woche' as test,
    COUNT(*) as anzahl,
    MIN(booking_date) as erste_buchung,
    MAX(booking_date) as letzte_buchung
FROM bookings
WHERE booking_date >= DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE())) DAY)
  AND booking_date < DATE_ADD(CURDATE(), INTERVAL 1 DAY);

-- Test: Buchungen heute
SELECT 
    'Test: Buchungen heute' as test,
    COUNT(*) as anzahl
FROM bookings
WHERE booking_date = CURDATE();

-- Test: Buchungen dieser Monat
SELECT 
    'Test: Buchungen dieser Monat' as test,
    COUNT(*) as anzahl,
    MIN(booking_date) as erste_buchung,
    MAX(booking_date) as letzte_buchung
FROM bookings
WHERE MONTH(booking_date) = MONTH(CURDATE())
  AND YEAR(booking_date) = YEAR(CURDATE());

-- Beispiel-Szenario: Wenn heute Freitag, 31. Januar 2026 ist
-- Montag dieser Woche = 27. Januar 2026
-- "Diese Woche" sollte alle Buchungen von 27.01. bis 31.01. (inkl.) zählen

-- Debug: Zeige alle Buchungen mit Datum
SELECT 
    id,
    booking_date,
    DAYNAME(booking_date) as wochentag,
    customer_name,
    status
FROM bookings
WHERE booking_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
ORDER BY booking_date DESC;
