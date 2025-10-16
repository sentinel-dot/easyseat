# Verfügbare Zeitslots für einen Tag abrufen
# Parameter: venueId, serviceId, date (YYYY-MM-DD)
curl "http://localhost:5001/availability/slots?venueId=1&serviceId=2&date=2025-10-20"

# Verfügbarkeit für eine Woche abrufen
# Parameter: venueId, serviceId, startDate (YYYY-MM-DD)
curl "http://localhost:5001/availability/week?venueId=1&serviceId=2&startDate=2025-10-20"

# Prüfen ob spezifischer Zeitslot verfügbar ist
curl -X POST http://localhost:5001/availability/check \
  -H "Content-Type: application/json" \
  -d '{
    "venueId": 1,
    "serviceId": 2,
    "date": "2025-10-20",
    "startTime": "19:00",
    "endTime": "21:00",
    "partySize": 4
  }'

# Mit Staff Member ########################### hier
curl -X POST http://localhost:5001/availability/check \
  -H "Content-Type: application/json" \
  -d '{
    "venueId": 2,
    "serviceId": 4,
    "staffMemberId": 1,
    "date": "2025-10-20",
    "startTime": "10:00",
    "endTime": "10:45",
    "partySize": 1
  }'

# Buchungsanfrage validieren (Restaurant)
curl -X POST http://localhost:5001/availability/validate \
  -H "Content-Type: application/json" \
  -d '{
    "venueId": 1,
    "serviceId": 2,
    "bookingDate": "2025-10-20",
    "startTime": "19:00",
    "endTime": "21:00",
    "partySize": 4
  }'

# Buchungsanfrage validieren (Friseursalon mit Staff)
curl -X POST http://localhost:5001/availability/validate \
  -H "Content-Type: application/json" \
  -d '{
    "venueId": 2,
    "serviceId": 4,
    "staffMemberId": 1,
    "bookingDate": "2025-10-20",
    "startTime": "10:00",
    "endTime": "10:45",
    "partySize": 1
  }'

# Service Details abrufen (Service ID: 2, Venue ID: 1)
curl "http://localhost:5001/availability/service/2?venueId=1"

# Service Details abrufen (Service ID: 4, Venue ID: 2)
curl "http://localhost:5001/availability/service/4?venueId=2"

# Prüfen ob Mitarbeiter Service durchführen kann
# Staff ID: 1, Service ID: 4 (Herrenhaarschnitt)
curl http://localhost:5001/availability/staff/1/can-perform/4

# Staff ID: 2, Service ID: 5 (Damenhaarschnitt - sollte false sein)
curl http://localhost:5001/availability/staff/2/can-perform/5