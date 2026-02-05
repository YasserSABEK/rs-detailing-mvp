'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Loader2, Plus, CheckCircle, Clock, Wrench, Car, Truck, XCircle, DollarSign } from 'lucide-react';
import Link from 'next/link';

interface Booking {
    id: string;
    booking_date: string;
    booking_time: string;
    services: string[];
    total_price: number;
    status: string;
    payment_status: string;
    amount_paid: number;
    car?: { make: string; model: string; plate_number: string };
    customer?: { phone: string; full_name: string };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
    pending: { label: 'في الانتظار', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    checked_in: { label: 'وصلت', color: 'bg-blue-100 text-blue-800', icon: Car },
    working: { label: 'جاري العمل', color: 'bg-purple-100 text-purple-800', icon: Wrench },
    completed: { label: 'مكتملة', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    delivered: { label: 'تم التسليم', color: 'bg-gray-100 text-gray-800', icon: Truck },
    cancelled: { label: 'ملغية', color: 'bg-red-100 text-red-800', icon: XCircle },
};

export default function AllBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');
    const supabase = createClient();

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const { data, error } = await supabase
                .from('bookings')
                .select(`
                    id,
                    booking_date,
                    booking_time,
                    services,
                    total_price,
                    status,
                    payment_status,
                    amount_paid,
                    cars (make, model, plate_number),
                    customers (phone, full_name)
                `)
                .is('deleted_at', null)
                .order('booking_date', { ascending: false })
                .order('booking_time', { ascending: false })
                .limit(100);

            if (error) throw error;

            setBookings(data?.map((b: any) => ({
                ...b,
                car: b.cars,
                customer: b.customers
            })) || []);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (bookingId: string, newStatus: string) => {
        try {
            await supabase
                .from('bookings')
                .update({ status: newStatus })
                .eq('id', bookingId);

            setBookings(prev => prev.map(b =>
                b.id === bookingId ? { ...b, status: newStatus } : b
            ));
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const markAsPaid = async (bookingId: string, totalPrice: number) => {
        try {
            await supabase
                .from('bookings')
                .update({ payment_status: 'paid', amount_paid: totalPrice })
                .eq('id', bookingId);

            setBookings(prev => prev.map(b =>
                b.id === bookingId ? { ...b, payment_status: 'paid', amount_paid: totalPrice } : b
            ));
        } catch (error) {
            console.error('Error marking as paid:', error);
        }
    };

    const filteredBookings = filter === 'all'
        ? bookings
        : bookings.filter(b => b.status === filter);

    const todayStr = new Date().toISOString().split('T')[0];
    const todayBookings = bookings.filter(b => b.booking_date === todayStr);

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-brand-red" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">كل الحجوزات</h1>
                    <p className="text-gray-500">
                        {todayBookings.length} حجز اليوم • {bookings.length} إجمالي
                    </p>
                </div>
                <Link
                    href="/bookings/new"
                    className="flex items-center gap-2 rounded-xl bg-brand-red px-5 py-3 font-bold text-white shadow-lg active:scale-95"
                >
                    <Plus className="h-5 w-5" />
                    <span>حجز جديد</span>
                </Link>
            </div>

            {/* Status Filter */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => setFilter('all')}
                    className={`rounded-full px-4 py-2 text-sm font-bold transition ${filter === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    الكل ({bookings.length})
                </button>
                {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                    const count = bookings.filter(b => b.status === key).length;
                    if (count === 0) return null;
                    return (
                        <button
                            key={key}
                            onClick={() => setFilter(key)}
                            className={`rounded-full px-4 py-2 text-sm font-bold transition ${filter === key ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {config.label} ({count})
                        </button>
                    );
                })}
            </div>

            {/* Bookings List */}
            {filteredBookings.length === 0 ? (
                <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
                    <p className="text-gray-500 mb-4">لا توجد حجوزات</p>
                    <Link
                        href="/bookings/new"
                        className="inline-flex items-center gap-2 rounded-xl bg-brand-red px-5 py-3 font-bold text-white"
                    >
                        <Plus className="h-5 w-5" />
                        إضافة أول حجز
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredBookings.map(booking => {
                        const statusConfig = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
                        const StatusIcon = statusConfig.icon;
                        const isPaid = booking.payment_status === 'paid';

                        return (
                            <div key={booking.id} className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    {/* Car & Customer Info */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Car className="h-5 w-5 text-gray-400" />
                                            <span className="font-bold text-lg">
                                                {booking.car
                                                    ? `${booking.car.make} ${booking.car.model}`
                                                    : 'سيارة غير محددة'}
                                            </span>
                                            {booking.car?.plate_number && (
                                                <span className="font-mono text-sm text-gray-500">
                                                    {booking.car.plate_number}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-sm text-gray-500 mb-2">
                                            📞 {booking.customer?.phone || 'غير معروف'}
                                            {booking.customer?.full_name && ` • ${booking.customer.full_name}`}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {booking.services.join(' + ')}
                                        </div>
                                    </div>

                                    {/* Price & Status */}
                                    <div className="text-left">
                                        <div className={`font-mono text-xl font-bold ${isPaid ? 'text-green-600' : 'text-gray-900'}`}>
                                            {booking.total_price.toLocaleString()} DA
                                        </div>
                                        <div className="text-xs text-gray-500 mb-2">
                                            {booking.booking_date} • {booking.booking_time?.slice(0, 5)}
                                        </div>
                                        <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${statusConfig.color}`}>
                                            <StatusIcon className="h-3 w-3" />
                                            {statusConfig.label}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="mt-4 flex flex-wrap gap-2 border-t pt-4">
                                    {booking.status === 'pending' && (
                                        <button
                                            onClick={() => updateStatus(booking.id, 'checked_in')}
                                            className="rounded-lg bg-blue-100 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-200"
                                        >
                                            ✅ وصلت السيارة
                                        </button>
                                    )}
                                    {booking.status === 'checked_in' && (
                                        <button
                                            onClick={() => updateStatus(booking.id, 'working')}
                                            className="rounded-lg bg-purple-100 px-3 py-2 text-xs font-bold text-purple-700 hover:bg-purple-200"
                                        >
                                            🔧 بدء العمل
                                        </button>
                                    )}
                                    {booking.status === 'working' && (
                                        <button
                                            onClick={() => updateStatus(booking.id, 'completed')}
                                            className="rounded-lg bg-green-100 px-3 py-2 text-xs font-bold text-green-700 hover:bg-green-200"
                                        >
                                            ✅ انتهت
                                        </button>
                                    )}
                                    {booking.status === 'completed' && !isPaid && (
                                        <button
                                            onClick={() => markAsPaid(booking.id, booking.total_price)}
                                            className="rounded-lg bg-green-600 px-3 py-2 text-xs font-bold text-white hover:bg-green-700 flex items-center gap-1"
                                        >
                                            <DollarSign className="h-3 w-3" />
                                            تم الدفع
                                        </button>
                                    )}
                                    {booking.status === 'completed' && (
                                        <button
                                            onClick={() => updateStatus(booking.id, 'delivered')}
                                            className="rounded-lg bg-gray-100 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-200"
                                        >
                                            🚗 تم التسليم
                                        </button>
                                    )}
                                    {booking.status !== 'cancelled' && booking.status !== 'delivered' && (
                                        <button
                                            onClick={() => updateStatus(booking.id, 'cancelled')}
                                            className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100"
                                        >
                                            ❌ إلغاء
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
