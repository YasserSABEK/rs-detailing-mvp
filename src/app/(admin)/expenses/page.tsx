'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Plus, Trash2, Loader2 } from 'lucide-react';

interface Expense {
    id: string;
    category: string;
    amount: number;
    description: string | null;
    expense_date: string;
}

const CATEGORY_MAP: Record<string, string> = {
    supplies: 'سلعة (Supplies)',
    bills: 'تريسيتي (Factures)',
    rent: 'كراء (Loyer)',
    salary: 'خدامين (Salaires)',
    other: 'أخرى (Autre)'
};

const CATEGORY_REVERSE: Record<string, string> = Object.fromEntries(
    Object.entries(CATEGORY_MAP).map(([k, v]) => [v, k])
);

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [saving, setSaving] = useState(false);
    const [todayTotal, setTodayTotal] = useState(0);
    const [monthTotal, setMonthTotal] = useState(0);
    const supabase = createClient();

    // Form State
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('سلعة (Supplies)');
    const [note, setNote] = useState('');

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        const today = new Date().toISOString().split('T')[0];
        const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

        try {
            // Fetch all expenses for the month
            const { data, error } = await supabase
                .from('expenses')
                .select('*')
                .gte('expense_date', monthStart)
                .order('expense_date', { ascending: false });

            if (error) throw error;

            setExpenses(data || []);

            // Calculate totals
            const todayExp = data?.filter(e => e.expense_date === today) || [];
            setTodayTotal(todayExp.reduce((sum, e) => sum + Number(e.amount), 0));
            setMonthTotal(data?.reduce((sum, e) => sum + Number(e.amount), 0) || 0);

        } catch (error) {
            console.error('Error fetching expenses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const dbCategory = CATEGORY_REVERSE[category] || 'other';
            const { error } = await supabase
                .from('expenses')
                .insert({
                    category: dbCategory,
                    amount: parseFloat(amount),
                    description: note || null,
                    expense_date: new Date().toISOString().split('T')[0]
                });

            if (error) throw error;

            // Refresh list
            await fetchExpenses();
            setIsAdding(false);
            setAmount('');
            setNote('');
        } catch (error) {
            console.error('Error adding expense:', error);
            alert('حدث خطأ في الحفظ');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('هل أنت متأكد من الحذف؟')) return;

        try {
            const { error } = await supabase
                .from('expenses')
                .delete()
                .eq('id', id);

            if (error) throw error;
            await fetchExpenses();
        } catch (error) {
            console.error('Error deleting expense:', error);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ar-DZ').format(amount) + ' DA';
    };

    const categories = Object.values(CATEGORY_MAP);

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-brand-red" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">المصاريف (Dépenses)</h1>
                    <p className="text-gray-500">تسيير مصاريف المحل</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 rounded-xl bg-brand-red px-5 py-3 font-bold text-white shadow-lg active:scale-95"
                >
                    <Plus className="h-5 w-5" />
                    <span>مصروف جديد</span>
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl bg-white p-5 shadow-sm border border-red-100">
                    <div className="text-sm text-gray-500">مجموع المصاريف (اليوم)</div>
                    <div className="text-2xl font-bold text-red-600">{formatCurrency(todayTotal)}</div>
                </div>
                <div className="rounded-2xl bg-white p-5 shadow-sm">
                    <div className="text-sm text-gray-500">مجموع المصاريف (الشهر)</div>
                    <div className="text-2xl font-bold text-gray-900">{formatCurrency(monthTotal)}</div>
                </div>
            </div>

            {/* Add Form Modal */}
            {isAdding && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <form onSubmit={handleAdd} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <h2 className="mb-6 text-xl font-bold text-gray-900">إضافة مصروف</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">المبلغ (Montant)</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    className="w-full rounded-xl border p-3 text-lg font-bold outline-none ring-brand-red focus:ring-2"
                                    placeholder="0.00"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">النوع (Catégorie)</label>
                                <select
                                    value={category}
                                    onChange={e => setCategory(e.target.value)}
                                    className="w-full rounded-xl border p-3 outline-none ring-brand-red focus:ring-2"
                                >
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">ملاحظة (Note)</label>
                                <input
                                    type="text"
                                    value={note}
                                    onChange={e => setNote(e.target.value)}
                                    className="w-full rounded-xl border p-3 outline-none ring-brand-red focus:ring-2"
                                    placeholder="التفاصيل..."
                                />
                            </div>
                        </div>

                        <div className="mt-8 flex gap-3">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 rounded-xl bg-brand-black py-3 font-bold text-white disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : 'حفظ'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsAdding(false)}
                                className="flex-1 rounded-xl bg-gray-100 py-3 font-bold text-gray-700"
                            >
                                إلغاء
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Expenses List */}
            <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
                {expenses.length === 0 ? (
                    <p className="py-12 text-center text-gray-500">لا توجد مصاريف هذا الشهر</p>
                ) : (
                    <table className="w-full text-right text-sm">
                        <thead className="bg-gray-50 text-gray-500">
                            <tr>
                                <th className="py-4 pr-6">التاريخ</th>
                                <th className="py-4">النوع</th>
                                <th className="py-4">ملاحظة</th>
                                <th className="py-4">المبلغ</th>
                                <th className="py-4 pl-6"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {expenses.map((expense) => (
                                <tr key={expense.id} className="group hover:bg-gray-50 transition-colors">
                                    <td className="py-4 pr-6 font-mono text-gray-500">{expense.expense_date}</td>
                                    <td className="py-4 font-bold">{CATEGORY_MAP[expense.category] || expense.category}</td>
                                    <td className="py-4 text-gray-600">{expense.description || '-'}</td>
                                    <td className="py-4 font-bold text-red-600" dir="ltr">
                                        -{formatCurrency(expense.amount)}
                                    </td>
                                    <td className="py-4 pl-6 text-left">
                                        <button
                                            onClick={() => handleDelete(expense.id)}
                                            className="text-gray-400 hover:text-red-600 transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

        </div>
    );
}
