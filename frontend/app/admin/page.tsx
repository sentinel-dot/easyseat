'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getStats, getBookings } from '@/lib/api/admin';
import type { AdminStats, BookingWithDetails } from '@/lib/types';

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
    }).format(amount);
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

function getStatusColor(status: string): string {
    switch (status) {
        case 'confirmed':
            return 'bg-green-100 text-green-800';
        case 'pending':
            return 'bg-yellow-100 text-yellow-800';
        case 'cancelled':
            return 'bg-red-100 text-red-800';
        case 'completed':
            return 'bg-blue-100 text-blue-800';
        case 'no_show':
            return 'bg-gray-100 text-gray-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

function getStatusLabel(status: string): string {
    switch (status) {
        case 'confirmed':
            return 'Bestätigt';
        case 'pending':
            return 'Ausstehend';
        case 'cancelled':
            return 'Storniert';
        case 'completed':
            return 'Abgeschlossen';
        case 'no_show':
            return 'Nicht erschienen';
        default:
            return status;
    }
}

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [recentBookings, setRecentBookings] = useState<BookingWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        setError('');

        try {
            const [statsResult, bookingsResult] = await Promise.all([
                getStats(),
                getBookings({ limit: 5 }),
            ]);

            if (statsResult.success && statsResult.data) {
                setStats(statsResult.data);
            }

            if (bookingsResult.success && bookingsResult.data) {
                setRecentBookings(bookingsResult.data);
            }
        } catch (err) {
            setError((err as Error).message || 'Fehler beim Laden der Daten');
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
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">Willkommen im Admin-Bereich</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Bookings Today */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Heute</p>
                            <p className="text-2xl font-semibold text-gray-900 mt-1">
                                {stats?.bookings.today || 0}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Buchungen</p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* This Week */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Diese Woche</p>
                            <p className="text-2xl font-semibold text-gray-900 mt-1">
                                {stats?.bookings.thisWeek || 0}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Buchungen</p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Revenue This Month */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Umsatz (Monat)</p>
                            <p className="text-2xl font-semibold text-gray-900 mt-1">
                                {formatCurrency(stats?.revenue.thisMonth || 0)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                {stats?.bookings.thisMonth || 0} Buchungen
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Pending Bookings – needs confirmation to become active */}
                <Link
                    href="/admin/bookings?status=pending"
                    className={`rounded-xl border p-5 block transition-colors ${
                        (stats?.bookings.pending || 0) > 0
                            ? 'bg-orange-50 border-orange-200 hover:border-orange-300 hover:bg-orange-100'
                            : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Ausstehend</p>
                            <p className="text-2xl font-semibold text-gray-900 mt-1">
                                {stats?.bookings.pending || 0}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                {(stats?.bookings.pending || 0) > 0
                                    ? 'Bitte bestätigen →'
                                    : `${stats?.bookings.confirmed || 0} bestätigt`}
                            </p>
                        </div>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${(stats?.bookings.pending || 0) > 0 ? 'bg-orange-200' : 'bg-orange-100'}`}>
                            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Recent Bookings & Popular Services */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Bookings */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between p-5 border-b border-gray-200">
                        <h2 className="font-semibold text-gray-900">Letzte Buchungen</h2>
                        <Link
                            href="/admin/bookings"
                            className="text-sm text-primary hover:underline"
                        >
                            Alle anzeigen
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {recentBookings.length === 0 ? (
                            <div className="p-5 text-center text-gray-500">
                                Keine Buchungen vorhanden
                            </div>
                        ) : (
                            recentBookings.map((booking) => (
                                <div key={booking.id} className="p-4 hover:bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {booking.customer_name}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {booking.service_name} - {formatDate(booking.booking_date)} um {booking.start_time}
                                            </p>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                                            {getStatusLabel(booking.status)}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Popular Services */}
                <div className="bg-white rounded-xl border border-gray-200">
                    <div className="p-5 border-b border-gray-200">
                        <h2 className="font-semibold text-gray-900">Beliebte Services</h2>
                    </div>
                    <div className="p-5 space-y-4">
                        {stats?.popularServices.length === 0 ? (
                            <p className="text-gray-500 text-sm">Keine Daten verfügbar</p>
                        ) : (
                            stats?.popularServices.map((service, index) => (
                                <div key={service.service_id} className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {service.service_name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {service.booking_count} Buchungen
                                        </p>
                                    </div>
                                    <div className="text-sm font-medium text-gray-900">
                                        {formatCurrency(service.total_revenue)}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link
                    href="/admin/bookings"
                    className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-primary transition-colors"
                >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div>
                        <p className="font-medium text-gray-900">Buchungen</p>
                        <p className="text-xs text-gray-500">Verwalten</p>
                    </div>
                </Link>

                <Link
                    href="/admin/calendar"
                    className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-primary transition-colors"
                >
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                    <div>
                        <p className="font-medium text-gray-900">Kalender</p>
                        <p className="text-xs text-gray-500">Übersicht</p>
                    </div>
                </Link>

                <Link
                    href="/admin/services"
                    className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-primary transition-colors"
                >
                    <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                        <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                    </div>
                    <div>
                        <p className="font-medium text-gray-900">Services</p>
                        <p className="text-xs text-gray-500">Bearbeiten</p>
                    </div>
                </Link>

                <Link
                    href="/admin/stats"
                    className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-primary transition-colors"
                >
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <div>
                        <p className="font-medium text-gray-900">Statistiken</p>
                        <p className="text-xs text-gray-500">Auswerten</p>
                    </div>
                </Link>
            </div>
        </div>
    );
}
