'use client';

import { useEffect, useState } from 'react';
import { getStats } from '@/lib/api/admin';
import type { AdminStats } from '@/lib/types';

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
    }).format(amount);
}

function formatHour(hour: number): string {
    return `${hour.toString().padStart(2, '0')}:00`;
}

export default function AdminStatsPage() {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadStats();
    }, []);

    async function loadStats() {
        setLoading(true);
        setError('');

        try {
            const result = await getStats();

            if (result.success && result.data) {
                setStats(result.data);
            } else {
                setError(result.message || 'Fehler beim Laden der Statistiken');
            }
        } catch (err) {
            setError((err as Error).message || 'Fehler beim Laden der Statistiken');
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                {error}
                <button onClick={loadStats} className="ml-2 underline">Erneut versuchen</button>
            </div>
        );
    }

    const maxServiceRevenue = Math.max(
        ...stats?.popularServices.map((s) => s.total_revenue) || [1]
    );

    const maxTimeSlotCount = Math.max(
        ...stats?.popularTimeSlots.map((t) => t.booking_count) || [1]
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold text-gray-900">Statistiken</h1>
                <p className="text-gray-600">Übersicht über Buchungen und Umsätze</p>
            </div>

            {/* Booking Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Heute</p>
                            <p className="text-3xl font-semibold text-gray-900 mt-1">
                                {stats?.bookings.today || 0}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">Buchungen</p>
                        </div>
                        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                            <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Diese Woche</p>
                            <p className="text-3xl font-semibold text-gray-900 mt-1">
                                {stats?.bookings.thisWeek || 0}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">Buchungen</p>
                        </div>
                        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                            <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Dieser Monat</p>
                            <p className="text-3xl font-semibold text-gray-900 mt-1">
                                {stats?.bookings.thisMonth || 0}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">Buchungen</p>
                        </div>
                        <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
                            <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Umsatz (Monat)</p>
                            <p className="text-2xl font-semibold text-gray-900 mt-1">
                                {formatCurrency(stats?.revenue.thisMonth || 0)}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                Gesamt: {formatCurrency(stats?.revenue.total || 0)}
                            </p>
                        </div>
                        <div className="w-14 h-14 rounded-full bg-yellow-100 flex items-center justify-center">
                            <svg className="w-7 h-7 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Overview */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="font-semibold text-gray-900 mb-4">Buchungsstatus</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-yellow-50 rounded-lg">
                        <p className="text-2xl font-semibold text-yellow-700">{stats?.bookings.pending || 0}</p>
                        <p className="text-sm text-yellow-600">Ausstehend</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-2xl font-semibold text-green-700">{stats?.bookings.confirmed || 0}</p>
                        <p className="text-sm text-green-600">Bestätigt</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-semibold text-blue-700">{stats?.bookings.completed || 0}</p>
                        <p className="text-sm text-blue-600">Abgeschlossen</p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg">
                        <p className="text-2xl font-semibold text-red-700">{stats?.bookings.cancelled || 0}</p>
                        <p className="text-sm text-red-600">Storniert</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Popular Services */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h2 className="font-semibold text-gray-900 mb-4">Beliebte Services</h2>
                    
                    {stats?.popularServices.length === 0 ? (
                        <p className="text-gray-500 text-sm">Keine Daten verfügbar</p>
                    ) : (
                        <div className="space-y-4">
                            {stats?.popularServices.map((service, index) => (
                                <div key={service.service_id}>
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                                            <span className="text-sm font-medium text-gray-900">{service.service_name}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-sm font-medium text-gray-900">{formatCurrency(service.total_revenue)}</span>
                                            <span className="text-xs text-gray-500 ml-2">({service.booking_count} Buchungen)</span>
                                        </div>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary rounded-full transition-all"
                                            style={{ width: `${(service.total_revenue / maxServiceRevenue) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Popular Time Slots */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h2 className="font-semibold text-gray-900 mb-4">Beliebte Uhrzeiten</h2>
                    
                    {stats?.popularTimeSlots.length === 0 ? (
                        <p className="text-gray-500 text-sm">Keine Daten verfügbar</p>
                    ) : (
                        <div className="space-y-3">
                            {stats?.popularTimeSlots.slice(0, 8).map((slot) => (
                                <div key={slot.hour} className="flex items-center gap-3">
                                    <span className="w-14 text-sm text-gray-600">{formatHour(slot.hour)}</span>
                                    <div className="flex-1 h-6 bg-gray-100 rounded overflow-hidden">
                                        <div
                                            className="h-full bg-green-500 rounded flex items-center justify-end pr-2"
                                            style={{ width: `${(slot.booking_count / maxTimeSlotCount) * 100}%` }}
                                        >
                                            <span className="text-xs text-white font-medium">{slot.booking_count}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Revenue Summary */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="font-semibold text-gray-900 mb-4">Umsatzübersicht</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">Heute</p>
                        <p className="text-xl font-semibold text-gray-900 mt-1">
                            {formatCurrency(stats?.revenue.today || 0)}
                        </p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">Diese Woche</p>
                        <p className="text-xl font-semibold text-gray-900 mt-1">
                            {formatCurrency(stats?.revenue.thisWeek || 0)}
                        </p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">Dieser Monat</p>
                        <p className="text-xl font-semibold text-gray-900 mt-1">
                            {formatCurrency(stats?.revenue.thisMonth || 0)}
                        </p>
                    </div>
                    <div className="text-center p-4 bg-primary/10 rounded-lg">
                        <p className="text-sm text-primary">Gesamt</p>
                        <p className="text-xl font-semibold text-primary mt-1">
                            {formatCurrency(stats?.revenue.total || 0)}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
