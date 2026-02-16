"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import { getProfile, updateProfile, getPreferences, updatePreferences } from "@/lib/api/customers";
import { changePassword } from "@/lib/api/customer-auth";
import { Button } from "@/components/shared/button";
import { Input } from "@/components/shared/input";
import type { CustomerPreferences } from "@/lib/api/customers";

export default function CustomerProfilePage() {
  const { customer, refreshCustomer } = useCustomerAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [prefs, setPrefs] = useState<CustomerPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
    if (customer) {
      setName(customer.name);
      setPhone(customer.phone ?? "");
    }
  }, [customer]);

  useEffect(() => {
    Promise.all([getProfile(), getPreferences()])
      .then(([profileRes, prefsRes]) => {
        if (profileRes.success && profileRes.data) {
          setName(profileRes.data.name);
          setPhone(profileRes.data.phone ?? "");
        }
        if (prefsRes.success && prefsRes.data) setPrefs(prefsRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateProfile({ name, phone });
      if (res.success) {
        toast.success("Profil gespeichert.");
        refreshCustomer();
      } else {
        toast.error(res.message ?? "Speichern fehlgeschlagen.");
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || newPassword.length < 8) {
      toast.error("Aktuelles Passwort und neues Passwort (min. 8 Zeichen) eingeben.");
      return;
    }
    setPasswordSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      toast.success("Passwort geändert.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleSavePrefs = async (updates: Partial<CustomerPreferences>) => {
    if (!prefs) return;
    setSaving(true);
    try {
      const res = await updatePreferences(updates);
      if (res.success && res.data) {
        setPrefs(res.data);
        toast.success("Einstellungen gespeichert.");
      } else {
        toast.error(res.message ?? "Speichern fehlgeschlagen.");
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="h-64 animate-pulse rounded-xl bg-[var(--color-border)]/50" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      <h1 className="font-display text-2xl font-semibold text-[var(--color-text)] sm:text-3xl">
        Profil
      </h1>
      <p className="mt-1 text-[var(--color-muted)]">
        Ihre Kontodaten und Einstellungen.
      </p>

      <form onSubmit={handleSaveProfile} className="mt-8 space-y-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <h2 className="text-lg font-semibold text-[var(--color-text)]">Persönliche Daten</h2>
        <Input label="E-Mail" type="email" value={customer?.email ?? ""} disabled />
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input label="Telefon" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <Button type="submit" isLoading={saving} disabled={saving}>
          Speichern
        </Button>
      </form>

      {prefs && (
        <div className="mt-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <h2 className="text-lg font-semibold text-[var(--color-text)]">Einstellungen</h2>
          <div className="mt-4 flex items-center justify-between gap-4">
            <span className="text-sm text-[var(--color-text)]">Standard-Gästeanzahl</span>
            <select
              value={Math.min(8, Math.max(1, prefs.default_party_size))}
              onChange={(e) => handleSavePrefs({ default_party_size: Number(e.target.value) })}
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)]"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <p className="mt-1 text-xs text-[var(--color-muted)]">Für mehr als 8 Gäste bitte anrufen.</p>
          <div className="mt-4 flex items-center justify-between gap-4">
            <span className="text-sm text-[var(--color-text)]">E-Mail-Benachrichtigungen</span>
            <button
              type="button"
              onClick={() => handleSavePrefs({ notification_email: !prefs.notification_email })}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                prefs.notification_email ? "bg-[var(--color-accent)]" : "bg-[var(--color-border)]"
              }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                  prefs.notification_email ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSavePassword} className="mt-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <h2 className="text-lg font-semibold text-[var(--color-text)]">Passwort ändern</h2>
        <div className="mt-4 space-y-4">
          <Input
            type="password"
            label="Aktuelles Passwort"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="••••••••"
          />
          <Input
            type="password"
            label="Neues Passwort (min. 8 Zeichen)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
            minLength={8}
          />
        </div>
        <Button type="submit" isLoading={passwordSaving} disabled={passwordSaving} className="mt-4">
          Passwort ändern
        </Button>
      </form>
    </div>
  );
}
