'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Loader2, Plus, Car, User, Calendar, Clock, CheckCircle2, Users } from 'lucide-react';

interface Service {
    id: string;
    name_ar: string;
    base_price: number;
}

interface Employee {
    id: string;
    full_name: string;
}

export default function NewBookingPage() {
    const router = useRouter();
    const supabase = createClient();

    // Loading states
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Data from DB
    const [services, setServices] = useState<Service[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);

    // Form state
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [carMake, setCarMake] = useState('');
    const [carModel, setCarModel] = useState('');
    const [carPlate, setCarPlate] = useState('');
    const [carColor, setCarColor] = useState('');
    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
    const [bookingTime, setBookingTime] = useState('10:00');
    const [notes, setNotes] = useState('');
    const [assignedEmployee, setAssignedEmployee] = useState('');

    // Computed
    const totalPrice = services
        .filter(s => selectedServices.includes(s.name_ar))
        .reduce((sum, s) => sum + s.base_price, 0);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [servicesRes, employeesRes] = await Promise.all([
                supabase.from('services').select('*').eq('is_active', true).order('base_price', { ascending: true }),
                supabase.from('employees').select('id, full_name').eq('is_active', true).neq('role', 'admin') // Fetch workers/detailers
            ]);

            setServices(servicesRes.data || []);
            setEmployees(employeesRes.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleService = (serviceName: string) => {
        setSelectedServices(prev =>
            prev.includes(serviceName)
                ? prev.filter(s => s !== serviceName)
                : [...prev, serviceName]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!customerPhone || selectedServices.length === 0) {
            alert('يرجى إدخال رقم الهاتف واختيار خدمة واحدة على الأقل');
            return;
        }

        setSaving(true);

        try {
            // 1. Create or find customer
            let customerId: string;
            const { data: existingCustomer } = await supabase
                .from('customers')
                .select('id')
                .eq('phone', customerPhone)
                .single();

            if (existingCustomer) {
                customerId = existingCustomer.id;
                if (customerName) {
                    await supabase
                        .from('customers')
                        .update({ full_name: customerName })
                        .eq('id', customerId);
                }
            } else {
                const { data: newCustomer } = await supabase
                    .from('customers')
                    .insert({ phone: customerPhone, full_name: customerName || null })
                    .select('id')
                    .single();

                customerId = newCustomer!.id;
            }

            // 2. Create car
            let carId: string | null = null;
            if (carMake || carModel || carPlate) {
                const { data: newCar } = await supabase
                    .from('cars')
                    .insert({
                        customer_id: customerId,
                        make: carMake || null,
                        model: carModel || null,
                        plate_number: carPlate || null,
                        color: carColor || null
                    })
                    .select('id')
                    .single();

                carId = newCar!.id;
            }

            // 3. Create booking
            await supabase
                .from('bookings')
                .insert({
                    customer_id: customerId,
                    car_id: carId,
                    booking_date: bookingDate,
                    booking_time: bookingTime,
                    services: selectedServices,
                    total_price: totalPrice,
                    status: 'pending',
                    payment_status: 'pending',
                    internal_notes: notes || null,
                    assigned_employee_id: assignedEmployee || null
                });

            // 4. Redirect
            router.push('/bookings');

        } catch (error) {
            console.error('Error creating booking:', error);
            alert('حدث خطأ في الحفظ');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-brand-red" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <header>
                <h1 className="text-2xl font-bold text-gray-900">حجز جديد</h1>
                <p className="text-gray-500">إضافة سيارة للعمل عليها</p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Customer Info */}
                <div className="rounded-2xl bg-white p-6 shadow-sm">
                    <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                        <User className="h-5 w-5 text-brand-red" />
                        معلومات الزبون
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">رقم الهاتف *</label>
                            <input
                                type="tel"
                                required
                                value={customerPhone}
                                onChange={e => setCustomerPhone(e.target.value)}
                                className="w-full rounded-xl border p-3 text-lg font-bold outline-none ring-brand-red focus:ring-2"
                                placeholder="06 XX XX XX XX"
                                dir="ltr"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">الاسم (اختياري)</label>
                            <input
                                type="text"
                                value={customerName}
                                onChange={e => setCustomerName(e.target.value)}
                                className="w-full rounded-xl border p-3 outline-none ring-brand-red focus:ring-2"
                                placeholder="محمد أمين"
                            />
                        </div>
                    </div>
                </div>

                {/* Car Info */}
                <div className="rounded-2xl bg-white p-6 shadow-sm">
                    <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                        <Car className="h-5 w-5 text-brand-red" />
                        معلومات السيارة
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">الماركة</label>
                            <input
                                type="text"
                                value={carMake}
                                onChange={e => setCarMake(e.target.value)}
                                className="w-full rounded-xl border p-3 outline-none ring-brand-red focus:ring-2"
                                placeholder="Toyota"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">الموديل</label>
                            <input
                                type="text"
                                value={carModel}
                                onChange={e => setCarModel(e.target.value)}
                                className="w-full rounded-xl border p-3 outline-none ring-brand-red focus:ring-2"
                                placeholder="Hilux"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">رقم اللوحة</label>
                            <input
                                type="text"
                                value={carPlate}
                                onChange={e => setCarPlate(e.target.value)}
                                className="w-full rounded-xl border p-3 font-mono outline-none ring-brand-red focus:ring-2"
                                placeholder="12345-04"
                                dir="ltr"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">اللون</label>
                            <input
                                type="text"
                                value={carColor}
                                onChange={e => setCarColor(e.target.value)}
                                className="w-full rounded-xl border p-3 outline-none ring-brand-red focus:ring-2"
                                placeholder="أبيض"
                            />
                        </div>
                    </div>
                </div>

                {/* Services Selection */}
                <div className="rounded-2xl bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-bold text-gray-900">اختر الخدمات *</h2>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {services.map(service => (
                            <button
                                key={service.id}
                                type="button"
                                onClick={() => toggleService(service.name_ar)}
                                className={`flex items-center justify-between rounded-xl border-2 p-4 text-right transition-all ${selectedServices.includes(service.name_ar)
                                    ? 'border-brand-red bg-red-50 shadow-md'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div>
                                    <div className="font-bold">{service.name_ar}</div>
                                    <div className="text-sm text-gray-500">{service.base_price} DA</div>
                                </div>
                                {selectedServices.includes(service.name_ar) && (
                                    <CheckCircle2 className="h-6 w-6 text-brand-red" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Date/Time and Assignment */}
                <div className="rounded-2xl bg-white p-6 shadow-sm">
                    <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                        <Calendar className="h-5 w-5 text-brand-red" />
                        تفاصيل الحجز
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">التاريخ</label>
                            <input
                                type="date"
                                value={bookingDate}
                                onChange={e => setBookingDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full rounded-xl border p-3 outline-none ring-brand-red focus:ring-2"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">الوقت</label>
                            <input
                                type="time"
                                value={bookingTime}
                                onChange={e => setBookingTime(e.target.value)}
                                className="w-full rounded-xl border p-3 outline-none ring-brand-red focus:ring-2"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="mb-1 block text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                الموظف المسؤول (اختياري)
                            </label>
                            <select
                                value={assignedEmployee}
                                onChange={e => setAssignedEmployee(e.target.value)}
                                className="w-full rounded-xl border p-3 outline-none ring-brand-red focus:ring-2"
                            >
                                <option value="">-- اختر موظفاً --</option>
                                {employees.map(emp => (
                                    <option key={emp.id} value={emp.id}>{emp.full_name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Notes */}
                <div className="rounded-2xl bg-white p-6 shadow-sm">
                    <label className="mb-2 block text-sm font-medium text-gray-700">ملاحظات داخلية</label>
                    <textarea
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        className="w-full rounded-xl border p-3 outline-none ring-brand-red focus:ring-2"
                        placeholder="أي تفاصيل إضافية..."
                        rows={2}
                    />
                </div>

                {/* Total & Submit */}
                <div className="rounded-2xl bg-gray-900 p-6 text-white">
                    <div className="mb-4 flex items-center justify-between text-xl">
                        <span className="font-bold">المجموع</span>
                        <span className="font-mono text-2xl font-bold">{totalPrice.toLocaleString()} DA</span>
                    </div>
                    <button
                        type="submit"
                        disabled={saving || selectedServices.length === 0}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-red py-4 text-lg font-bold text-white shadow-lg hover:bg-red-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {saving ? (
                            <Loader2 className="h-6 w-6 animate-spin" />
                        ) : (
                            <>
                                <Plus className="h-6 w-6" />
                                <span>إضافة الحجز</span>
                            </>
                        )}
                    </button>
                </div>

            </form>
        </div>
    );
}
