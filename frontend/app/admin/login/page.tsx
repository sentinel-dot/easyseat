"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { login } from "@/lib/api/admin";
import { Button } from "@/components/shared/button";
import { Input } from "@/components/shared/input";

export default function AdminLoginPage() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("E-Mail und Passwort eingeben.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await login(email.trim(), password);
      if (res.success || res.data?.user) {
        toast.success("Angemeldet.");
        window.location.replace(redirect);
        return;
      } else {
        toast.error(res.message ?? "Anmeldung fehlgeschlagen.");
      }
    } catch {
      toast.error("Anmeldung fehlgeschlagen.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-page)] px-4">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="font-display text-xl text-[var(--color-text)] hover:opacity-80"
        >
          easyseat
        </Link>
        <h1 className="mt-8 font-display text-2xl text-[var(--color-text)]">
          Admin-Anmeldung
        </h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Melden Sie sich mit Ihrem Konto an.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input
            label="E-Mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@beispiel.de"
            autoComplete="email"
            required
          />
          <Input
            label="Passwort"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
          <Button type="submit" className="w-full" isLoading={isLoading}>
            Anmelden
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-[var(--color-muted)]">
          <Link href="/" className="hover:text-[var(--color-accent)]">
            ← Zur Startseite
          </Link>
        </p>
      </div>
    </div>
  );
}
