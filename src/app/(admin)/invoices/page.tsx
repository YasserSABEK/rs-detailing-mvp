'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase';
import { Printer, Loader2, X } from 'lucide-react';

interface Invoice {
    id: string;
    created_at: string;
    booking_time: string;
    total_price: number;
    services: string[];
    car?: { make: string; model: string; plate_number: string };
    customer?: { phone: string; full_name: string };
}

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const printRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            const { data, error } = await supabase
                .from('bookings')
                .select(`
                    id,
                    created_at,
                    booking_time,
                    total_price,
                    services,
                    cars (make, model, plate_number),
                    customers (phone, full_name)
                `)
                .in('status', ['completed', 'delivered'])
                .is('deleted_at', null)
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;

            setInvoices(data?.map((b: any) => ({
                id: b.id,
                created_at: b.created_at,
                booking_time: b.booking_time,
                total_price: b.total_price,
                services: Array.isArray(b.services) ? b.services : [],
                car: b.cars,
                customer: b.customers
            })) || []);
        } catch (error) {
            console.error('Error fetching invoices:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = (invoice: Invoice) => {
        setSelectedInvoice(invoice);
    };

    const executePrint = () => {
        if (printRef.current) {
            const printContent = printRef.current.innerHTML;
            const printWindow = window.open('', '_blank', 'width=800,height=600');

            // Get current origin for images
            const origin = window.location.origin;
            const contentWithImages = printContent.replace(/src="\/logo.png"/g, `src="${origin}/logo.png"`);

            if (printWindow) {
                printWindow.document.write(`
                    <!DOCTYPE html>
                    <html dir="rtl" lang="ar">
                    <head>
                        <meta charset="UTF-8">
                        <title>فاتورة ${selectedInvoice?.id || 'RS Detailing'}</title>
                        <style>
                            @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap');
                            * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Cairo', sans-serif; }
                            body { 
                                padding: 0;
                                direction: rtl;
                                background: white;
                            }
                            .print-container {
                                width: 100%;
                                max-width: 800px;
                                margin: 0 auto;
                                padding: 40px;
                            }
                            @media print {
                                body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
                                .print-container { width: 100%; max-width: none; padding: 20px; }
                                @page { size: A4; margin: 0; }
                            }
                        </style>
                    </head>
                    <body>
                        ${contentWithImages}
                        <script>
                            window.onload = function() {
                                // Wait for image to load before printing
                                setTimeout(() => {
                                    window.print();
                                    window.close();
                                }, 500);
                            }
                        </script>
                    </body>
                    </html>
                `);
                printWindow.document.close();
            }
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('ar-DZ', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatInvoiceId = (id: string) => {
        return 'INV-' + id.slice(0, 6).toUpperCase();
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-brand-red" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">الفواتير (Factures)</h1>
                    <p className="text-gray-500">سجل العمليات المكتملة</p>
                </div>
            </div>

            {/* Invoices List */}
            <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
                {invoices.length === 0 ? (
                    <p className="py-12 text-center text-gray-500">لا توجد فواتير مكتملة</p>
                ) : (
                    <table className="w-full text-right text-sm">
                        <thead className="bg-gray-50 text-gray-500">
                            <tr>
                                <th className="py-4 pr-6">رقم الوصل</th>
                                <th className="py-4">التاريخ</th>
                                <th className="py-4">السيارة</th>
                                <th className="py-4">الخدمات</th>
                                <th className="py-4">المبلغ</th>
                                <th className="py-4 pl-6">طباعة</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {invoices.map((inv) => (
                                <tr key={inv.id} className="group hover:bg-gray-50 transition-colors">
                                    <td className="py-4 pr-6 font-mono text-gray-400">{formatInvoiceId(inv.id)}</td>
                                    <td className="py-4 font-mono text-gray-500">{formatDate(inv.created_at)}</td>
                                    <td className="py-4 font-bold">
                                        {inv.car ? `${inv.car.make} ${inv.car.model}` : 'غير محدد'}
                                    </td>
                                    <td className="py-4 text-gray-600">{inv.services.join(' + ') || '-'}</td>
                                    <td className="py-4 font-bold text-green-600" dir="ltr">{inv.total_price} DA</td>
                                    <td className="py-4 pl-6">
                                        <button
                                            onClick={() => handlePrint(inv)}
                                            className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-brand-black hover:text-white transition-colors"
                                        >
                                            <Printer className="h-4 w-4" />
                                            <span>طباعة</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Invoice Preview Modal */}
            {selectedInvoice && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="relative max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl bg-white p-8 shadow-2xl">

                        {/* Close Button */}
                        <button
                            onClick={() => setSelectedInvoice(null)}
                            className="absolute left-4 top-4 rounded-full bg-gray-100 p-2 hover:bg-gray-200"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        {/* Invoice Content (for printing) */}
                        <div ref={printRef} className="invoice bg-white hidden">
                            {/* This is hidden for user but used for print HTML generation */}
                            <div className="print-container">
                                <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', borderBottom: '2px solid #eee', paddingBottom: '20px' }}>
                                    <div className="company-info" style={{ textAlign: 'right' }}>
                                        <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#000', marginBottom: '5px' }}>RS DETAILING</h1>
                                        <p style={{ color: '#666', fontSize: '14px', marginBottom: '5px' }}>Lavage & Esthétique Auto</p>
                                        <p style={{ color: '#666', fontSize: '14px' }}>أم البواقي - بجانب وقف السبتي</p>
                                    </div>
                                    <div className="logo">
                                        <img src="/logo.png" alt="RS Detailing" style={{ width: '120px', height: 'auto' }} />
                                    </div>
                                </div>

                                <div className="invoice-details" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
                                    <div className="client-info" style={{ flex: 1 }}>
                                        <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px', color: '#DC2626' }}>معلومات الزبون:</h3>
                                        <div style={{ fontSize: '14px', lineHeight: '1.6', color: '#333' }}>
                                            <p><strong>الاسم:</strong> {selectedInvoice.customer?.full_name || 'زبون'}</p>
                                            <p><strong>الهاتف:</strong> {selectedInvoice.customer?.phone || '-'}</p>
                                            <p><strong>السيارة:</strong> {selectedInvoice.car?.make} {selectedInvoice.car?.model}</p>
                                            <p><strong>اللوحة:</strong> {selectedInvoice.car?.plate_number || '-'}</p>
                                        </div>
                                    </div>
                                    <div className="meta-info" style={{ flex: 1, textAlign: 'left' }}>
                                        <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px', color: '#DC2626' }}>تفاصيل الفاتورة:</h3>
                                        <div style={{ fontSize: '14px', lineHeight: '1.6', color: '#333' }}>
                                            <p><strong>رقم الفاتورة:</strong> {formatInvoiceId(selectedInvoice.id)}</p>
                                            <p><strong>التاريخ:</strong> {formatDate(selectedInvoice.created_at)}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="services-table" style={{ marginBottom: '40px' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ background: '#f9f9f9', borderBottom: '2px solid #000' }}>
                                                <th style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>وصف الخدمة</th>
                                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', width: '100px' }}>المبلغ</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedInvoice.services.map((svc, i) => (
                                                <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                                                    <td style={{ padding: '12px' }}>{svc}</td>
                                                    <td style={{ padding: '12px', textAlign: 'left', color: '#666' }}>-</td>
                                                </tr>
                                            ))}
                                            <tr style={{ background: '#DC2626', color: 'white' }}>
                                                <td style={{ padding: '15px', fontWeight: 'bold', fontSize: '18px' }}>المجموع الكلي</td>
                                                <td style={{ padding: '15px', textAlign: 'left', fontWeight: 'bold', fontSize: '18px' }}>
                                                    {selectedInvoice.total_price.toLocaleString()} DA
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <div className="footer" style={{ marginTop: '60px', textAlign: 'center', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                                    <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>شكراً لثقتكم بنا!</p>
                                    <p style={{ color: '#666', fontSize: '12px' }}>RS Detailing - أم البواقي - هاتف: 0662272721</p>
                                </div>
                            </div>
                        </div>

                        {/* Visual Preview (Visible to User) */}
                        <div className="border border-gray-200 rounded-lg p-6 mb-6 bg-gray-50 flex flex-col items-center justify-center text-center">
                            <img src="/logo.png" alt="Logo" className="h-16 mb-4" />
                            <h2 className="text-xl font-bold mb-2">معاينة الفاتورة</h2>
                            <p className="text-gray-500 mb-4">{formatInvoiceId(selectedInvoice.id)}</p>
                            <p className="font-bold text-2xl text-brand-red">{selectedInvoice.total_price.toLocaleString()} DA</p>
                        </div>

                        {/* Print Button */}
                        <button
                            onClick={executePrint}
                            className="mt-8 w-full flex items-center justify-center gap-2 rounded-xl bg-brand-black py-4 text-lg font-bold text-white hover:bg-gray-800"
                        >
                            <Printer className="h-5 w-5" />
                            طباعة الفاتورة
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
