"use client";

import { useState } from "react";
import Link from "next/link";
import { useCustomerAuthOptional } from "@/contexts/CustomerAuthContext";
import { RegisterDialog } from "./RegisterDialog";

type Props = {
  /** Pre-filled email from the booking (for registration) */
  customerEmail?: string;
};

export function PostBookingRegisterPrompt({ customerEmail = "" }: Props) {
  const auth = useCustomerAuthOptional();
  const [registerOpen, setRegisterOpen] = useState(false);

  if (!auth) return null;
  if (auth.isLoading || auth.isAuthenticated) return null;

  return (
    <>
      <div className="mt-8 rounded-xl border border-[var(--color-accent)]/40 bg-[var(--color-accent-muted)]/30 p-4 text-center">
        <p className="text-sm font-medium text-[var(--color-text)]">
          Konto erstellen und Buchungen immer im Überblick haben
        </p>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Mit einem Konto sehen Sie alle Buchungen, speichern Favoriten und sammeln Treuepunkte.
        </p>
        <button
          type="button"
          onClick={() => setRegisterOpen(true)}
          className="mt-4 inline-flex h-10 items-center justify-center rounded-lg bg-[var(--color-accent)] px-4 text-sm font-semibold text-white hover:bg-[var(--color-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
        >
          Kostenlos Konto erstellen
        </button>
      </div>
      <RegisterDialog
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        prefilledEmail={customerEmail}
      />
    </>
  );
}
