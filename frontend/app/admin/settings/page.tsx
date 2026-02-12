"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  getVenueSettings,
  updateVenueSettings,
  changePassword,
} from "@/lib/api/dashboard";
import type { Venue } from "@/lib/types";
import { Card, CardTitle } from "@/components/shared/card";
import { Button } from "@/components/shared/button";
import { Input } from "@/components/shared/input";
import { PageLoader } from "@/components/shared/loading-spinner";
import { ErrorMessage } from "@/components/shared/error-message";

export default function AdminSettingsPage() {
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [venueSaving, setVenueSaving] = useState(false);
  const [venueForm, setVenueForm] = useState({
    booking_advance_hours: 48,
    cancellation_hours: 24,
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordSaving, setPasswordSaving] = useState(false);

  const loadVenue = useCallback(() => {
    setLoading(true);
    setError(null);
    getVenueSettings()
      .then((res) => {
        if (res.success && res.data) {
          setVenue(res.data);
          setVenueForm({
            booking_advance_hours: res.data.booking_advance_hours ?? 48,
            cancellation_hours: res.data.cancellation_hours ?? 24,
          });
        } else setError(res.message ?? "Fehler beim Laden.");
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadVenue();
  }, [loadVenue]);

  const handleVenueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVenueSaving(true);
    try {
      const res = await updateVenueSettings({
        booking_advance_hours: venueForm.booking_advance_hours,
        cancellation_hours: venueForm.cancellation_hours,
      });
      if (res.success) {
        toast.success("Einstellungen gespeichert.");
        loadVenue();
      } else {
        toast.error(res.message ?? "Speichern fehlgeschlagen.");
      }
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setVenueSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Neues Passwort und Bestätigung stimmen nicht überein.");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error("Neues Passwort muss mindestens 8 Zeichen haben.");
      return;
    }
    setPasswordSaving(true);
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
      setPasswordSaving(false);
    }
  };

  if (error) {
    return <ErrorMessage message={error} onRetry={loadVenue} />;
  }

  if (loading || !venue) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-[var(--color-text)]">
          Einstellungen
        </h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Buchungsregeln und Ihr Konto.
        </p>
      </div>

      {/* Venue / Buchungsregeln */}
      <Card className="p-6">
        <CardTitle className="text-lg">Buchungsregeln</CardTitle>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Venue: {venue.name}
        </p>
        <form onSubmit={handleVenueSubmit} className="mt-6 space-y-4 max-w-md">
          <Input
            label="Buchung mindestens … Stunden im Voraus"
            type="number"
            min={0}
            value={venueForm.booking_advance_hours ?? ""}
            onChange={(e) =>
              setVenueForm((f) => ({
                ...f,
                booking_advance_hours: parseInt(e.target.value, 10) || 0,
              }))
            }
          />
          <p className="text-xs text-[var(--color-muted)]">
            Kunden können nur Termine buchen, die mindestens so viele Stunden in der Zukunft liegen.
          </p>
          <Input
            label="Stornierung bis … Stunden vor Termin"
            type="number"
            min={0}
            value={venueForm.cancellation_hours ?? ""}
            onChange={(e) =>
              setVenueForm((f) => ({
                ...f,
                cancellation_hours: parseInt(e.target.value, 10) || 0,
              }))
            }
          />
          <p className="text-xs text-[var(--color-muted)]">
            Kunden können bis zu dieser Stunde vor dem Termin kostenfrei stornieren.
          </p>
          <Button type="submit" isLoading={venueSaving}>
            Buchungsregeln speichern
          </Button>
        </form>
      </Card>

      {/* Passwort ändern */}
      <Card id="password" className="p-6 scroll-mt-6">
        <CardTitle className="text-lg">Passwort ändern</CardTitle>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Ändern Sie das Passwort Ihres Admin-Kontos.
        </p>
        <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-4 max-w-md">
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
          <Button type="submit" isLoading={passwordSaving}>
            Passwort ändern
          </Button>
        </form>
      </Card>
    </div>
  );
}
