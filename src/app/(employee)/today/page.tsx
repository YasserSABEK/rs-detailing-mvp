'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Plus, Clock, CheckCircle2, CircleDashed, Car } from 'lucide-react';
import { mockJobs, JobStatus } from './mock-data';
import { cn } from '@/lib/utils';

export default function TodayJobs() {
    // Use mock data for now
    const [jobs] = useState(mockJobs);

    const getStatusColor = (status: JobStatus) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-700 border-green-200';
            case 'working': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'checked_in': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-gray-100 text-gray-600 border-gray-200';
        }
    };

    const getStatusText = (status: JobStatus) => {
        switch (status) {
            case 'completed': return 'واجدة ✓';
            case 'working': return 'نخدمو فيها 🔧';
            case 'checked_in': return 'وصلت 🏁';
            case 'pending': return 'راجية ⏳';
            default: return status;
        }
    };

    return (
        <main className="flex min-h-screen flex-col bg-gray-50 pb-20">
            {/* Header */}
            <header className="sticky top-0 z-10 flex items-center justify-between bg-white px-4 py-4 shadow-sm">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">خدمة اليوم</h1>
                    <p className="text-xs text-gray-500">{new Date().toLocaleDateString('ar-DZ')}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 font-bold text-brand-red">
                    {jobs.length}
                </div>
            </header>

            {/* Jobs List */}
            <div className="flex flex-col gap-4 p-4">
                {jobs.map((job) => (
                    <Link
                        key={job.id}
                        href={`/employee/job/${job.id}`}
                        className="group relative overflow-hidden rounded-2xl bg-white p-4 shadow-sm transition active:scale-95"
                    >
                        <div className={`absolute left-0 top-0 h-full w-1 ${job.status === 'completed' ? 'bg-green-500' :
                                job.status === 'working' ? 'bg-yellow-500' : 'bg-gray-300'
                            }`} />

                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">{job.carModel}</h3>
                                <p className="font-mono text-sm text-gray-500">{job.plate}</p>
                            </div>
                            <div className={cn("rounded-full border px-3 py-1 text-xs font-bold", getStatusColor(job.status))}>
                                {getStatusText(job.status)}
                            </div>
                        </div>

                        <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                            <div className="flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1">
                                {job.services.join(' + ')}
                            </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                            <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{job.time}</span>
                            </div>
                            <span className="font-medium text-brand-red group-hover:underline">التفاصيل ←</span>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Floating Action Button */}
            <Link
                href="/employee/add-booking"
                className="fixed bottom-6 left-6 flex h-14 w-14 items-center justify-center rounded-full bg-brand-red text-white shadow-lg shadow-red-500/40 transition hover:bg-red-700 active:scale-90"
            >
                <Plus className="h-7 w-7" />
            </Link>

        </main>
    );
}
