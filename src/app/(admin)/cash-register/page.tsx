'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Calculator, Save, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CashRegister() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Data from DB
    const [openingBalance, setOpeningBalance] = useState(0);
    const [totalSales, setTotalSales] = useState(0);
    const [expenses, setExpenses] = useState(0);
    const [actualCash, setActualCash] = useState<string>('');
    const [notes, setNotes] = useState('');
    const [existingRecord, setExistingRecord] = useState<string | null>(null);

    const supabase = createClient();
    const today = new Date().toISOString().split('T')[0];

    // Computed
    const expectedCash = openingBalance + totalSales - expenses;
    const difference = (parseFloat(actualCash) || 0) - expectedCash;

    useEffect(() => {
        fetchTodayData();
    }, []);

    const fetchTodayData = async () => {
        try {
            // 1. Check if there's an existing record for today
            const { data: existingCR } = await supabase
                .from('daily_cash_register')
                .select('*')
                .eq('register_date', today)
                .single();

            if (existingCR) {
                setExistingRecord(existingCR.id);
                setOpeningBalance(Number(existingCR.opening_amount) || 0);
                setTotalSales(Number(existingCR.cash_sales) || 0);
                setExpenses(Number(existingCR.expenses_total) || 0);
                if (existingCR.actual_amount !== null) {
                    setActualCash(existingCR.actual_amount.toString());
                }
                setNotes(existingCR.notes || '');
            } else {
                // 2. Calculate from bookings and expenses
                const { data: todaysBookings } = await supabase
                    .from('bookings')
                    .select('amount_paid')
                    .eq('booking_date', today)
                    .is('deleted_at', null);

                const totalFromBookings = todaysBookings?.reduce((sum, b) =>
                    sum + (Number(b.amount_paid) || 0), 0) || 0;

                const { data: todaysExpenses } = await supabase
                    .from('expenses')
                    .select('amount')
                    .eq('expense_date', today);

                const totalExpenses = todaysExpenses?.reduce((sum, e) =>
                    sum + (Number(e.amount) || 0), 0) || 0;

                // Get yesterday's closing as today's opening (if exists)
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];

                const { data: yesterdayCR } = await supabase
                    .from('daily_cash_register')
                    .select('actual_amount')
                    .eq('register_date', yesterdayStr)
                    .single();

                const opening = yesterdayCR?.actual_amount || 2000; // Default 2000 DA

                setOpeningBalance(Number(opening));
                setTotalSales(totalFromBookings);
                setExpenses(totalExpenses);
            }
        } catch (error) {
            console.error('Error fetching cash register data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!actualCash) {
            alert('يرجى إدخال المبلغ المحسوب');
            return;
        }

        setSaving(true);
        try {
            const recordData = {
                register_date: today,
                opening_amount: openingBalance,
                cash_sales: totalSales,
                expenses_total: expenses,
                expected_amount: expectedCash,
                actual_amount: parseFloat(actualCash),
                difference: difference,
                closed_at: new Date().toISOString(),
                notes: notes || null
            };

            if (existingRecord) {
                // Update existing
                await supabase
                    .from('daily_cash_register')
                    .update(recordData)
                    .eq('id', existingRecord);
            } else {
                // Insert new
                await supabase
                    .from('daily_cash_register')
                    .insert(recordData);
            }

            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error('Error saving cash register:', error);
            alert('حدث خطأ في الحفظ');
        } finally {
            setSaving(false);
        }
    };

    const getDifferenceColor = (diff: number) => {
        if (diff === 0) return 'text-green-600 bg-green-50 border-green-200';
        if (diff > 0) return 'text-blue-600 bg-blue-50 border-blue-200';
        return 'text-red-600 bg-red-50 border-red-200';
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ar-DZ').format(amount) + ' DA';
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-brand-red" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">

            <header>
                <h1 className="text-2xl font-bold text-gray-900">غلق الصندوق (Clôture de Caisse)</h1>
                <p className="text-gray-500">{new Date().toLocaleDateString('ar-DZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </header>

            {/* Summary Card */}
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 space-y-4">

                <div className="flex justify-between items-center py-2 border-b border-dashed">
                    <span className="text-gray-600">القيمة الافتتاحية (Fond de caisse)</span>
                    <span className="font-mono font-bold">{formatCurrency(openingBalance)}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-dashed">
                    <span className="text-gray-600">مجموع المبيعات (Recette)</span>
                    <span className="font-mono font-bold text-green-600">+ {formatCurrency(totalSales)}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-dashed">
                    <span className="text-gray-600">المصاريف (Dépenses)</span>
                    <span className="font-mono font-bold text-red-600">- {formatCurrency(expenses)}</span>
                </div>

                <div className="flex justify-between items-center pt-2 text-lg">
                    <span className="font-bold text-gray-900">المتوقع في الصندوق (Théorique)</span>
                    <span className="font-mono font-bold text-gray-900">{formatCurrency(expectedCash)}</span>
                </div>
            </div>

            {/* Input Section */}
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        المبلغ المحسوب (Espèce Réel)
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            value={actualCash}
                            onChange={(e) => setActualCash(e.target.value)}
                            className="block w-full rounded-xl border-gray-200 p-4 text-left text-2xl font-bold font-mono shadow-sm focus:border-brand-red focus:ring-brand-red"
                            placeholder="0.00"
                            dir="ltr"
                        />
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                            <span className="text-gray-400 font-bold">DA</span>
                        </div>
                    </div>
                </div>

                {/* Notes */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        ملاحظات (Notes)
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="block w-full rounded-xl border-gray-200 p-3 shadow-sm focus:border-brand-red focus:ring-brand-red"
                        placeholder="أي ملاحظات إضافية..."
                        rows={2}
                    />
                </div>

                {/* Difference Analysis */}
                {actualCash !== '' && (
                    <div className={cn("rounded-xl p-4 border flex items-center gap-4", getDifferenceColor(difference))}>
                        {difference === 0 ? (
                            <CheckCircle2 className="h-8 w-8" />
                        ) : (
                            <AlertCircle className="h-8 w-8" />
                        )}
                        <div>
                            <div className="text-sm font-bold">الفارق (Ecart)</div>
                            <div className="text-2xl font-mono font-bold" dir="ltr">
                                {difference > 0 ? '+' : ''}{formatCurrency(difference)}
                            </div>
                            <div className="text-xs opacity-80 mt-1">
                                {difference === 0 ? 'الصندوق مطابق تماماً ✅' :
                                    difference > 0 ? 'يوجد فائض في الصندوق 🤔' :
                                        'ينقص مال في الصندوق 🚨'}
                            </div>
                        </div>
                    </div>
                )}

                <button
                    onClick={handleSave}
                    disabled={saving || !actualCash}
                    className={cn(
                        "w-full flex justify-center items-center gap-2 rounded-xl px-6 py-4 text-lg font-bold text-white shadow-lg transition-all",
                        saved ? "bg-green-600" : "bg-brand-black hover:bg-gray-900 active:scale-95",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                >
                    {saving ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : saved ? (
                        <>
                            <CheckCircle2 className="h-5 w-5" />
                            <span>تم الحفظ بنجاح</span>
                        </>
                    ) : (
                        <>
                            <Save className="h-5 w-5" />
                            <span>تأكيد وإغلاق اليوم</span>
                        </>
                    )}
                </button>
            </div>

        </div>
    );
}
