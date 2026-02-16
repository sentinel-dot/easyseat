"use client";

import { useState } from "react";
import { Button } from "@/components/shared/button";
import { Input } from "@/components/shared/input";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  switchToRegister?: () => void;
};

export function LoginDialog({ open, onClose, onSuccess, switchToRegister }: Props) {
  const { login } = useCustomerAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("E-Mail und Passwort eingeben.");
      return;
    }
    setLoading(true);
    try {
      const result = await login({ email: email.trim(), password });
      if (result.success) {
        toast.success("Erfolgreich angemeldet.");
        onSuccess?.();
        onClose();
        setEmail("");
        setPassword("");
      } else {
        toast.error(result.message ?? "Anmeldung fehlgeschlagen.");
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" aria-hidden onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-title"
        className="relative w-full max-w-md rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-xl"
      >
        <h2 id="login-title" className="text-xl font-semibold text-[var(--color-text)]">
          Anmelden
        </h2>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Melden Sie sich an, um Favoriten und Buchungshistorie zu nutzen.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input
            type="email"
            label="E-Mail"
            placeholder="ihre@email.de"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <Input
            type="password"
            label="Passwort"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-between">
            <Button type="submit" isLoading={loading} disabled={loading} className="flex-1 sm:flex-none">
              Anmelden
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Abbrechen
            </Button>
          </div>
        </form>
        {switchToRegister && (
          <p className="mt-4 text-center text-sm text-[var(--color-muted)]">
            Noch kein Konto?{" "}
            <button
              type="button"
              onClick={switchToRegister}
              className="font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]"
            >
              Jetzt registrieren
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
