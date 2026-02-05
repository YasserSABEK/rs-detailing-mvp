'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Loader2, ChevronLeft, Mail, Lock } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function EmployeeLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const supabase = createClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const cleanEmail = email.trim().toLowerCase();
        const cleanPassword = password.trim();

        console.log('--- DEBUG LOGIN ---');
        console.log('Email:', cleanEmail);

        try {
            // STEP 1: Find user by email ONLY
            const { data: employees, error: fetchError } = await supabase
                .from('employees')
                .select('*')
                .ilike('email', cleanEmail);

            if (fetchError) {
                console.error('Database Error:', fetchError);
                throw new Error('خطأ في قاعدة البيانات');
            }

            if (!employees || employees.length === 0) {
                console.warn('User not found with email:', cleanEmail);
                throw new Error('البريد الإلكتروني غير موجود');
            }

            const employee = employees[0];
            console.log('User Found:', employee.id, employee.role);

            // STEP 2: Check password (Plain text comparsion for now)
            if (employee.password_hash !== cleanPassword) {
                console.warn('Password mismatch!');
                console.warn('Input:', cleanPassword);
                console.warn('Stored:', employee.password_hash);
                throw new Error('كلمة المرور غير صحيحة');
            }

            // STEP 3: Check Active
            if (!employee.is_active) {
                throw new Error('تم تعطيل هذا الحساب');
            }

            // SUCCESS
            localStorage.setItem('employee', JSON.stringify({
                id: employee.id,
                full_name: employee.full_name,
                email: employee.email,
                role: employee.role
            }));

            if (employee.role === 'admin') {
                router.push('/dashboard');
            } else {
                router.push('/worker');
            }

        } catch (err: any) {
            console.error('Login Process Error:', err);
            setError(err.message || 'حدث خطأ في الدخول');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex min-h-screen flex-col bg-gray-50 px-4 pt-8">
            {/* Header */}
            <Link href="/" className="mb-8 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm transition hover:bg-gray-100">
                <ChevronLeft className="h-6 w-6 text-gray-600" />
            </Link>

            <div className="mx-auto w-full max-w-sm">
                {/* Logo/Title */}
                <div className="mb-10 text-center">
                    <div className="relative mx-auto mb-4 h-16 w-48">
                        <Image
                            src="/logo.png"
                            alt="RS Detailing"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">تسجيل الدخول</h1>
                    <p className="mt-2 text-sm text-gray-500">أدخل بياناتك للمتابعة</p>
                </div>

                {/* Form */}
                <form onSubmit={handleLogin} className="space-y-6">

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-900">البريد الإلكتروني</label>
                        <div className="relative">
                            <input
                                type="email"
                                placeholder="name@example.com"
                                dir="ltr"
                                className="w-full rounded-xl border-gray-200 bg-white p-4 pl-12 text-left text-lg font-medium shadow-sm outline-none ring-brand-red focus:ring-2 transition-all"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-900">كلمة المرور</label>
                        <div className="relative">
                            <input
                                type="password"
                                placeholder="••••••••"
                                dir="ltr"
                                className="w-full rounded-xl border-gray-200 bg-white p-4 pl-12 text-left text-lg font-bold shadow-sm outline-none ring-brand-red focus:ring-2 transition-all"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-lg bg-red-50 p-3 text-center text-sm font-bold text-red-600 border border-red-100 animate-pulse">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full items-center justify-center rounded-xl bg-brand-red py-4 text-lg font-bold text-white transition hover:bg-red-700 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-brand-red/20"
                    >
                        {loading ? <Loader2 className="animate-spin h-6 w-6" /> : 'دخول'}
                    </button>
                </form>

                {/* Footer Help */}
                <p className="mt-8 text-center text-xs text-gray-400">
                    نسيت كلمة المرور؟ اتصل بالمدير
                </p>
            </div>
        </main>
    );
}
