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
            if (printWindow) {
                printWindow.document.write(`
                    <!DOCTYPE html>
                    <html dir="rtl" lang="ar">
                    <head>
                        <meta charset="UTF-8">
                        <title>فاتورة RS Detailing</title>
                        <style>
                            * { margin: 0; padding: 0; box-sizing: border-box; }
                            body { 
                                font-family: 'Arial', sans-serif; 
                                padding: 40px;
                                direction: rtl;
                            }
                            .invoice { max-width: 600px; margin: 0 auto; }
                            .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #000; padding-bottom: 20px; }
                            .header h1 { font-size: 32px; letter-spacing: 4px; margin-bottom: 5px; }
                            .header p { font-size: 14px; color: #666; }
                            .info { margin-bottom: 30px; }
                            .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #ccc; }
                            .info-row span:first-child { font-weight: bold; }
                            .services { margin: 30px 0; }
                            .services h3 { margin-bottom: 15px; font-size: 18px; }
                            .service-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
                            .total { margin-top: 30px; padding: 20px; background: #f5f5f5; border-radius: 8px; }
                            .total-row { display: flex; justify-content: space-between; font-size: 24px; font-weight: bold; }
                            .footer { margin-top: 40px; text-align: center; font-size: 14px; color: #666; }
                            @media print {
                                body { padding: 20px; }
                                @page { size: A4; margin: 15mm; }
                            }
                        </style>
                    </head>
                    <body>
                        ${printContent}
                        <script>window.onload = function() { window.print(); window.close(); }</script>
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
                        <div ref={printRef} className="invoice">
                            <div className="header">
                                <h1>RS DETAILING</h1>
                                <p>Lavage & Esthétique Auto</p>
                                <p style={{ marginTop: '10px' }}>أم البواقي - بجانب وقف السبتي</p>
                            </div>

                            <div className="info">
                                <div className="info-row">
                                    <span>رقم الفاتورة:</span>
                                    <span>{formatInvoiceId(selectedInvoice.id)}</span>
                                </div>
                                <div className="info-row">
                                    <span>التاريخ:</span>
                                    <span>{formatDate(selectedInvoice.created_at)}</span>
                                </div>
                                {selectedInvoice.car && (
                                    <>
                                        <div className="info-row">
                                            <span>السيارة:</span>
                                            <span>{selectedInvoice.car.make} {selectedInvoice.car.model}</span>
                                        </div>
                                        <div className="info-row">
                                            <span>رقم اللوحة:</span>
                                            <span>{selectedInvoice.car.plate_number || '-'}</span>
                                        </div>
                                    </>
                                )}
                                {selectedInvoice.customer && (
                                    <div className="info-row">
                                        <span>الزبون:</span>
                                        <span>{selectedInvoice.customer.full_name || selectedInvoice.customer.phone}</span>
                                    </div>
                                )}
                            </div>

                            <div className="services">
                                <h3>الخدمات المقدمة:</h3>
                                {selectedInvoice.services.map((svc, i) => (
                                    <div key={i} className="service-item">
                                        <span>{svc}</span>
                                        <span>✓</span>
                                    </div>
                                ))}
                            </div>

                            <div className="total">
                                <div className="total-row">
                                    <span>المجموع الكلي:</span>
                                    <span>{selectedInvoice.total_price.toLocaleString()} DA</span>
                                </div>
                            </div>

                            <div className="footer">
                                <p>شكراً لزيارتكم - Merci de votre visite</p>
                                <p style={{ marginTop: '5px' }}>📞 06 62 27 27 21</p>
                            </div>
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
