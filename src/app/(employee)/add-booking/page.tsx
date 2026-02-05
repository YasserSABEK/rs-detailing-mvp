'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Save, Car, Check, User, Phone } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

// Mock Services for selection
const SERVICES = [
    { id: '1', name: 'غسيل كامل (Lavage Complet)', price: 1500 },
    { id: '2', name: 'غسيل خارجي (Extérieur)', price: 600 },
    { id: '3', name: 'غسيل داخلي (Intérieur)', price: 800 },
    { id: '4', name: 'تلميع (Polissage)', price: 3000 },
    { id: '5', name: 'سيراميك (Céramique)', price: 15000 },
];

export default function AddBooking() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Form State
    const [carModel, setCarModel] = useState('');
    const [plate, setPlate] = useState('');
    const [phone, setPhone] = useState('');
    const [selectedServices, setSelectedServices] = useState<string[]>([]);

    const toggleService = (id: string) => {
        setSelectedServices(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const calculateTotal = () => {
        return selectedServices.reduce((total, id) => {
            const service = SERVICES.find(s => s.id === id);
            return total + (service?.price || 0);
        }, 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate API call
        console.log({ carModel, plate, phone, selectedServices });

        setTimeout(() => {
            setLoading(false);
            router.push('/employee/today');
        }, 1000);
    };

    return (
        <main className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <header className="sticky top-0 z-10 flex items-center gap-4 bg-white px-4 py-4 shadow-sm">
                <Link href="/employee/today" className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                    <ChevronLeft className="h-6 w-6 text-gray-600" />
                </Link>
                <h1 className="text-xl font-bold text-gray-900">حجز جديد</h1>
            </header>

            <form onSubmit={handleSubmit} className="p-4 space-y-6">

                {/* Car Details */}
                <section className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <Car className="h-5 w-5 text-gray-500" />
                        <h2 className="font-bold text-gray-900">معلومات السيارة</h2>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-600">نوع السيارة (Voiture)</label>
                            <input
                                type="text"
                                required
                                placeholder="مثال: Golf 7, Mercedes..."
                                className="w-full rounded-xl border-gray-200 bg-gray-50 p-3 outline-none ring-brand-red focus:ring-2"
                                value={carModel}
                                onChange={e => setCarModel(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-600">الترقيم (Matricule)</label>
                                <input
                                    type="text"
                                    placeholder="00000-123-16"
                                    className="w-full rounded-xl border-gray-200 bg-gray-50 p-3 text-left font-mono outline-none ring-brand-red focus:ring-2"
                                    value={plate}
                                    onChange={e => setPlate(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-600">الهاتف (Tél)</label>
                                <input
                                    type="tel"
                                    placeholder="05..."
                                    className="w-full rounded-xl border-gray-200 bg-gray-50 p-3 text-left outline-none ring-brand-red focus:ring-2"
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Services Selection */}
                <section className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <Check className="h-5 w-5 text-gray-500" />
                        <h2 className="font-bold text-gray-900">الخدمات</h2>
                    </div>

                    <div className="space-y-2">
                        {SERVICES.map(service => (
                            <button
                                key={service.id}
                                type="button"
                                onClick={() => toggleService(service.id)}
                                className={cn(
                                    "flex w-full items-center justify-between rounded-xl border p-3 transition-all",
                                    selectedServices.includes(service.id)
                                        ? "border-brand-red bg-red-50 text-brand-red"
                                        : "border-gray-100 bg-gray-50 text-gray-700"
                                )}
                            >
                                <span className="font-bold">{service.name}</span>
                                <span className="text-sm font-mono">{service.price} DA</span>
                            </button>
                        ))}
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t pt-4">
                        <span className="text-lg font-bold text-gray-900">المجموع:</span>
                        <span className="text-xl font-bold text-brand-red">{calculateTotal()} DA</span>
                    </div>
                </section>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading || !carModel || selectedServices.length === 0}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-black py-4 text-lg font-bold text-white shadow-lg transition active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                >
                    {loading ? 'جاري الحفظ...' : (
                        <>
                            <Save className="h-5 w-5" />
                            <span>إضافة الحجز (Enregistrer)</span>
                        </>
                    )}
                </button>

            </form>
        </main>
    );
}
