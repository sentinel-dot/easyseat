"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/shared/button";
import { Input } from "@/components/shared/input";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  switchToLogin?: () => void;
  prefilledEmail?: string;
};

export function RegisterDialog({
  open,
  onClose,
  onSuccess,
  switchToLogin,
  prefilledEmail = "",
}: Props) {
  const { register } = useCustomerAuth();
  const [email, setEmail] = useState(prefilledEmail);
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && prefilledEmail) setEmail(prefilledEmail);
  }, [open, prefilledEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password || !name.trim()) {
      toast.error("E-Mail, Passwort und Name sind erforderlich.");
      return;
    }
    if (password.length < 8) {
      toast.error("Passwort muss mindestens 8 Zeichen haben.");
      return;
    }
    setLoading(true);
    try {
      const result = await register({
        email: email.trim(),
        password,
        name: name.trim(),
        phone: phone.trim() || undefined,
      });
      if (result.success) {
        toast.success("Konto erstellt. Sie sind angemeldet.");
        onSuccess?.();
        onClose();
        setEmail("");
        setPassword("");
        setName("");
        setPhone("");
      } else {
        toast.error(result.message ?? "Registrierung fehlgeschlagen.");
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
        aria-labelledby="register-title"
        className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-xl"
      >
        <h2 id="register-title" className="text-xl font-semibold text-[var(--color-text)]">
          Konto erstellen
        </h2>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Speichern Sie Favoriten, Buchungshistorie und sammeln Sie Punkte.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input
            type="text"
            label="Name"
            placeholder="Max Mustermann"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
          />
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
            label="Passwort (min. 8 Zeichen)"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
          <Input
            type="tel"
            label="Telefon (optional)"
            placeholder="+49 123 456789"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
          />
          <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-between">
            <Button type="submit" isLoading={loading} disabled={loading} className="flex-1 sm:flex-none">
              Registrieren
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Abbrechen
            </Button>
          </div>
        </form>
        {switchToLogin && (
          <p className="mt-4 text-center text-sm text-[var(--color-muted)]">
            Bereits ein Konto?{" "}
            <button
              type="button"
              onClick={switchToLogin}
              className="font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]"
            >
              Anmelden
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
