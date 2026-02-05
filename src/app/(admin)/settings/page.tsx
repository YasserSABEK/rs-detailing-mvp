'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Plus, Trash2, Edit2, Save, X, Loader2, Settings, Users, Eye, EyeOff } from 'lucide-react';

interface Service {
    id: string;
    name_ar: string;
    base_price: number;
    duration_minutes: number | null;
    is_active: boolean;
}

interface Employee {
    id: string;
    full_name: string;
    email: string;
    role: string;
    is_active: boolean;
}

export default function SettingsPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'services' | 'employees'>('services');
    const supabase = createClient();

    // Service Form State
    const [isAddingService, setIsAddingService] = useState(false);
    const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
    const [serviceName, setServiceName] = useState('');
    const [servicePrice, setServicePrice] = useState('');
    const [serviceDuration, setServiceDuration] = useState('');

    // Employee Form State
    const [isAddingEmployee, setIsAddingEmployee] = useState(false);
    const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);
    const [empName, setEmpName] = useState('');
    const [empEmail, setEmpEmail] = useState('');
    const [empPassword, setEmpPassword] = useState('');
    const [empRole, setEmpRole] = useState('detailer');
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [servicesRes, employeesRes] = await Promise.all([
                supabase.from('services').select('*').order('base_price', { ascending: true }),
                supabase.from('employees').select('id, full_name, email, role, is_active').order('full_name')
            ]);

            setServices(servicesRes.data || []);
            setEmployees(employeesRes.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    // ========== SERVICE FUNCTIONS ==========
    const resetServiceForm = () => {
        setServiceName('');
        setServicePrice('');
        setServiceDuration('');
        setIsAddingService(false);
        setEditingServiceId(null);
    };

    const handleAddService = async () => {
        if (!serviceName || !servicePrice) {
            alert('يرجى إدخال اسم الخدمة والسعر');
            return;
        }

        setSaving(true);
        try {
            const { error } = await supabase.from('services').insert({
                name_ar: serviceName,
                base_price: parseFloat(servicePrice),
                duration_minutes: serviceDuration ? parseInt(serviceDuration) : null,
                is_active: true
            });

            if (error) {
                alert('خطأ: ' + error.message);
                return;
            }
            await fetchData();
            resetServiceForm();
        } catch (error: any) {
            alert('حدث خطأ في الحفظ');
        } finally {
            setSaving(false);
        }
    };

    const handleEditService = (service: Service) => {
        setEditingServiceId(service.id);
        setServiceName(service.name_ar);
        setServicePrice(service.base_price.toString());
        setServiceDuration(service.duration_minutes?.toString() || '');
        setIsAddingService(false);
    };

    const handleUpdateService = async () => {
        if (!editingServiceId) return;
        setSaving(true);
        try {
            await supabase.from('services').update({
                name_ar: serviceName,
                base_price: parseFloat(servicePrice),
                duration_minutes: serviceDuration ? parseInt(serviceDuration) : null
            }).eq('id', editingServiceId);

            await fetchData();
            resetServiceForm();
        } catch (error) {
            alert('حدث خطأ في التحديث');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteService = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذه الخدمة؟')) return;
        await supabase.from('services').delete().eq('id', id);
        setServices(prev => prev.filter(s => s.id !== id));
    };

    const toggleServiceActive = async (id: string, currentState: boolean) => {
        await supabase.from('services').update({ is_active: !currentState }).eq('id', id);
        setServices(prev => prev.map(s => s.id === id ? { ...s, is_active: !currentState } : s));
    };

    // ========== EMPLOYEE FUNCTIONS ==========
    const resetEmployeeForm = () => {
        setEmpName('');
        setEmpEmail('');
        setEmpPassword('');
        setEmpRole('detailer');
        setIsAddingEmployee(false);
        setEditingEmployeeId(null);
        setShowPassword(false);
    };

    const handleAddEmployee = async () => {
        if (!empName || !empEmail || !empPassword) {
            alert('يرجى إدخال الاسم والبريد وكلمة المرور');
            return;
        }

        setSaving(true);
        try {
            const { error } = await supabase.from('employees').insert({
                full_name: empName,
                email: empEmail,
                password_hash: empPassword, // In production, hash this!
                role: empRole,
                is_active: true
            });

            if (error) {
                alert('خطأ: ' + error.message);
                return;
            }
            await fetchData();
            resetEmployeeForm();
        } catch (error: any) {
            alert('حدث خطأ في الحفظ');
        } finally {
            setSaving(false);
        }
    };

    const handleEditEmployee = (emp: Employee) => {
        setEditingEmployeeId(emp.id);
        setEmpName(emp.full_name);
        setEmpEmail(emp.email);
        setEmpRole(emp.role);
        setEmpPassword(''); // Don't show old password
        setIsAddingEmployee(false);
    };

    const handleUpdateEmployee = async () => {
        if (!editingEmployeeId) return;
        setSaving(true);
        try {
            const updateData: any = {
                full_name: empName,
                email: empEmail,
                role: empRole
            };
            if (empPassword) {
                updateData.password_hash = empPassword;
            }

            await supabase.from('employees').update(updateData).eq('id', editingEmployeeId);
            await fetchData();
            resetEmployeeForm();
        } catch (error) {
            alert('حدث خطأ في التحديث');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteEmployee = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا الموظف؟')) return;
        await supabase.from('employees').delete().eq('id', id);
        setEmployees(prev => prev.filter(e => e.id !== id));
    };

    const toggleEmployeeActive = async (id: string, currentState: boolean) => {
        await supabase.from('employees').update({ is_active: !currentState }).eq('id', id);
        setEmployees(prev => prev.map(e => e.id === id ? { ...e, is_active: !currentState } : e));
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-brand-red" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <header>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Settings className="h-6 w-6" />
                    الإعدادات
                </h1>
                <p className="text-gray-500">إدارة الخدمات والموظفين</p>
            </header>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('services')}
                    className={`px-4 py-3 font-bold transition-all ${activeTab === 'services'
                        ? 'border-b-2 border-brand-red text-brand-red'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    🛠️ الخدمات
                </button>
                <button
                    onClick={() => setActiveTab('employees')}
                    className={`px-4 py-3 font-bold transition-all ${activeTab === 'employees'
                        ? 'border-b-2 border-brand-red text-brand-red'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    👥 الموظفين
                </button>
            </div>

            {/* ========== SERVICES TAB ========== */}
            {activeTab === 'services' && (
                <div className="rounded-2xl bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-900">قائمة الخدمات</h2>
                        <button
                            onClick={() => { setIsAddingService(true); setEditingServiceId(null); resetServiceForm(); }}
                            className="flex items-center gap-2 rounded-xl bg-brand-red px-4 py-2 font-bold text-white hover:bg-red-700"
                        >
                            <Plus className="h-4 w-4" />
                            خدمة جديدة
                        </button>
                    </div>

                    {/* Add/Edit Service Form */}
                    {(isAddingService || editingServiceId) && (
                        <div className="mb-6 rounded-xl bg-gray-50 p-4 border border-gray-200">
                            <h3 className="font-bold text-gray-900 mb-4">
                                {editingServiceId ? 'تعديل الخدمة' : 'إضافة خدمة جديدة'}
                            </h3>
                            <div className="grid gap-4 md:grid-cols-4">
                                <div className="md:col-span-2">
                                    <label className="mb-1 block text-sm font-medium text-gray-700">اسم الخدمة *</label>
                                    <input
                                        type="text"
                                        value={serviceName}
                                        onChange={e => setServiceName(e.target.value)}
                                        className="w-full rounded-xl border p-3 outline-none ring-brand-red focus:ring-2"
                                        placeholder="غسيل كامل"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">السعر (DA) *</label>
                                    <input
                                        type="number"
                                        value={servicePrice}
                                        onChange={e => setServicePrice(e.target.value)}
                                        className="w-full rounded-xl border p-3 outline-none ring-brand-red focus:ring-2"
                                        placeholder="1500"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">المدة (دقيقة)</label>
                                    <input
                                        type="number"
                                        value={serviceDuration}
                                        onChange={e => setServiceDuration(e.target.value)}
                                        className="w-full rounded-xl border p-3 outline-none ring-brand-red focus:ring-2"
                                        placeholder="60"
                                    />
                                </div>
                            </div>
                            <div className="mt-4 flex gap-2">
                                <button
                                    onClick={editingServiceId ? handleUpdateService : handleAddService}
                                    disabled={saving}
                                    className="flex items-center gap-2 rounded-xl bg-brand-black px-4 py-2 font-bold text-white hover:bg-gray-800 disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    {editingServiceId ? 'تحديث' : 'حفظ'}
                                </button>
                                <button
                                    onClick={resetServiceForm}
                                    className="flex items-center gap-2 rounded-xl bg-gray-200 px-4 py-2 font-bold text-gray-700 hover:bg-gray-300"
                                >
                                    <X className="h-4 w-4" />
                                    إلغاء
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Services List */}
                    {services.length === 0 ? (
                        <div className="py-12 text-center text-gray-500">
                            <p className="mb-4">لا توجد خدمات بعد</p>
                            <button
                                onClick={() => setIsAddingService(true)}
                                className="inline-flex items-center gap-2 rounded-xl bg-brand-red px-4 py-2 font-bold text-white"
                            >
                                <Plus className="h-4 w-4" />
                                أضف أول خدمة
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-right text-sm">
                                <thead className="bg-gray-50 text-gray-500">
                                    <tr>
                                        <th className="py-3 pr-4 rounded-r-lg">الخدمة</th>
                                        <th className="py-3">السعر</th>
                                        <th className="py-3">المدة</th>
                                        <th className="py-3">الحالة</th>
                                        <th className="py-3 pl-4 rounded-l-lg">إجراءات</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {services.map(service => (
                                        <tr key={service.id} className={`group hover:bg-gray-50 ${!service.is_active ? 'opacity-50' : ''}`}>
                                            <td className="py-4 pr-4 font-bold">{service.name_ar}</td>
                                            <td className="py-4 font-mono font-bold text-green-600">{service.base_price} DA</td>
                                            <td className="py-4 text-gray-500">
                                                {service.duration_minutes ? `${service.duration_minutes} دقيقة` : '-'}
                                            </td>
                                            <td className="py-4">
                                                <button
                                                    onClick={() => toggleServiceActive(service.id, service.is_active)}
                                                    className={`rounded-full px-3 py-1 text-xs font-bold ${service.is_active
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-gray-100 text-gray-500'
                                                        }`}
                                                >
                                                    {service.is_active ? 'نشط' : 'معطل'}
                                                </button>
                                            </td>
                                            <td className="py-4 pl-4">
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => handleEditService(service)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-blue-600">
                                                        <Edit2 className="h-4 w-4" />
                                                    </button>
                                                    <button onClick={() => handleDeleteService(service.id)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-red-600">
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ========== EMPLOYEES TAB ========== */}
            {activeTab === 'employees' && (
                <div className="rounded-2xl bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            الموظفين
                        </h2>
                        <button
                            onClick={() => {
                                setEditingEmployeeId(null);
                                setEmpName('');
                                setEmpEmail('');
                                setEmpPassword('');
                                setEmpRole('detailer');
                                setShowPassword(false);
                                setIsAddingEmployee(true);
                            }}
                            className="flex items-center gap-2 rounded-xl bg-brand-red px-4 py-2 font-bold text-white hover:bg-red-700"
                        >
                            <Plus className="h-4 w-4" />
                            موظف جديد
                        </button>
                    </div>

                    {/* Add/Edit Employee Form */}
                    {(isAddingEmployee || editingEmployeeId) && (
                        <div className="mb-6 rounded-xl bg-gray-50 p-4 border border-gray-200">
                            <h3 className="font-bold text-gray-900 mb-4">
                                {editingEmployeeId ? 'تعديل الموظف' : 'إضافة موظف جديد'}
                            </h3>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">الاسم الكامل *</label>
                                    <input
                                        type="text"
                                        value={empName}
                                        onChange={e => setEmpName(e.target.value)}
                                        className="w-full rounded-xl border p-3 outline-none ring-brand-red focus:ring-2"
                                        placeholder="محمد أحمد"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">البريد الإلكتروني *</label>
                                    <input
                                        type="email"
                                        value={empEmail}
                                        onChange={e => setEmpEmail(e.target.value)}
                                        className="w-full rounded-xl border p-3 outline-none ring-brand-red focus:ring-2"
                                        placeholder="worker@rsdetailing.dz"
                                        dir="ltr"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        كلمة المرور {editingEmployeeId && '(اتركها فارغة للإبقاء)'}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={empPassword}
                                            onChange={e => setEmpPassword(e.target.value)}
                                            className="w-full rounded-xl border p-3 pl-10 outline-none ring-brand-red focus:ring-2"
                                            placeholder="••••••••"
                                            dir="ltr"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                        >
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">الصلاحية</label>
                                    <select
                                        value={empRole}
                                        onChange={e => setEmpRole(e.target.value)}
                                        className="w-full rounded-xl border p-3 outline-none ring-brand-red focus:ring-2"
                                    >
                                        <option value="detailer">عامل (Detailer)</option>
                                        <option value="admin">مسؤول (Admin)</option>
                                    </select>
                                </div>
                            </div>
                            <div className="mt-4 flex gap-2">
                                <button
                                    onClick={editingEmployeeId ? handleUpdateEmployee : handleAddEmployee}
                                    disabled={saving}
                                    className="flex items-center gap-2 rounded-xl bg-brand-black px-4 py-2 font-bold text-white hover:bg-gray-800 disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    {editingEmployeeId ? 'تحديث' : 'حفظ'}
                                </button>
                                <button
                                    onClick={resetEmployeeForm}
                                    className="flex items-center gap-2 rounded-xl bg-gray-200 px-4 py-2 font-bold text-gray-700 hover:bg-gray-300"
                                >
                                    <X className="h-4 w-4" />
                                    إلغاء
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Employees List */}
                    {employees.length === 0 ? (
                        <div className="py-12 text-center text-gray-500">
                            <p className="mb-4">لا يوجد موظفين بعد</p>
                            <button
                                onClick={() => setIsAddingEmployee(true)}
                                className="inline-flex items-center gap-2 rounded-xl bg-brand-red px-4 py-2 font-bold text-white"
                            >
                                <Plus className="h-4 w-4" />
                                أضف أول موظف
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-right text-sm">
                                <thead className="bg-gray-50 text-gray-500">
                                    <tr>
                                        <th className="py-3 pr-4 rounded-r-lg">الاسم</th>
                                        <th className="py-3">البريد</th>
                                        <th className="py-3">الصلاحية</th>
                                        <th className="py-3">الحالة</th>
                                        <th className="py-3 pl-4 rounded-l-lg">إجراءات</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {employees.map(emp => (
                                        <tr key={emp.id} className={`group hover:bg-gray-50 ${!emp.is_active ? 'opacity-50' : ''}`}>
                                            <td className="py-4 pr-4 font-bold">{emp.full_name}</td>
                                            <td className="py-4 font-mono text-gray-500" dir="ltr">{emp.email}</td>
                                            <td className="py-4">
                                                <span className={`rounded-full px-2 py-1 text-xs font-bold ${emp.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {emp.role === 'admin' ? 'مسؤول' : 'عامل'}
                                                </span>
                                            </td>
                                            <td className="py-4">
                                                <button
                                                    onClick={() => toggleEmployeeActive(emp.id, emp.is_active)}
                                                    className={`rounded-full px-3 py-1 text-xs font-bold ${emp.is_active
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-gray-100 text-gray-500'
                                                        }`}
                                                >
                                                    {emp.is_active ? 'نشط' : 'معطل'}
                                                </button>
                                            </td>
                                            <td className="py-4 pl-4">
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => handleEditEmployee(emp)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-blue-600">
                                                        <Edit2 className="h-4 w-4" />
                                                    </button>
                                                    <button onClick={() => handleDeleteEmployee(emp.id)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-red-600">
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Employee Login Info */}
                    <div className="mt-6 rounded-xl bg-blue-50 p-4 border border-blue-100">
                        <h3 className="font-bold text-blue-900 mb-2">💡 كيفية تسجيل دخول الموظفين</h3>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• يفتح الموظف صفحة <code className="bg-blue-100 px-1 rounded">/login</code></li>
                            <li>• يدخل البريد وكلمة المرور المحددة له</li>
                            <li>• يرى قائمة السيارات المسجلة للعمل عليها</li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}
