'use client';

import { useEffect, useState } from 'react';
import { getServices, updateService, getAvailabilityRules, updateAvailabilityRule } from '@/lib/api/admin';
import type { Service, AvailabilityRule } from '@/lib/types';

function formatCurrency(amount: number | null | undefined): string {
    if (amount == null) return '-';
    return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
    }).format(amount);
}

function formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes} Min.`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

const DAY_NAMES = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

export default function AdminServicesPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [availabilityRules, setAvailabilityRules] = useState<AvailabilityRule[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Edit state
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [editForm, setEditForm] = useState({
        name: '',
        description: '',
        duration_minutes: 0,
        price: 0,
        is_active: true,
    });
    const [saving, setSaving] = useState(false);

    // Availability edit state
    const [editingRule, setEditingRule] = useState<AvailabilityRule | null>(null);
    const [ruleForm, setRuleForm] = useState({
        start_time: '',
        end_time: '',
        is_active: true,
    });

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        setError('');

        try {
            const [servicesResult, rulesResult] = await Promise.all([
                getServices(),
                getAvailabilityRules(),
            ]);

            if (servicesResult.success && servicesResult.data) {
                setServices(servicesResult.data);
            }

            if (rulesResult.success && rulesResult.data) {
                setAvailabilityRules(rulesResult.data);
            }
        } catch (err) {
            setError((err as Error).message || 'Fehler beim Laden der Daten');
        } finally {
            setLoading(false);
        }
    }

    function openEditService(service: Service) {
        setEditingService(service);
        setEditForm({
            name: service.name,
            description: service.description || '',
            duration_minutes: service.duration_minutes,
            price: service.price || 0,
            is_active: service.is_active,
        });
    }

    async function handleSaveService() {
        if (!editingService) return;

        setSaving(true);
        try {
            const result = await updateService(editingService.id, editForm);

            if (result.success && result.data) {
                setServices((prev) =>
                    prev.map((s) => (s.id === editingService.id ? result.data! : s))
                );
                setEditingService(null);
            } else {
                setError(result.message || 'Fehler beim Speichern');
            }
        } catch (err) {
            setError((err as Error).message || 'Fehler beim Speichern');
        } finally {
            setSaving(false);
        }
    }

    function openEditRule(rule: AvailabilityRule) {
        setEditingRule(rule);
        setRuleForm({
            start_time: rule.start_time,
            end_time: rule.end_time,
            is_active: rule.is_active,
        });
    }

    async function handleSaveRule() {
        if (!editingRule) return;

        setSaving(true);
        try {
            const result = await updateAvailabilityRule(editingRule.id, ruleForm);

            if (result.success) {
                setAvailabilityRules((prev) =>
                    prev.map((r) =>
                        r.id === editingRule.id
                            ? { ...r, ...ruleForm }
                            : r
                    )
                );
                setEditingRule(null);
            } else {
                setError(result.message || 'Fehler beim Speichern');
            }
        } catch (err) {
            setError((err as Error).message || 'Fehler beim Speichern');
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold text-gray-900">Services & Verfügbarkeit</h1>
                <p className="text-gray-600">Verwalten Sie Ihre Services und Arbeitszeiten</p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                    {error}
                    <button onClick={() => setError('')} className="ml-2 underline">Schließen</button>
                </div>
            )}

            {/* Services Section */}
            <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-5 border-b border-gray-200">
                    <h2 className="font-semibold text-gray-900">Services</h2>
                    <p className="text-sm text-gray-500">Bearbeiten Sie Preise und Dauer</p>
                </div>

                <div className="divide-y divide-gray-100">
                    {services.length === 0 ? (
                        <div className="p-5 text-center text-gray-500">
                            Keine Services vorhanden
                        </div>
                    ) : (
                        services.map((service) => (
                            <div
                                key={service.id}
                                className={`p-4 flex items-center justify-between ${
                                    !service.is_active ? 'bg-gray-50 opacity-60' : ''
                                }`}
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium text-gray-900">{service.name}</p>
                                        {!service.is_active && (
                                            <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded">
                                                Inaktiv
                                            </span>
                                        )}
                                    </div>
                                    {service.description && (
                                        <p className="text-sm text-gray-500 mt-0.5">{service.description}</p>
                                    )}
                                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                        <span>{formatDuration(service.duration_minutes)}</span>
                                        <span>{formatCurrency(service.price)}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => openEditService(service)}
                                    className="px-3 py-1.5 text-sm text-primary hover:bg-primary/5 rounded-lg transition-colors"
                                >
                                    Bearbeiten
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Availability Section */}
            <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-5 border-b border-gray-200">
                    <h2 className="font-semibold text-gray-900">Arbeitszeiten</h2>
                    <p className="text-sm text-gray-500">Ihre Verfügbarkeiten pro Wochentag</p>
                </div>

                <div className="divide-y divide-gray-100">
                    {availabilityRules.length === 0 ? (
                        <div className="p-5 text-center text-gray-500">
                            Keine Verfügbarkeiten definiert
                        </div>
                    ) : (
                        availabilityRules.map((rule) => (
                            <div
                                key={rule.id}
                                className={`p-4 flex items-center justify-between ${
                                    !rule.is_active ? 'bg-gray-50 opacity-60' : ''
                                }`}
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium text-gray-900">
                                            {DAY_NAMES[rule.day_of_week]}
                                        </p>
                                        {!rule.is_active && (
                                            <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded">
                                                Inaktiv
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600 mt-0.5">
                                        {rule.start_time} - {rule.end_time}
                                    </p>
                                    {rule.staff_member_name && (
                                        <p className="text-sm text-gray-500">{rule.staff_member_name}</p>
                                    )}
                                </div>
                                <button
                                    onClick={() => openEditRule(rule)}
                                    className="px-3 py-1.5 text-sm text-primary hover:bg-primary/5 rounded-lg transition-colors"
                                >
                                    Bearbeiten
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Edit Service Modal */}
            {editingService && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Service bearbeiten</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
                                <textarea
                                    value={editForm.description}
                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Dauer (Min.)</label>
                                    <input
                                        type="number"
                                        value={editForm.duration_minutes}
                                        onChange={(e) => setEditForm({ ...editForm, duration_minutes: parseInt(e.target.value) || 0 })}
                                        min={1}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Preis (EUR)</label>
                                    <input
                                        type="number"
                                        value={editForm.price}
                                        onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) || 0 })}
                                        min={0}
                                        step={0.01}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={editForm.is_active}
                                    onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                                    className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                                />
                                <label htmlFor="is_active" className="text-sm text-gray-700">
                                    Service ist aktiv
                                </label>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setEditingService(null)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Abbrechen
                            </button>
                            <button
                                onClick={handleSaveService}
                                disabled={saving}
                                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
                            >
                                {saving ? 'Wird gespeichert...' : 'Speichern'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Availability Modal */}
            {editingRule && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            {DAY_NAMES[editingRule.day_of_week]} bearbeiten
                        </h3>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start</label>
                                    <input
                                        type="time"
                                        value={ruleForm.start_time}
                                        onChange={(e) => setRuleForm({ ...ruleForm, start_time: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ende</label>
                                    <input
                                        type="time"
                                        value={ruleForm.end_time}
                                        onChange={(e) => setRuleForm({ ...ruleForm, end_time: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="rule_is_active"
                                    checked={ruleForm.is_active}
                                    onChange={(e) => setRuleForm({ ...ruleForm, is_active: e.target.checked })}
                                    className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                                />
                                <label htmlFor="rule_is_active" className="text-sm text-gray-700">
                                    Tag ist aktiv
                                </label>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setEditingRule(null)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Abbrechen
                            </button>
                            <button
                                onClick={handleSaveRule}
                                disabled={saving}
                                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
                            >
                                {saving ? 'Wird gespeichert...' : 'Speichern'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
