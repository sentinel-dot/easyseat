'use client';

import { useEffect, useState } from 'react';
import { getVenueSettings, updateVenueSettings, changePassword } from '@/lib/api/admin';
import { Venue } from '@/lib/types';

export default function SettingsPage() {
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [bookingAdvanceHours, setBookingAdvanceHours] = useState<number>(48);
  const [cancellationHours, setCancellationHours] = useState<number>(24);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getVenueSettings();
      
      if (response.success && response.data) {
        setVenue(response.data);
        setBookingAdvanceHours(response.data.booking_advance_hours);
        setCancellationHours(response.data.cancellation_hours);
      } else {
        setError(response.message || 'Fehler beim Laden der Einstellungen');
      }
    } catch (err) {
      setError((err as Error).message || 'Fehler beim Laden der Einstellungen');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const response = await updateVenueSettings({
        booking_advance_hours: bookingAdvanceHours,
        cancellation_hours: cancellationHours,
      });

      if (response.success) {
        setSuccess('Einstellungen erfolgreich gespeichert');
        await loadSettings();
      } else {
        setError(response.message || 'Fehler beim Speichern');
      }
    } catch (err) {
      setError((err as Error).message || 'Fehler beim Speichern');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== newPasswordConfirm) {
      setPasswordError('Neues Passwort und Bestätigung stimmen nicht überein');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('Neues Passwort muss mindestens 8 Zeichen haben');
      return;
    }
    try {
      setPasswordSaving(true);
      setPasswordError(null);
      setPasswordSuccess(null);
      const response = await changePassword(currentPassword, newPassword);
      if (response.success) {
        setPasswordSuccess(response.message || 'Passwort erfolgreich geändert');
        setCurrentPassword('');
        setNewPassword('');
        setNewPasswordConfirm('');
      } else {
        setPasswordError(response.message || 'Fehler beim Ändern des Passworts');
      }
    } catch (err) {
      setPasswordError((err as Error).message || 'Fehler beim Ändern des Passworts');
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="bg-white rounded-lg shadow p-6 space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">
          Buchungsrichtlinien
        </h1>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded">
            {success}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {/* Venue Info */}
          <div className="pb-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">{venue?.name}</h2>
            <p className="text-sm text-gray-500">{venue?.email}</p>
          </div>

          {/* Booking Advance Hours */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mindestvorlaufzeit für Buchungen
            </label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                min="0"
                step="1"
                value={bookingAdvanceHours}
                onChange={(e) => setBookingAdvanceHours(parseInt(e.target.value) || 0)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <span className="text-gray-600 font-medium">Stunden</span>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Kunden können nur Termine buchen, die mindestens <strong>{bookingAdvanceHours} Stunden</strong> in der Zukunft liegen.
              <br />
              <span className="text-primary font-medium">Hinweis:</span> Als Admin können Sie im Dashboard auch kurzfristigere Termine manuell anlegen.
            </p>
          </div>

          {/* Cancellation Hours */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stornierungsfrist
            </label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                min="0"
                step="1"
                value={cancellationHours}
                onChange={(e) => setCancellationHours(parseInt(e.target.value) || 0)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <span className="text-gray-600 font-medium">Stunden</span>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Kunden können Termine nur stornieren, wenn noch mindestens <strong>{cancellationHours} Stunden</strong> bis zum Termin verbleiben.
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">
              💡 Empfohlene Werte
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li><strong>Mindestvorlaufzeit:</strong> 24-48 Stunden (verhindert Last-Minute-Buchungen, die dann nicht mehr stornierbar sind)</li>
              <li><strong>Stornierungsfrist:</strong> 24 Stunden (gibt Ihnen Zeit, den Slot neu zu vergeben)</li>
            </ul>
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-primary text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {saving ? 'Speichern...' : 'Einstellungen speichern'}
            </button>
          </div>
        </div>

        {/* Passwort ändern */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Passwort ändern
          </h2>
          {passwordError && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
              {passwordError}
            </div>
          )}
          {passwordSuccess && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded">
              {passwordSuccess}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Aktuelles Passwort
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Neues Passwort
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Mindestens 8 Zeichen"
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Neues Passwort bestätigen
              </label>
              <input
                type="password"
                value={newPasswordConfirm}
                onChange={(e) => setNewPasswordConfirm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>
            <button
              onClick={handleChangePassword}
              disabled={passwordSaving || !currentPassword || !newPassword || !newPasswordConfirm}
              className="w-full bg-gray-800 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {passwordSaving ? 'Wird geändert...' : 'Passwort ändern'}
            </button>
          </div>
        </div>

        {/* Example Scenarios */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Beispiel-Szenarien (mit aktuellen Einstellungen)
          </h3>
          
          <div className="space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <span className="text-green-600 text-xl">✓</span>
              <div>
                <p className="font-medium text-gray-900">Kunde bucht heute um 10:00 Uhr einen Termin für übermorgen um 15:00 Uhr</p>
                <p className="text-gray-600">Das sind {Math.floor((48 + 5) / 24)} Tage = ~{48 + 5} Stunden Vorlauf → <strong className="text-green-600">Buchung möglich</strong></p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-red-600 text-xl">✗</span>
              <div>
                <p className="font-medium text-gray-900">Kunde bucht heute um 10:00 Uhr einen Termin für morgen um 8:00 Uhr</p>
                <p className="text-gray-600">Das sind nur ~22 Stunden Vorlauf → <strong className="text-red-600">Buchung nicht möglich</strong></p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-blue-600 text-xl">⚡</span>
              <div>
                <p className="font-medium text-gray-900">Sie als Admin können im Dashboard auch für heute noch Termine anlegen</p>
                <p className="text-gray-600">Nützlich für Walk-ins, Familie oder Notfälle → <strong className="text-blue-600">Immer möglich</strong></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
