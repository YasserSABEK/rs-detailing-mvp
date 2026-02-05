'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';
import { Loader2, Car, Clock, Wrench, CheckCircle, Truck, LogOut, RefreshCw, Plus } from 'lucide-react';

interface Booking {
    id: string;
    booking_date: string;
    booking_time: string;
    services: string[];
    total_price: number;
    status: string;
    payment_status: string;
    internal_notes: string | null;
    car?: { make: string; model: string; plate_number: string; color: string };
    customer?: { phone: string; full_name: string };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any; next?: string; nextLabel?: string }> = {
    pending: { label: 'في الانتظار', color: 'bg-yellow-500', icon: Clock, next: 'checked_in', nextLabel: 'وصلت السيارة' },
    checked_in: { label: 'وصلت', color: 'bg-blue-500', icon: Car, next: 'working', nextLabel: 'بدء العمل' },
    working: { label: 'جاري العمل', color: 'bg-purple-500', icon: Wrench, next: 'completed', nextLabel: 'انتهيت' },
    completed: { label: 'مكتملة', color: 'bg-green-500', icon: CheckCircle, next: 'delivered', nextLabel: 'تم التسليم' },
    delivered: { label: 'تم التسليم', color: 'bg-gray-400', icon: Truck },
};

export default function EmployeeDashboard() {
    const [employee, setEmployee] = useState<{ id: string; full_name: string } | null>(null);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<'active' | 'completed'>('active');
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        checkAuthAndFetch();
    }, []);

    const checkAuthAndFetch = async () => {
        // Check if employee is logged in (from localStorage)
        const empData = localStorage.getItem('employee');
        if (!empData) {
            router.push('/login');
            return;
        }
        const emp = JSON.parse(empData);
        // Workers only - admins go to admin panel
        if (emp.role === 'admin') {
            router.push('/dashboard');
            return;
        }
        setEmployee(emp);
        await fetchBookings();
    };

    const fetchBookings = async () => {
        try {
            const today = new Date().toISOString().split('T')[0];

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
                    internal_notes,
                    cars (make, model, plate_number, color),
                    customers (phone, full_name)
                `)
                .gte('booking_date', today)
                .is('deleted_at', null)
                .order('booking_time', { ascending: true });

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
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchBookings();
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
            alert('حدث خطأ في تحديث الحالة');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('employee');
        router.push('/login');
    };

    const filteredBookings = bookings.filter(b => {
        if (filter === 'active') {
            return !['completed', 'delivered', 'cancelled'].includes(b.status);
        }
        return ['completed', 'delivered'].includes(b.status);
    });

    const activeCount = bookings.filter(b => !['completed', 'delivered', 'cancelled'].includes(b.status)).length;

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-100">
                <Loader2 className="h-10 w-10 animate-spin text-brand-red" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-brand-black text-white">
                <div className="flex items-center justify-between px-4 py-4">
                    <div>
                        <h1 className="text-xl font-bold">RS DETAILING</h1>
                        <p className="text-sm text-gray-400">مرحباً {employee?.full_name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleRefresh}
                            className="rounded-full p-2 hover:bg-white/10"
                            disabled={refreshing}
                        >
                            <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
                        </button>
                        <Link
                            href="/worker/new"
                            className="flex items-center gap-1 rounded-full bg-brand-red px-3 py-1.5 text-xs font-bold hover:bg-red-700"
                        >
                            <Plus className="h-4 w-4" />
                            جديد
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="rounded-full p-2 hover:bg-white/10"
                        >
                            <LogOut className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex border-t border-white/10">
                    <button
                        onClick={() => setFilter('active')}
                        className={`flex-1 py-3 text-center font-bold transition ${filter === 'active' ? 'bg-brand-red' : 'text-gray-400'
                            }`}
                    >
                        جاري ({activeCount})
                    </button>
                    <button
                        onClick={() => setFilter('completed')}
                        className={`flex-1 py-3 text-center font-bold transition ${filter === 'completed' ? 'bg-brand-red' : 'text-gray-400'
                            }`}
                    >
                        مكتملة
                    </button>
                </div>
            </header>

            {/* Jobs List */}
            <main className="p-4 pb-20 space-y-4">
                {filteredBookings.length === 0 ? (
                    <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
                        <Car className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                        <p className="text-gray-500 font-bold">
                            {filter === 'active' ? 'لا توجد سيارات حالياً' : 'لا توجد سيارات مكتملة اليوم'}
                        </p>
                    </div>
                ) : (
                    filteredBookings.map(booking => {
                        const config = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
                        const StatusIcon = config.icon;

                        return (
                            <div key={booking.id} className="rounded-2xl bg-white shadow-sm overflow-hidden">
                                {/* Status Bar */}
                                <div className={`${config.color} px-4 py-2 text-white flex items-center justify-between`}>
                                    <div className="flex items-center gap-2">
                                        <StatusIcon className="h-5 w-5" />
                                        <span className="font-bold">{config.label}</span>
                                    </div>
                                    <span className="text-sm opacity-90">
                                        {booking.booking_time?.slice(0, 5)}
                                    </span>
                                </div>

                                {/* Car Info */}
                                <div className="p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-xl font-bold">
                                            {booking.car ? `${booking.car.make} ${booking.car.model}` : 'سيارة'}
                                        </h3>
                                        {booking.car?.plate_number && (
                                            <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                                                {booking.car.plate_number}
                                            </span>
                                        )}
                                    </div>

                                    {booking.car?.color && (
                                        <p className="text-sm text-gray-500 mb-2">اللون: {booking.car.color}</p>
                                    )}

                                    {/* Services */}
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {booking.services.map((svc, i) => (
                                            <span key={i} className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium">
                                                {svc}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Notes */}
                                    {booking.internal_notes && (
                                        <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-3 mb-3">
                                            <p className="text-sm text-yellow-800">📝 {booking.internal_notes}</p>
                                        </div>
                                    )}

                                    {/* Customer */}
                                    {booking.customer?.phone && (
                                        <a
                                            href={`tel:${booking.customer.phone}`}
                                            className="inline-flex items-center gap-2 text-sm text-blue-600 mb-3"
                                        >
                                            📞 {booking.customer.phone}
                                            {booking.customer.full_name && ` (${booking.customer.full_name})`}
                                        </a>
                                    )}

                                    {/* Price */}
                                    <div className="flex items-center justify-between pt-3 border-t">
                                        <span className="text-gray-500">السعر</span>
                                        <span className="font-mono text-xl font-bold text-green-600">
                                            {booking.total_price} DA
                                        </span>
                                    </div>
                                </div>

                                {/* Action Button */}
                                {config.next && (
                                    <button
                                        onClick={() => updateStatus(booking.id, config.next!)}
                                        className="w-full bg-brand-black py-4 text-lg font-bold text-white hover:bg-gray-800 active:scale-[0.98] transition-all"
                                    >
                                        ✅ {config.nextLabel}
                                    </button>
                                )}
                            </div>
                        );
                    })
                )}
            </main>
        </div>
    );
}
