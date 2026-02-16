# Database migrations

- **New installs**: Use the main `schema.sql`; it already includes customer tables, `customer_id` on bookings, and `loyalty_config`.
- **Existing databases**:
  - If you created the database before customer accounts were added, run `001_customer_accounts.sql` once. If your `bookings` table already has a `customer_id` column (e.g. from a restored backup of the new schema), comment out or skip the `ALTER TABLE bookings` block in that file to avoid duplicate column errors.
  - Run `002_loyalty_config.sql` once to persist the Bonuspunkte-Konfiguration in the database (admin-editable settings survive server restarts).
