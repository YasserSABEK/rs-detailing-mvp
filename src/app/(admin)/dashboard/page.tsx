'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Wallet, Receipt, TrendingUp, Car, Loader2 } from 'lucide-react';

interface DashboardStats {
    dailyIncome: number;
    carsCount: number;
    expensesTotal: number;
    netProfit: number;
}

interface RecentBooking {
    id: string;
    booking_time: string;
    total_price: number;
    status: string;
    car?: { make: string; model: string };
    services: string[];
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats>({ dailyIncome: 0, carsCount: 0, expensesTotal: 0, netProfit: 0 });
    const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        const today = new Date().toISOString().split('T')[0];

        try {
            // 1. Today's Income (from bookings where status = completed/delivered and paid)
            const { data: todaysBookings } = await supabase
                .from('bookings')
                .select('total_price, amount_paid, status, booking_time, services, car_id')
                .eq('booking_date', today)
                .is('deleted_at', null);

            const dailyIncome = todaysBookings?.reduce((sum, b) => sum + (Number(b.amount_paid) || 0), 0) || 0;
            const carsCount = todaysBookings?.length || 0;

            // 2. Today's Expenses
            const { data: todaysExpenses } = await supabase
                .from('expenses')
                .select('amount')
                .eq('expense_date', today);

            const expensesTotal = todaysExpenses?.reduce((sum, e) => sum + (Number(e.amount) || 0), 0) || 0;

            // 3. Net Profit
            const netProfit = dailyIncome - expensesTotal;

            setStats({ dailyIncome, carsCount, expensesTotal, netProfit });

            // 4. Recent Bookings (last 5 today)
            const { data: recentData } = await supabase
                .from('bookings')
                .select(`
                    id,
                    booking_time,
                    total_price,
                    status,
                    services,
                    cars (make, model)
                `)
                .eq('booking_date', today)
                .is('deleted_at', null)
                .order('created_at', { ascending: false })
                .limit(5);

            if (recentData) {
                setRecentBookings(recentData.map((b: any) => ({
                    id: b.id,
                    booking_time: b.booking_time?.slice(0, 5) || '--:--',
                    total_price: b.total_price,
                    status: b.status,
                    car: b.cars,
                    services: Array.isArray(b.services) ? b.services : []
                })));
            }
        } catch (error) {
            console.error('Dashboard fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ar-DZ').format(amount) + ' DA';
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, { text: string; color: string }> = {
            pending: { text: 'في الانتظار', color: 'bg-yellow-100 text-yellow-800' },
            checked_in: { text: 'وصلت', color: 'bg-blue-100 text-blue-800' },
            working: { text: 'جاري العمل', color: 'bg-purple-100 text-purple-800' },
            completed: { text: 'مكتملة', color: 'bg-green-100 text-green-800' },
            delivered: { text: 'تم التسليم', color: 'bg-gray-100 text-gray-800' },
            cancelled: { text: 'ملغية', color: 'bg-red-100 text-red-800' },
        };
        return labels[status] || { text: status, color: 'bg-gray-100 text-gray-800' };
    };

    const STATS_CONFIG = [
        { label: 'مجموع الدخل (يومي)', value: formatCurrency(stats.dailyIncome), icon: Wallet, color: 'text-green-600', bg: 'bg-green-100' },
        { label: 'عدد السيارات', value: stats.carsCount.toString(), icon: Car, color: 'text-blue-600', bg: 'bg-blue-100' },
        { label: 'المصاريف', value: formatCurrency(stats.expensesTotal), icon: Receipt, color: 'text-red-600', bg: 'bg-red-100' },
        { label: 'صافي الربح', value: formatCurrency(stats.netProfit), icon: TrendingUp, color: stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600', bg: stats.netProfit >= 0 ? 'bg-green-50' : 'bg-red-50' },
    ];

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-brand-red" />
            </div>
        );
    }

    return (
        <div className="space-y-8">

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">لوحة التحكم</h1>
                    <p className="text-gray-500">نظرة عامة على نشاط اليوم</p>
                </div>
                <div className="rounded-lg bg-white px-4 py-2 text-sm font-bold shadow-sm">
                    📅 {new Date().toLocaleDateString('ar-DZ')}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {STATS_CONFIG.map((stat, i) => (
                    <div key={i} className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                                <h3 className="mt-2 text-2xl font-bold text-gray-900">{stat.value}</h3>
                            </div>
                            <div className={`rounded-xl p-3 ${stat.bg}`}>
                                <stat.icon className={`h-6 w-6 ${stat.color}`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Activity */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-bold text-gray-900">آخر العمليات</h2>
                {recentBookings.length === 0 ? (
                    <p className="py-8 text-center text-gray-500">لا توجد عمليات اليوم</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-right text-sm">
                            <thead className="bg-gray-50 text-gray-500">
                                <tr>
                                    <th className="rounded-r-lg py-3 pr-4">الوقت</th>
                                    <th className="py-3">السيارة</th>
                                    <th className="py-3">الخدمة</th>
                                    <th className="py-3">المبلغ</th>
                                    <th className="rounded-l-lg py-3 pl-4">الحالة</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {recentBookings.map((booking) => {
                                    const statusInfo = getStatusLabel(booking.status);
                                    return (
                                        <tr key={booking.id} className="group hover:bg-gray-50">
                                            <td className="py-4 pr-4 font-mono text-gray-500">{booking.booking_time}</td>
                                            <td className="py-4 font-bold">
                                                {booking.car ? `${booking.car.make} ${booking.car.model}` : 'غير محدد'}
                                            </td>
                                            <td className="py-4">{booking.services.join(', ') || '-'}</td>
                                            <td className="py-4 font-bold text-green-600">{formatCurrency(booking.total_price)}</td>
                                            <td className="py-4 pl-4">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusInfo.color}`}>
                                                    {statusInfo.text}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

        </div>
    );
}
