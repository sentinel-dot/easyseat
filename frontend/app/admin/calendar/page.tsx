'use client';

import { useEffect, useState, useMemo } from 'react';
import { getBookings } from '@/lib/api/admin';
import { getStatusColor, getStatusColorBlock, getStatusLabel } from '@/lib/utils/bookingStatus';
import type { BookingWithDetails } from '@/lib/types';

const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 8:00 - 19:00

const DAY_NAMES = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

function formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
}

function getWeekDates(baseDate: Date): Date[] {
    const dates: Date[] = [];
    const day = baseDate.getDay();
    const diff = baseDate.getDate() - day + (day === 0 ? -6 : 1); // Monday
    
    for (let i = 0; i < 7; i++) {
        const date = new Date(baseDate);
        date.setDate(diff + i);
        dates.push(date);
    }
    
    return dates;
}

export default function AdminCalendarPage() {
    const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedBooking, setSelectedBooking] = useState<BookingWithDetails | null>(null);

    const weekDates = useMemo(() => getWeekDates(currentDate), [currentDate]);
    
    const startDate = formatDate(weekDates[0]);
    const endDate = formatDate(weekDates[6]);

    useEffect(() => {
        loadBookings();
    }, [startDate, endDate]);

    async function loadBookings() {
        setLoading(true);
        setError('');

        try {
            const result = await getBookings({
                startDate,
                endDate,
                limit: 200,
            });

            if (result.success && result.data) {
                setBookings(result.data);
            } else {
                setError(result.message || 'Fehler beim Laden der Buchungen');
            }
        } catch (err) {
            setError((err as Error).message || 'Fehler beim Laden der Buchungen');
        } finally {
            setLoading(false);
        }
    }

    function goToPreviousWeek() {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() - 7);
        setCurrentDate(newDate);
    }

    function goToNextWeek() {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + 7);
        setCurrentDate(newDate);
    }

    function goToToday() {
        setCurrentDate(new Date());
    }

    // Group bookings by date
    const bookingsByDate = useMemo(() => {
        const map: Record<string, BookingWithDetails[]> = {};
        
        bookings.forEach((booking) => {
            const date = booking.booking_date;
            if (!map[date]) {
                map[date] = [];
            }
            map[date].push(booking);
        });

        return map;
    }, [bookings]);

    // Get booking position in calendar
    function getBookingStyle(booking: BookingWithDetails): React.CSSProperties {
        const [startHour, startMinute] = booking.start_time.split(':').map(Number);
        const [endHour, endMinute] = booking.end_time.split(':').map(Number);
        
        const startOffset = (startHour - 8) * 60 + startMinute;
        const duration = (endHour - 8) * 60 + endMinute - startOffset;
        
        return {
            top: `${(startOffset / 60) * 64}px`,
            height: `${(duration / 60) * 64}px`,
            minHeight: '32px',
        };
    }

    const today = formatDate(new Date());

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Kalender</h1>
                    <p className="text-gray-600">Wochenübersicht der Termine</p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={goToToday}
                        className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        Heute
                    </button>
                    <button
                        onClick={goToPreviousWeek}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        onClick={goToNextWeek}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Week Header */}
            <div className="text-center text-lg font-medium text-gray-900">
                {weekDates[0].toLocaleDateString('de-DE', { day: '2-digit', month: 'long' })} -{' '}
                {weekDates[6].toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })}
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                    {error}
                </div>
            )}

            {/* Calendar Grid */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-96">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <div className="min-w-[800px]">
                            {/* Day headers */}
                            <div className="grid grid-cols-8 border-b border-gray-200">
                                <div className="p-3 text-xs font-medium text-gray-500 border-r border-gray-200" />
                                {weekDates.map((date, i) => {
                                    const dateStr = formatDate(date);
                                    const isToday = dateStr === today;
                                    
                                    return (
                                        <div
                                            key={i}
                                            className={`p-3 text-center border-r border-gray-200 last:border-r-0 ${
                                                isToday ? 'bg-primary/5' : ''
                                            }`}
                                        >
                                            <p className="text-xs font-medium text-gray-500">{DAY_NAMES[date.getDay()]}</p>
                                            <p className={`text-lg font-semibold ${isToday ? 'text-primary' : 'text-gray-900'}`}>
                                                {date.getDate()}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Time slots */}
                            <div className="grid grid-cols-8">
                                {/* Time labels */}
                                <div className="border-r border-gray-200">
                                    {HOURS.map((hour) => (
                                        <div
                                            key={hour}
                                            className="h-16 border-b border-gray-100 px-2 py-1 text-xs text-gray-500"
                                        >
                                            {hour}:00
                                        </div>
                                    ))}
                                </div>

                                {/* Day columns */}
                                {weekDates.map((date, dayIndex) => {
                                    const dateStr = formatDate(date);
                                    const dayBookings = bookingsByDate[dateStr] || [];
                                    const isToday = dateStr === today;

                                    return (
                                        <div
                                            key={dayIndex}
                                            className={`relative border-r border-gray-200 last:border-r-0 ${
                                                isToday ? 'bg-primary/5' : ''
                                            }`}
                                        >
                                            {/* Hour lines */}
                                            {HOURS.map((hour) => (
                                                <div key={hour} className="h-16 border-b border-gray-100" />
                                            ))}

                                            {/* Bookings */}
                                            {dayBookings
                                                .filter((b) => b.status !== 'cancelled')
                                                .map((booking) => (
                                                    <button
                                                        key={booking.id}
                                                        onClick={() => setSelectedBooking(booking)}
                                                        style={getBookingStyle(booking)}
                                                        className={`absolute left-1 right-1 px-1.5 py-1 rounded text-left overflow-hidden ${getStatusColorBlock(booking.status)} text-white text-xs hover:opacity-90 transition-opacity`}
                                                    >
                                                        <p className="font-medium truncate">{booking.customer_name}</p>
                                                        <p className="truncate opacity-90">{booking.service_name}</p>
                                                        <p className="truncate opacity-80 text-[10px]">{getStatusLabel(booking.status)}</p>
                                                    </button>
                                                ))}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-yellow-500" />
                    <span className="text-gray-600">Ausstehend</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-green-500" />
                    <span className="text-gray-600">Bestätigt</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-blue-500" />
                    <span className="text-gray-600">Abgeschlossen</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-gray-500" />
                    <span className="text-gray-600">Nicht erschienen</span>
                </div>
            </div>

            {/* Booking Detail Modal */}
            {selectedBooking && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <div className="flex items-start justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Buchungsdetails</h3>
                            <button
                                onClick={() => setSelectedBooking(null)}
                                className="p-1 text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-500">Kunde</p>
                                <p className="font-medium text-gray-900">{selectedBooking.customer_name}</p>
                                <p className="text-sm text-gray-600">{selectedBooking.customer_email}</p>
                                {selectedBooking.customer_phone && (
                                    <p className="text-sm text-gray-600">{selectedBooking.customer_phone}</p>
                                )}
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">Service</p>
                                <p className="font-medium text-gray-900">{selectedBooking.service_name}</p>
                                {selectedBooking.staff_member_name && (
                                    <p className="text-sm text-gray-600">mit {selectedBooking.staff_member_name}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Datum</p>
                                    <p className="font-medium text-gray-900">
                                        {new Date(selectedBooking.booking_date).toLocaleDateString('de-DE', {
                                            weekday: 'long',
                                            day: '2-digit',
                                            month: 'long',
                                            year: 'numeric',
                                        })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Zeit</p>
                                    <p className="font-medium text-gray-900">
                                        {selectedBooking.start_time} - {selectedBooking.end_time}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">Status</p>
                                <span className={`inline-flex mt-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedBooking.status)}`}>
                                    {getStatusLabel(selectedBooking.status)}
                                </span>
                            </div>

                            {selectedBooking.special_requests && (
                                <div>
                                    <p className="text-sm text-gray-500">Besondere Wünsche</p>
                                    <p className="text-gray-900">{selectedBooking.special_requests}</p>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => setSelectedBooking(null)}
                            className="w-full mt-6 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                        >
                            Schließen
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
