'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Play, CheckCircle2, Check, Clock, Car, Phone } from 'lucide-react';
import { mockJobs, JobStatus } from '../../today/mock-data';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function JobDetail({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);

    // Mock fetching job
    const job = mockJobs.find(j => j.id === id);
    const [status, setStatus] = useState<JobStatus>(job?.status || 'pending');

    if (!job) return <div>Job not found</div>;

    const handleStatusChange = (newStatus: JobStatus) => {
        setStatus(newStatus);
        // In real app, we would call API here
    };

    return (
        <main className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <header className="sticky top-0 z-10 flex items-center gap-4 bg-white px-4 py-4 shadow-sm">
                <Link href="/employee/today" className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                    <ChevronLeft className="h-6 w-6 text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-lg font-bold text-gray-900">{job.carModel}</h1>
                    <p className="font-mono text-xs text-gray-500">{job.plate}</p>
                </div>
                <div className={cn("mr-auto rounded-full px-3 py-1 text-xs font-bold",
                    status === 'completed' ? 'bg-green-100 text-green-700' :
                        status === 'working' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-600'
                )}>
                    {status === 'completed' ? 'واجدة' : status === 'working' ? 'في العمل' : 'راجية'}
                </div>
            </header>

            <div className="p-4 space-y-6">

                {/* Car Info Card */}
                <div className="rounded-2xl bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center bg-gray-100`}>
                            <Car className="h-6 w-6 text-gray-600" />
                        </div>
                        <div>
                            <div className="text-sm text-gray-500">السيارة</div>
                            <div className="font-bold">{job.carModel}</div>
                            <div className="text-xs text-gray-400">{job.color}</div>
                        </div>
                    </div>
                    {/* Allow calling customer (hidden for employee in strict mode, but nice to have if authorized) */}
                    {/* <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-50 py-3 text-sm font-medium text-gray-700">
             <Phone className="h-4 w-4" />
             اتصال بالزبون
           </button> */}
                </div>

                {/* Services List */}
                <div className="rounded-2xl bg-white p-5 shadow-sm">
                    <h3 className="mb-4 font-bold text-gray-900">الخدمات المطلوبة</h3>
                    <ul className="space-y-3">
                        {job.services.map((service, idx) => (
                            <li key={idx} className="flex items-center gap-3">
                                <CheckCircle2 className="h-5 w-5 text-brand-red" />
                                <span className="font-medium text-gray-700">{service}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Actions - The "Workflow" */}
                <div className="fixed bottom-0 left-0 w-full bg-white p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">

                    {status === 'pending' || status === 'checked_in' ? (
                        <button
                            onClick={() => handleStatusChange('working')}
                            className="flex w-full items-center justify-center gap-3 rounded-xl bg-brand-black py-4 text-lg font-bold text-white shadow-lg active:scale-95"
                        >
                            <Play className="h-6 w-6" />
                            <span>بداية العمل</span>
                        </button>
                    ) : status === 'working' ? (
                        <div className="flex gap-3">
                            <button
                                onClick={() => handleStatusChange('completed')}
                                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 py-4 text-lg font-bold text-white shadow-lg active:scale-95"
                            >
                                <Check className="h-6 w-6" />
                                <span>كملت (Finis)</span>
                            </button>
                        </div>
                    ) : status === 'completed' ? (
                        <button
                            onClick={() => handleStatusChange('delivered')}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 py-4 text-lg font-bold text-white shadow-lg active:scale-95"
                        >
                            <CheckCircle2 className="h-6 w-6" />
                            <span>تسليم للزبون (Livrer)</span>
                        </button>
                    ) : (
                        <div className="text-center font-bold text-green-600 py-2">
                            تم التسليم ✓
                        </div>
                    )}
                </div>

            </div>
        </main>
    );
}
