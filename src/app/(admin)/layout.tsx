'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Wallet,
    Receipt,
    Settings,
    LogOut,
    Menu,
    X,
    FileText,
    PlusCircle,
    Car,
    BarChart3
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const MENU_ITEMS = [
    { name: 'الرئيسية', icon: LayoutDashboard, href: '/dashboard' },
    { name: 'حجز جديد', icon: PlusCircle, href: '/bookings/new' },
    { name: 'كل الحجوزات', icon: Car, href: '/bookings' },
    { name: 'التحليلات', icon: BarChart3, href: '/analytics' },
    { name: 'غلق الصندوق', icon: Wallet, href: '/cash-register' },
    { name: 'المصاريف', icon: Receipt, href: '/expenses' },
    { name: 'الفواتير', icon: FileText, href: '/invoices' },
    { name: 'الإعدادات', icon: Settings, href: '/settings' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-100 font-sans">

            {/* Mobile Header */}
            <div className="flex items-center justify-between bg-white p-4 shadow-sm lg:hidden">
                <button onClick={() => setSidebarOpen(!isSidebarOpen)}>
                    <Menu className="h-6 w-6 text-gray-700" />
                </button>
                <span className="font-bold text-gray-900">RS Detailing Admin</span>
                <div className="w-6" /> {/* Spacer */}
            </div>

            <div className="flex h-screen overflow-hidden">

                {/* Sidebar Overlay (Mobile) */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 z-20 bg-black/50 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <aside className={cn(
                    "fixed inset-y-0 right-0 z-30 w-64 transform bg-gray-900 text-white transition-transform duration-200 lg:static lg:translate-x-0",
                    isSidebarOpen ? "translate-x-0" : "translate-x-full"
                )}>
                    <div className="flex h-16 items-center justify-between px-6">
                        <h2 className="text-xl font-bold tracking-wider">RS DETAILING</h2>
                        <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <nav className="space-y-1 px-3 py-4">
                        {MENU_ITEMS.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-brand-red text-white shadow-md"
                                            : "text-gray-400 hover:bg-gray-800 hover:text-white"
                                    )}
                                >
                                    <item.icon className="h-5 w-5" />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="absolute bottom-4 w-full px-3">
                        <Link
                            href="/"
                            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-400 hover:bg-gray-800"
                        >
                            <LogOut className="h-5 w-5" />
                            <span>تسجيل الخروج</span>
                        </Link>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto bg-gray-50 p-4 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
