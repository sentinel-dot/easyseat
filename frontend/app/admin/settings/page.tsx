"use client";

import { useState } from "react";
import { toast } from "sonner";
import { changePassword } from "@/lib/api/auth";
import { Card, CardTitle } from "@/components/shared/card";
import { Button } from "@/components/shared/button";
import { Input } from "@/components/shared/input";

export default function AdminSettingsPage() {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Neues Passwort und Bestätigung stimmen nicht überein.");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error("Neues Passwort muss mindestens 8 Zeichen haben.");
      return;
    }
    setSaving(true);
    try {
      const res = await changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword
      );
      if (res.success) {
        toast.success("Passwort geändert.");
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        toast.error(res.message ?? "Passwortänderung fehlgeschlagen.");
      }
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-[var(--color-text)]">
          Einstellungen
        </h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Passwort für Ihr Admin-Konto ändern.
        </p>
      </div>

      <Card id="password" className="p-6 scroll-mt-6">
        <CardTitle className="text-lg">Passwort ändern</CardTitle>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4 max-w-md">
          <Input
            label="Aktuelles Passwort"
            type="password"
            value={passwordForm.currentPassword}
            onChange={(e) =>
              setPasswordForm((f) => ({ ...f, currentPassword: e.target.value }))
            }
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
          <Input
            label="Neues Passwort"
            type="password"
            value={passwordForm.newPassword}
            onChange={(e) =>
              setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))
            }
            placeholder="Mindestens 8 Zeichen"
            autoComplete="new-password"
            minLength={8}
            required
          />
          <Input
            label="Neues Passwort bestätigen"
            type="password"
            value={passwordForm.confirmPassword}
            onChange={(e) =>
              setPasswordForm((f) => ({ ...f, confirmPassword: e.target.value }))
            }
            placeholder="••••••••"
            autoComplete="new-password"
            required
          />
          <Button type="submit" isLoading={saving}>
            Passwort ändern
          </Button>
        </form>
      </Card>
    </div>
  );
}
