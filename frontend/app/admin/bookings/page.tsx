'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { getBookings, updateBookingStatus, getServices } from '@/lib/api/admin';
import type { BookingWithDetails, Service } from '@/lib/types';

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('de-DE', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

function formatCurrency(amount: number | null | undefined): string {
    if (amount == null) return '-';
    return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
    }).format(amount);
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

export default function AdminBookingsPage() {
    const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [total, setTotal] = useState(0);

    const searchParams = useSearchParams();

    // Filters (status can be pre-set via ?status=pending etc.)
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState(() => searchParams.get('status') || '');
    const [serviceFilter, setServiceFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Pagination
    const [page, setPage] = useState(0);
    const limit = 20;

    // Selected booking for status change
    const [selectedBooking, setSelectedBooking] = useState<BookingWithDetails | null>(null);
    const [newStatus, setNewStatus] = useState('');
    const [statusReason, setStatusReason] = useState('');
    const [statusLoading, setStatusLoading] = useState(false);

    const loadBookings = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            const result = await getBookings({
                search: search || undefined,
                status: statusFilter || undefined,
                serviceId: serviceFilter ? parseInt(serviceFilter) : undefined,
                startDate: startDate || undefined,
                endDate: endDate || undefined,
                limit,
                offset: page * limit,
            });

            if (result.success && result.data) {
                setBookings(result.data);
                setTotal(result.pagination?.total || 0);
            } else {
                setError(result.message || 'Fehler beim Laden der Buchungen');
            }
        } catch (err) {
            setError((err as Error).message || 'Fehler beim Laden der Buchungen');
        } finally {
            setLoading(false);
        }
    }, [search, statusFilter, serviceFilter, startDate, endDate, page]);

    const loadServices = async () => {
        try {
            const result = await getServices();
            if (result.success && result.data) {
                setServices(result.data);
            }
        } catch {
            // Ignore error for services
        }
    };

    useEffect(() => {
        loadServices();
    }, []);

    useEffect(() => {
        loadBookings();
    }, [loadBookings]);

    const handleStatusChange = async () => {
        if (!selectedBooking || !newStatus) return;

        setStatusLoading(true);
        try {
            const result = await updateBookingStatus(
                selectedBooking.id,
                newStatus,
                newStatus === 'cancelled' ? statusReason : undefined
            );

            if (result.success) {
                // Update booking in list
                setBookings((prev) =>
                    prev.map((b) =>
                        b.id === selectedBooking.id ? { ...b, status: newStatus as BookingWithDetails['status'] } : b
                    )
                );
                setSelectedBooking(null);
                setNewStatus('');
                setStatusReason('');
            } else {
                setError(result.message || 'Fehler beim Ändern des Status');
            }
        } catch (err) {
            setError((err as Error).message || 'Fehler beim Ändern des Status');
        } finally {
            setStatusLoading(false);
        }
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold text-gray-900">Buchungen</h1>
                <p className="text-gray-600">Verwalten Sie alle Buchungen</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Search */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Suche</label>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                            placeholder="Name, E-Mail, Telefon..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        />
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        >
                            <option value="">Alle</option>
                            <option value="pending">Ausstehend</option>
                            <option value="confirmed">Bestätigt</option>
                            <option value="completed">Abgeschlossen</option>
                            <option value="cancelled">Storniert</option>
                            <option value="no_show">Nicht erschienen</option>
                        </select>
                    </div>

                    {/* Service */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
                        <select
                            value={serviceFilter}
                            onChange={(e) => { setServiceFilter(e.target.value); setPage(0); }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        >
                            <option value="">Alle Services</option>
                            {services.map((service) => (
                                <option key={service.id} value={service.id}>
                                    {service.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Start Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Von</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => { setStartDate(e.target.value); setPage(0); }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        />
                    </div>

                    {/* End Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bis</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => { setEndDate(e.target.value); setPage(0); }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                    {error}
                    <button onClick={() => setError('')} className="ml-2 underline">Schließen</button>
                </div>
            )}

            {/* Bookings Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        Keine Buchungen gefunden
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kunde</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Datum</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Zeit</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preis</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aktionen</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {bookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <div>
                                                <p className="font-medium text-gray-900">{booking.customer_name}</p>
                                                <p className="text-sm text-gray-500">{booking.customer_email}</p>
                                                {booking.customer_phone && (
                                                    <p className="text-sm text-gray-500">{booking.customer_phone}</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-gray-900">{booking.service_name}</p>
                                            {booking.staff_member_name && (
                                                <p className="text-sm text-gray-500">mit {booking.staff_member_name}</p>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-gray-900">
                                            {formatDate(booking.booking_date)}
                                        </td>
                                        <td className="px-4 py-3 text-gray-900">
                                            {booking.start_time} - {booking.end_time}
                                        </td>
                                        <td className="px-4 py-3 text-gray-900">
                                            {formatCurrency(booking.total_amount)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                                                {getStatusLabel(booking.status)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() => {
                                                    setSelectedBooking(booking);
                                                    setNewStatus(booking.status);
                                                }}
                                                className="text-sm text-primary hover:underline"
                                            >
                                                Status ändern
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                        <p className="text-sm text-gray-500">
                            {page * limit + 1} - {Math.min((page + 1) * limit, total)} von {total} Buchungen
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage((p) => Math.max(0, p - 1))}
                                disabled={page === 0}
                                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Zurück
                            </button>
                            <button
                                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                                disabled={page >= totalPages - 1}
                                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Weiter
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Status Change Modal */}
            {selectedBooking && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Status ändern</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Buchung von <strong>{selectedBooking.customer_name}</strong> am{' '}
                            <strong>{formatDate(selectedBooking.booking_date)}</strong>
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Neuer Status</label>
                                <select
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                >
                                    <option value="pending">Ausstehend</option>
                                    <option value="confirmed">Bestätigt</option>
                                    <option value="completed">Abgeschlossen</option>
                                    <option value="cancelled">Storniert</option>
                                    <option value="no_show">Nicht erschienen</option>
                                </select>
                            </div>

                            {newStatus === 'cancelled' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Grund (optional)</label>
                                    <textarea
                                        value={statusReason}
                                        onChange={(e) => setStatusReason(e.target.value)}
                                        rows={2}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                        placeholder="Grund für die Stornierung..."
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setSelectedBooking(null);
                                    setNewStatus('');
                                    setStatusReason('');
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Abbrechen
                            </button>
                            <button
                                onClick={handleStatusChange}
                                disabled={statusLoading || newStatus === selectedBooking.status}
                                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {statusLoading ? 'Wird gespeichert...' : 'Speichern'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
