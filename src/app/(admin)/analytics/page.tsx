'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import {
    TrendingUp, TrendingDown, Wallet, Receipt, Car,
    Calendar, ChevronRight, ChevronLeft, Loader2, BarChart3
} from 'lucide-react';

interface MonthlyStats {
    revenue: number;
    expenses: number;
    profit: number;
    jobsCount: number;
    carsCount: number;
    avgJobValue: number;
    topServices: { name: string; count: number }[];
    dailyRevenue: { date: string; amount: number }[];
}

export default function AnalyticsPage() {
    const [loading, setLoading] = useState(true);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [stats, setStats] = useState<MonthlyStats>({
        revenue: 0,
        expenses: 0,
        profit: 0,
        jobsCount: 0,
        carsCount: 0,
        avgJobValue: 0,
        topServices: [],
        dailyRevenue: []
    });
    const [prevMonthStats, setPrevMonthStats] = useState<{ revenue: number; profit: number } | null>(null);

    const supabase = createClient();

    useEffect(() => {
        fetchAnalytics();
    }, [currentMonth]);

    const getMonthRange = (date: Date) => {
        const start = new Date(date.getFullYear(), date.getMonth(), 1);
        const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        return {
            start: start.toISOString().split('T')[0],
            end: end.toISOString().split('T')[0]
        };
    };

    const fetchAnalytics = async () => {
        setLoading(true);
        const { start, end } = getMonthRange(currentMonth);

        try {
            // Fetch bookings for current month
            const { data: bookings } = await supabase
                .from('bookings')
                .select('id, total_price, amount_paid, services, booking_date, status')
                .gte('booking_date', start)
                .lte('booking_date', end)
                .is('deleted_at', null);

            // Fetch expenses for current month
            const { data: expenses } = await supabase
                .from('expenses')
                .select('amount, expense_date')
                .gte('expense_date', start)
                .lte('expense_date', end);

            // Calculate stats
            const completedBookings = bookings?.filter(b =>
                ['completed', 'delivered'].includes(b.status)
            ) || [];

            const revenue = completedBookings.reduce((sum, b) =>
                sum + (Number(b.amount_paid) || 0), 0);

            const totalExpenses = expenses?.reduce((sum, e) =>
                sum + (Number(e.amount) || 0), 0) || 0;

            const profit = revenue - totalExpenses;
            const jobsCount = completedBookings.length;
            const avgJobValue = jobsCount > 0 ? revenue / jobsCount : 0;

            // Count services
            const serviceCount: Record<string, number> = {};
            completedBookings.forEach(b => {
                if (Array.isArray(b.services)) {
                    b.services.forEach((s: string) => {
                        serviceCount[s] = (serviceCount[s] || 0) + 1;
                    });
                }
            });
            const topServices = Object.entries(serviceCount)
                .map(([name, count]) => ({ name, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);

            // Daily revenue breakdown
            const dailyMap: Record<string, number> = {};
            completedBookings.forEach(b => {
                const date = b.booking_date;
                dailyMap[date] = (dailyMap[date] || 0) + (Number(b.amount_paid) || 0);
            });
            const dailyRevenue = Object.entries(dailyMap)
                .map(([date, amount]) => ({ date, amount }))
                .sort((a, b) => a.date.localeCompare(b.date));

            setStats({
                revenue,
                expenses: totalExpenses,
                profit,
                jobsCount,
                carsCount: bookings?.length || 0,
                avgJobValue,
                topServices,
                dailyRevenue
            });

            // Fetch previous month for comparison
            const prevMonth = new Date(currentMonth);
            prevMonth.setMonth(prevMonth.getMonth() - 1);
            const prevRange = getMonthRange(prevMonth);

            const { data: prevBookings } = await supabase
                .from('bookings')
                .select('amount_paid, status')
                .gte('booking_date', prevRange.start)
                .lte('booking_date', prevRange.end)
                .is('deleted_at', null);

            const { data: prevExpenses } = await supabase
                .from('expenses')
                .select('amount')
                .gte('expense_date', prevRange.start)
                .lte('expense_date', prevRange.end);

            const prevCompleted = prevBookings?.filter(b =>
                ['completed', 'delivered'].includes(b.status)
            ) || [];

            const prevRevenue = prevCompleted.reduce((sum, b) =>
                sum + (Number(b.amount_paid) || 0), 0);
            const prevTotalExp = prevExpenses?.reduce((sum, e) =>
                sum + (Number(e.amount) || 0), 0) || 0;

            setPrevMonthStats({
                revenue: prevRevenue,
                profit: prevRevenue - prevTotalExp
            });

        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
        setCurrentMonth(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
            return newDate;
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ar-DZ').format(Math.round(amount)) + ' DA';
    };

    const formatMonth = (date: Date) => {
        return date.toLocaleDateString('ar-DZ', { year: 'numeric', month: 'long' });
    };

    const getPercentChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-brand-red" />
            </div>
        );
    }

    const revenueChange = prevMonthStats ? getPercentChange(stats.revenue, prevMonthStats.revenue) : 0;
    const profitChange = prevMonthStats ? getPercentChange(stats.profit, prevMonthStats.profit) : 0;

    return (
        <div className="space-y-6">

            {/* Header with Month Navigation */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <BarChart3 className="h-6 w-6" />
                        التحليلات والتقارير
                    </h1>
                    <p className="text-gray-500">نظرة شاملة على أداء المحل</p>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-white px-2 py-1 shadow-sm">
                    <button
                        onClick={() => navigateMonth('prev')}
                        className="rounded-lg p-2 hover:bg-gray-100"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                    <span className="min-w-[150px] text-center font-bold">
                        {formatMonth(currentMonth)}
                    </span>
                    <button
                        onClick={() => navigateMonth('next')}
                        className="rounded-lg p-2 hover:bg-gray-100"
                        disabled={currentMonth >= new Date()}
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Main Stats Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {/* Revenue */}
                <div className="rounded-2xl bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">إجمالي الإيرادات</p>
                            <h3 className="mt-2 text-2xl font-bold text-green-600">{formatCurrency(stats.revenue)}</h3>
                            {prevMonthStats && (
                                <p className={`mt-1 text-xs flex items-center gap-1 ${revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {revenueChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                    {Math.abs(revenueChange).toFixed(1)}% من الشهر السابق
                                </p>
                            )}
                        </div>
                        <div className="rounded-xl bg-green-100 p-3">
                            <Wallet className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                </div>

                {/* Expenses */}
                <div className="rounded-2xl bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">إجمالي المصاريف</p>
                            <h3 className="mt-2 text-2xl font-bold text-red-600">{formatCurrency(stats.expenses)}</h3>
                        </div>
                        <div className="rounded-xl bg-red-100 p-3">
                            <Receipt className="h-6 w-6 text-red-600" />
                        </div>
                    </div>
                </div>

                {/* Net Profit */}
                <div className={`rounded-2xl p-6 shadow-sm ${stats.profit >= 0 ? 'bg-gradient-to-br from-green-500 to-green-600' : 'bg-gradient-to-br from-red-500 to-red-600'} text-white`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium opacity-90">صافي الربح</p>
                            <h3 className="mt-2 text-2xl font-bold">{formatCurrency(stats.profit)}</h3>
                            {prevMonthStats && (
                                <p className="mt-1 text-xs flex items-center gap-1 opacity-90">
                                    {profitChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                    {Math.abs(profitChange).toFixed(1)}% من الشهر السابق
                                </p>
                            )}
                        </div>
                        <div className="rounded-xl bg-white/20 p-3">
                            {stats.profit >= 0 ? <TrendingUp className="h-6 w-6" /> : <TrendingDown className="h-6 w-6" />}
                        </div>
                    </div>
                </div>

                {/* Jobs Count */}
                <div className="rounded-2xl bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">عدد السيارات</p>
                            <h3 className="mt-2 text-2xl font-bold text-gray-900">{stats.jobsCount}</h3>
                            <p className="mt-1 text-xs text-gray-500">
                                متوسط: {formatCurrency(stats.avgJobValue)}
                            </p>
                        </div>
                        <div className="rounded-xl bg-blue-100 p-3">
                            <Car className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Top Services */}
                <div className="rounded-2xl bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-bold text-gray-900">الخدمات الأكثر طلباً</h2>
                    {stats.topServices.length === 0 ? (
                        <p className="py-8 text-center text-gray-500">لا توجد بيانات</p>
                    ) : (
                        <div className="space-y-3">
                            {stats.topServices.map((service, i) => {
                                const maxCount = stats.topServices[0]?.count || 1;
                                const percentage = (service.count / maxCount) * 100;
                                return (
                                    <div key={i} className="flex items-center gap-4">
                                        <span className="w-6 text-center text-sm font-bold text-gray-400">{i + 1}</span>
                                        <div className="flex-1">
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="font-medium">{service.name}</span>
                                                <span className="text-gray-500">{service.count} مرة</span>
                                            </div>
                                            <div className="h-2 w-full rounded-full bg-gray-100">
                                                <div
                                                    className="h-2 rounded-full bg-brand-red"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Daily Revenue Chart (Simple) */}
                <div className="rounded-2xl bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-bold text-gray-900">الإيرادات اليومية</h2>
                    {stats.dailyRevenue.length === 0 ? (
                        <p className="py-8 text-center text-gray-500">لا توجد بيانات</p>
                    ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {stats.dailyRevenue.map((day, i) => {
                                const maxAmount = Math.max(...stats.dailyRevenue.map(d => d.amount));
                                const percentage = maxAmount > 0 ? (day.amount / maxAmount) * 100 : 0;
                                const date = new Date(day.date);
                                return (
                                    <div key={i} className="flex items-center gap-3">
                                        <span className="w-12 text-xs text-gray-500">
                                            {date.getDate()}/{date.getMonth() + 1}
                                        </span>
                                        <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-brand-red to-red-400 rounded-full flex items-center justify-end px-2"
                                                style={{ width: `${Math.max(percentage, 15)}%` }}
                                            >
                                                <span className="text-xs font-bold text-white">
                                                    {formatCurrency(day.amount)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Summary Footer */}
            <div className="rounded-2xl bg-gray-900 p-6 text-white">
                <h2 className="text-lg font-bold mb-4">ملخص الشهر</h2>
                <div className="grid gap-4 md:grid-cols-3 text-center">
                    <div>
                        <p className="text-gray-400 text-sm">إجمالي الدخل</p>
                        <p className="text-2xl font-bold text-green-400">{formatCurrency(stats.revenue)}</p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm">إجمالي المصاريف</p>
                        <p className="text-2xl font-bold text-red-400">-{formatCurrency(stats.expenses)}</p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm">صافي الربح</p>
                        <p className={`text-2xl font-bold ${stats.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {stats.profit >= 0 ? '+' : ''}{formatCurrency(stats.profit)}
                        </p>
                    </div>
                </div>
            </div>

        </div>
    );
}
