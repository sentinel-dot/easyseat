/**
 * Format date as YYYY-MM-DD for API
 */
export function formatDateForApi(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Today at start of day (local)
 */
export function today(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Add days to date
 */
export function addDays(date: Date, days: number): Date {
  const out = new Date(date);
  out.setDate(out.getDate() + days);
  return out;
}

/**
 * Date string (YYYY-MM-DD) to display (e.g. "Mo, 12. Februar")
 */
export function formatDateDisplay(iso: string): string {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("de-DE", {
    weekday: "short",
    day: "numeric",
    month: "long",
  });
}

/**
 * Time string (HH:mm) to display (e.g. "14:30 Uhr")
 */
export function formatTimeDisplay(time: string): string {
  return `${time} Uhr`;
}
