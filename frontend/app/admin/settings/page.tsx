"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { changePassword } from "@/lib/api/auth";
import { getLoyaltyConfig, updateLoyaltyConfig, type LoyaltyConfig } from "@/lib/api/admin";
import { Card, CardTitle } from "@/components/shared/card";
import { Button } from "@/components/shared/button";
import { Input } from "@/components/shared/input";

export default function AdminSettingsPage() {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loyaltyConfig, setLoyaltyConfig] = useState<LoyaltyConfig>({
    BOOKING_COMPLETED: 10,
    BOOKING_WITH_REVIEW: 5,
    WELCOME_BONUS: 50,
    POINTS_PER_EURO: 1,
  });
  const [saving, setSaving] = useState(false);
  const [savingLoyalty, setSavingLoyalty] = useState(false);
  const [loadingLoyalty, setLoadingLoyalty] = useState(true);

  useEffect(() => {
    loadLoyaltyConfig();
  }, []);

  const loadLoyaltyConfig = async () => {
    setLoadingLoyalty(true);
    try {
      const response = await getLoyaltyConfig();
      if (response.success && response.data) {
        setLoyaltyConfig(response.data);
      } else {
        toast.error(response.message || "Fehler beim Laden der Bonuspunkte-Konfiguration");
      }
    } catch (err) {
      toast.error("Fehler beim Laden der Bonuspunkte-Konfiguration");
    } finally {
      setLoadingLoyalty(false);
    }
  };

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

  const handleLoyaltySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingLoyalty(true);
    try {
      const response = await updateLoyaltyConfig(loyaltyConfig);
      if (response.success) {
        toast.success("Bonuspunkte-Konfiguration aktualisiert");
        if (response.data) {
          setLoyaltyConfig(response.data);
        }
      } else {
        toast.error(response.message || "Fehler beim Aktualisieren");
      }
    } catch (err) {
      toast.error("Fehler beim Aktualisieren der Bonuspunkte-Konfiguration");
    } finally {
      setSavingLoyalty(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-[var(--color-text)]">
          Einstellungen
        </h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Passwort ändern und Bonuspunkte-System konfigurieren.
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

      <Card id="loyalty" className="p-6 scroll-mt-6">
        <CardTitle className="text-lg">Bonuspunkte-Konfiguration</CardTitle>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Legen Sie fest, wie viele Bonuspunkte Kunden für verschiedene Aktionen erhalten.
        </p>
        
        {loadingLoyalty ? (
          <div className="mt-6 flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-accent)]" />
          </div>
        ) : (
          <form onSubmit={handleLoyaltySubmit} className="mt-6 space-y-4 max-w-md">
            <div>
              <Input
                label="Punkte pro abgeschlossener Buchung"
                type="number"
                min="0"
                value={loyaltyConfig.BOOKING_COMPLETED}
                onChange={(e) =>
                  setLoyaltyConfig((c) => ({
                    ...c,
                    BOOKING_COMPLETED: parseInt(e.target.value) || 0,
                  }))
                }
                required
              />
              <p className="mt-1 text-xs text-[var(--color-muted)]">
                Basis-Punkte, die Kunden bei jeder abgeschlossenen Buchung erhalten
              </p>
            </div>

            <div>
              <Input
                label="Bonus-Punkte für Bewertung"
                type="number"
                min="0"
                value={loyaltyConfig.BOOKING_WITH_REVIEW}
                onChange={(e) =>
                  setLoyaltyConfig((c) => ({
                    ...c,
                    BOOKING_WITH_REVIEW: parseInt(e.target.value) || 0,
                  }))
                }
                required
              />
              <p className="mt-1 text-xs text-[var(--color-muted)]">
                Zusätzliche Punkte, wenn der Kunde eine Bewertung abgibt
              </p>
            </div>

            <div>
              <Input
                label="Willkommensbonus für Neukunden"
                type="number"
                min="0"
                value={loyaltyConfig.WELCOME_BONUS}
                onChange={(e) =>
                  setLoyaltyConfig((c) => ({
                    ...c,
                    WELCOME_BONUS: parseInt(e.target.value) || 0,
                  }))
                }
                required
              />
              <p className="mt-1 text-xs text-[var(--color-muted)]">
                Einmalige Punkte bei Registrierung eines neuen Kundenkontos
              </p>
            </div>

            <div>
              <Input
                label="Punkte pro ausgegebenem Euro"
                type="number"
                min="0"
                step="0.1"
                value={loyaltyConfig.POINTS_PER_EURO}
                onChange={(e) =>
                  setLoyaltyConfig((c) => ({
                    ...c,
                    POINTS_PER_EURO: parseFloat(e.target.value) || 0,
                  }))
                }
                required
              />
              <p className="mt-1 text-xs text-[var(--color-muted)]">
                Zusätzliche Punkte basierend auf dem Buchungsbetrag (z.B. 1 Punkt pro Euro)
              </p>
            </div>

            <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
              <h4 className="text-sm font-medium text-amber-900 mb-2">Beispielrechnung</h4>
              <p className="text-xs text-amber-800">
                Bei einer Buchung über €50:
              </p>
              <ul className="mt-2 text-xs text-amber-800 space-y-1">
                <li>• Basis-Punkte: {loyaltyConfig.BOOKING_COMPLETED}</li>
                <li>• Betrag-basiert: {Math.floor(50 * loyaltyConfig.POINTS_PER_EURO)}</li>
                <li>• Mit Bewertung: +{loyaltyConfig.BOOKING_WITH_REVIEW}</li>
                <li className="font-medium pt-1 border-t border-amber-300">
                  Gesamt: {loyaltyConfig.BOOKING_COMPLETED + Math.floor(50 * loyaltyConfig.POINTS_PER_EURO)} 
                  {" ("}bzw. {loyaltyConfig.BOOKING_COMPLETED + Math.floor(50 * loyaltyConfig.POINTS_PER_EURO) + loyaltyConfig.BOOKING_WITH_REVIEW} mit Bewertung{")"}
                </li>
              </ul>
            </div>

            <Button type="submit" isLoading={savingLoyalty}>
              Konfiguration speichern
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
