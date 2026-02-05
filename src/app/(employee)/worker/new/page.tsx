'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Loader2, Plus, Car, User, CheckCircle2, ChevronRight, Users } from 'lucide-react';
import Link from 'next/link';

interface Service {
    id: string;
    name_ar: string;
    base_price: number;
}

interface Employee {
    id: string;
    full_name: string;
}

export default function WorkerNewJobPage() {
    const router = useRouter();
    const supabase = createClient();

    // Loading states
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [currentEmployee, setCurrentEmployee] = useState<any>(null);

    // Data from DB
    const [services, setServices] = useState<Service[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);

    // Form state
    const [customerPhone, setCustomerPhone] = useState('');
    const [carMake, setCarMake] = useState('');
    const [carModel, setCarModel] = useState('');
    const [carPlate, setCarPlate] = useState('');
    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [assignedEmployee, setAssignedEmployee] = useState('');

    useEffect(() => {
        const empData = localStorage.getItem('employee');
        if (empData) {
            const emp = JSON.parse(empData);
            setCurrentEmployee(emp);
            setAssignedEmployee(emp.id); // Default to self
        }
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [servicesRes, employeesRes] = await Promise.all([
                supabase.from('services').select('*').eq('is_active', true).order('base_price', { ascending: true }),
                supabase.from('employees').select('id, full_name').eq('is_active', true).neq('role', 'admin')
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
            alert('يرجى إدخال رقم الهاتف واختيار خدمة');
            return;
        }

        setSaving(true);

        try {
            // 1. Create or find customer (simplified: just phone)
            let customerId: string;
            const { data: existingCustomer } = await supabase
                .from('customers')
                .select('id')
                .eq('phone', customerPhone)
                .single();

            if (existingCustomer) {
                customerId = existingCustomer.id;
            } else {
                const { data: newCustomer } = await supabase
                    .from('customers')
                    .insert({ phone: customerPhone })
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
                        plate_number: carPlate || null
                    })
                    .select('id')
                    .single();
                carId = newCar!.id;
            }

            // Calculate Total Price
            const totalPrice = services
                .filter(s => selectedServices.includes(s.name_ar))
                .reduce((sum, s) => sum + s.base_price, 0);

            // 3. Create booking
            const { error: insertError } = await supabase
                .from('bookings')
                .insert({
                    customer_id: customerId,
                    car_id: carId,
                    booking_date: new Date().toISOString().split('T')[0], // Today
                    booking_time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }), // Now
                    services: selectedServices,
                    total_price: totalPrice,
                    status: 'checked_in',
                    payment_status: 'pending',
                    assigned_employee_id: assignedEmployee || currentEmployee?.id || null
                });

            if (insertError) throw insertError;

            router.push('/worker');

        } catch (error: any) {
            console.error('Error creating job:', error);
            alert('حدث خطأ: ' + (error.message || 'Unknown error'));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-brand-red" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white px-4 py-4 shadow-sm flex items-center gap-3 sticky top-0 z-10">
                <Link href="/worker" className="p-2 rounded-full hover:bg-gray-100">
                    <ChevronRight className="h-6 w-6 text-gray-600" />
                </Link>
                <h1 className="text-xl font-bold bg-white">سيارة جديدة</h1>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-6 max-w-lg mx-auto">

                {/* Phone */}
                <div>
                    <label className="mb-2 block font-bold text-gray-900">رقم الهاتف *</label>
                    <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={e => setCustomerPhone(e.target.value)}
                        className="w-full rounded-2xl border-0 p-4 text-center text-xl font-bold shadow-sm ring-1 ring-gray-200 focus:ring-2 focus:ring-brand-red"
                        placeholder="06 XX XX XX XX"
                        dir="ltr"
                    />
                </div>

                {/* Car Details */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">الماركة</label>
                        <input
                            type="text"
                            value={carMake}
                            onChange={e => setCarMake(e.target.value)}
                            className="w-full rounded-xl border-0 p-3 shadow-sm ring-1 ring-gray-200"
                            placeholder="Toyota"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">الموديل</label>
                        <input
                            type="text"
                            value={carModel}
                            onChange={e => setCarModel(e.target.value)}
                            className="w-full rounded-xl border-0 p-3 shadow-sm ring-1 ring-gray-200"
                            placeholder="Hilux"
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="mb-1 block text-sm font-medium text-gray-700">رقم اللوحة</label>
                        <input
                            type="text"
                            value={carPlate}
                            onChange={e => setCarPlate(e.target.value)}
                            className="w-full rounded-xl border-0 p-3 text-center font-mono shadow-sm ring-1 ring-gray-200"
                            placeholder="12345-04"
                            dir="ltr"
                        />
                    </div>
                </div>

                {/* Assigned Worker */}
                <div>
                    <label className="mb-2 block font-bold text-gray-900 flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        المسؤول عن العمل
                    </label>
                    <select
                        value={assignedEmployee}
                        onChange={e => setAssignedEmployee(e.target.value)}
                        className="w-full rounded-xl border-0 p-4 shadow-sm ring-1 ring-gray-200 focus:ring-2 focus:ring-brand-red bg-white"
                    >
                        {employees.map(emp => (
                            <option key={emp.id} value={emp.id}>
                                {emp.full_name} {emp.id === currentEmployee?.id ? '(أنا)' : ''}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Services */}
                <div>
                    <label className="mb-2 block font-bold text-gray-900">الخدمات *</label>
                    <div className="grid grid-cols-2 gap-2">
                        {services.map(service => (
                            <button
                                key={service.id}
                                type="button"
                                onClick={() => toggleService(service.name_ar)}
                                className={`rounded-xl p-3 text-center text-sm font-bold transition-all ${selectedServices.includes(service.name_ar)
                                    ? 'bg-brand-red text-white shadow-md'
                                    : 'bg-white text-gray-700 ring-1 ring-gray-200'
                                    }`}
                            >
                                {service.name_ar}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={saving}
                    className="w-full rounded-2xl bg-brand-black py-4 text-xl font-bold text-white shadow-lg active:scale-95 transition-all disabled:opacity-50"
                >
                    {saving ? <Loader2 className="mx-auto h-6 w-6 animate-spin" /> : 'تسجيل الدخول'}
                </button>

            </form>
        </div>
    );
}
