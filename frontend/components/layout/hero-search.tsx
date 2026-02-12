"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
const DEFAULT_PARTY_SIZE = 2;

function getDefaultDate(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

function getDefaultTime(): string {
  const d = new Date();
  const h = d.getHours();
  const m = d.getMinutes();
  const nextSlot = m < 30 ? 0 : 30;
  return `${String(h).padStart(2, "0")}:${String(nextSlot).padStart(2, "0")}`;
}

export function HeroSearch() {
  const router = useRouter();
  const [date, setDate] = useState(getDefaultDate());
  const [time, setTime] = useState(getDefaultTime());
  const [partySize, setPartySize] = useState(DEFAULT_PARTY_SIZE);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (date) params.set("date", date);
    if (time) params.set("time", time);
    if (partySize > 0) params.set("party_size", String(partySize));
    const query = params.toString();
    router.push(query ? `/venues?${query}` : "/venues");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto mt-8 max-w-2xl rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-sm)] sm:flex sm:flex-wrap sm:items-end sm:gap-3 sm:p-4"
      aria-label="Suche nach Termin"
    >
      <div className="grid gap-4 sm:flex-1 sm:grid-cols-3 sm:gap-3">
        <div>
          <label htmlFor="hero-date" className="mb-1 block text-xs font-medium text-[var(--color-muted)]">
            Datum
          </label>
          <input
            id="hero-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={getDefaultDate()}
            className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-0"
          />
        </div>
        <div>
          <label htmlFor="hero-time" className="mb-1 block text-xs font-medium text-[var(--color-muted)]">
            Uhrzeit
          </label>
          <input
            id="hero-time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            step={900}
            className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-0"
          />
        </div>
        <div>
          <label htmlFor="hero-party" className="mb-1 block text-xs font-medium text-[var(--color-muted)]">
            Gäste
          </label>
          <select
            id="hero-party"
            value={partySize}
            onChange={(e) => setPartySize(Number(e.target.value))}
            className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-0"
          >
            {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "Gast" : "Gäste"}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-4 sm:mt-0">
        <button
          type="submit"
          className="btn-primary w-full rounded-md bg-[var(--color-accent)] px-6 py-2.5 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 sm:w-auto"
        >
          Tisch finden
        </button>
      </div>
    </form>
  );
}
