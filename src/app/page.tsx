import Link from "next/link";
import Image from "next/image";
import {
    ArrowLeft,
    CheckCircle2,
    Clock,
    MapPin,
    Phone,
    ShieldCheck,
    Sparkles,
    Star,
    Trophy,
    Users
} from "lucide-react";

export default function Home() {
    return (
        <main className="min-h-screen bg-black text-white selection:bg-brand-red selection:text-white">

            {/* Mobile Floating Action Button (Call Now) */}
            <a
                href="tel:0662272721"
                className="fixed bottom-6 left-6 z-50 flex h-14 w-14 animate-bounce items-center justify-center rounded-full bg-brand-red text-white shadow-xl shadow-brand-red/40 transition hover:bg-red-600 active:scale-95 md:hidden"
            >
                <Phone className="h-6 w-6" />
            </a>

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/90 backdrop-blur-md">
                <div className="container mx-auto flex h-20 items-center justify-between px-6">
                    <div className="relative h-12 w-48">
                        <Image
                            src="/logo.png"
                            alt="RS Detailing Logo"
                            fill
                            className="object-contain object-left"
                            priority
                        />
                    </div>
                    <div className="hidden items-center gap-8 md:flex">
                        <a href="#services" className="text-sm font-bold uppercase tracking-widest text-gray-400 transition hover:text-white">الخدمات</a>
                        <a href="#process" className="text-sm font-bold uppercase tracking-widest text-gray-400 transition hover:text-white">كيف نعمل</a>
                        <a href="#gallery" className="text-sm font-bold uppercase tracking-widest text-gray-400 transition hover:text-white">أعمالنا</a>
                        <a href="#contact" className="text-sm font-bold uppercase tracking-widest text-gray-400 transition hover:text-white">اتصل بنا</a>
                    </div>
                    <a
                        href="tel:0662272721"
                        className="rounded-full bg-brand-red px-6 py-2 text-sm font-bold text-white transition hover:bg-red-600 hover:shadow-lg hover:shadow-brand-red/25 flex items-center gap-2"
                    >
                        <Phone className="h-4 w-4" />
                        <span>اتصل بنا</span>
                    </a>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-20">
                {/* Abstract Background */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-neutral-900 via-black to-black" />
                    <div className="absolute -right-1/4 -top-1/4 h-[800px] w-[800px] rounded-full bg-brand-red/5 blur-[120px]" />
                    <div className="absolute -bottom-1/4 -left-1/4 h-[600px] w-[600px] rounded-full bg-blue-900/10 blur-[100px]" />
                </div>

                <div className="container relative z-10 px-6 text-center">
                    <div className="mx-auto mb-6 flex w-fit animate-fade-in items-center gap-2 rounded-full border border-brand-red/30 bg-brand-red/10 px-4 py-1.5 text-sm font-medium text-brand-red backdrop-blur-sm">
                        <Trophy className="h-4 w-4" />
                        <span>الإختيار الأول للعناية بالسيارات</span>
                    </div>

                    <h1 className="mx-auto mb-8 max-w-5xl text-5xl font-black leading-tight tracking-tighter md:text-7xl lg:text-8xl">
                        فن العناية <br />
                        <span className="bg-gradient-to-r from-brand-red to-red-500 bg-clip-text text-transparent">بالتفاصيل الدقيقة</span>
                    </h1>

                    <p className="mx-auto mb-12 max-w-2xl text-lg text-gray-400 leading-relaxed">
                        نحن لا نغسل السيارات فحسب، بل نعيد إليها روحها. خدمة احترافية، مواد عالمية، ونتيجة تبهرك في كل مرة.
                    </p>

                    <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <a
                            href="#contact"
                            className="group flex min-w-[200px] items-center justify-center gap-2 rounded-full bg-brand-red px-8 py-4 text-lg font-bold text-white transition hover:bg-red-600 hover:shadow-lg hover:shadow-brand-red/25"
                        >
                            <span>احجز موعدك</span>
                            <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                        </a>
                        <a
                            href="#gallery"
                            className="flex min-w-[200px] items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-8 py-4 text-lg font-bold text-white transition hover:bg-white/10 backdrop-blur-sm"
                        >
                            <span>شاهد أعمالنا</span>
                        </a>
                    </div>

                    {/* Stats */}
                    <div className="mt-20 grid grid-cols-2 gap-8 border-t border-white/10 pt-8 md:grid-cols-4">
                        {[
                            { label: 'سنة خبرة', value: '+5' },
                            { label: 'سيارة', value: '+5000' },
                            { label: 'عميل سعيد', value: '100%' },
                            { label: 'يومياً', value: '7/7' },
                        ].map((stat, i) => (
                            <div key={i}>
                                <div className="text-3xl font-black text-white md:text-4xl">{stat.value}</div>
                                <div className="text-xs uppercase tracking-wider text-gray-500">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section id="services" className="py-32 bg-zinc-950">
                <div className="container mx-auto px-6">
                    <div className="mb-20 text-center">
                        <h2 className="mb-4 text-4xl font-bold text-white md:text-5xl">خدماتنا</h2>
                        <div className="mx-auto h-1 w-20 bg-brand-red rounded-full" />
                    </div>

                    <div className="grid gap-8 md:grid-cols-3">
                        {[
                            {
                                title: 'تلميع و تصحيح الطلاء',
                                desc: 'إزالة الخدوش، الدوائر، وعلامات الغسيل السيئ لاستعادة عمق اللون واللمعان.',
                                icon: Sparkles,
                                price: '3000 دج',
                                features: ['تلميع ساطع', 'إزالة الخدوش', 'تشميع وقائي']
                            },
                            {
                                title: 'حماية السيراميك (Ceramic)',
                                desc: 'حماية طويلة الأمد تصل لـ 5 سنوات ضد العوامل الجوية مع خاصية طرد الماء.',
                                icon: ShieldCheck,
                                price: '15000 دج',
                                features: ['حماية 9H', 'سهولة الغسيل', 'لمعان زجاجي']
                            },
                            {
                                title: 'الغسيل الممتاز (Premium)',
                                desc: 'عناية فائقة بالتفاصيل الداخلية والخارجية باستخدام أفضل المواد الآمنة.',
                                icon: CheckCircle2,
                                price: '1500 دج',
                                features: ['تنظيف المحرك', 'تعقيم داخلي', 'تلميع الإطارات']
                            }
                        ].map((service, i) => (
                            <div key={i} className="group relative overflow-hidden rounded-[2rem] bg-neutral-900 p-8 transition hover:-translate-y-2 hover:shadow-2xl">
                                <div className="absolute right-0 top-0 h-32 w-32 translate-x-16 translate-y-[-50%] rounded-full bg-brand-red/10 blur-[40px] transition group-hover:bg-brand-red/20" />

                                <div className="mb-8 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-white transition group-hover:bg-brand-red group-hover:text-white">
                                    <service.icon className="h-8 w-8" />
                                </div>

                                <h3 className="mb-4 text-2xl font-bold">{service.title}</h3>
                                <p className="mb-8 text-gray-400">{service.desc}</p>

                                <ul className="mb-8 space-y-3">
                                    {service.features.map((feat, j) => (
                                        <li key={j} className="flex items-center gap-3 text-sm text-gray-300">
                                            <CheckCircle2 className="h-4 w-4 text-brand-red" />
                                            {feat}
                                        </li>
                                    ))}
                                </ul>

                                <div className="border-t border-white/10 pt-6 flex items-center justify-between">
                                    <span className="text-sm text-gray-500">بداية من</span>
                                    <span className="text-2xl font-bold text-brand-red">{service.price}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Process Section */}
            <section id="process" className="py-32 bg-black border-y border-white/5">
                <div className="container mx-auto px-6">
                    <div className="mb-20 text-center">
                        <h2 className="mb-4 text-4xl font-bold text-white md:text-5xl">خطوات العمل</h2>
                        <p className="text-gray-400">كيف نضمن أفضل نتيجة لسيارتك</p>
                    </div>

                    <div className="grid gap-12 md:grid-cols-4">
                        {[
                            { step: '01', title: 'الفحص', desc: 'نفحص حالة السيارة وننصحك بالخدمة المناسبة.' },
                            { step: '02', title: 'التجهيز', desc: 'غسيل مبدئي وإزالة الشوائب العالقة بالطلاء.' },
                            { step: '03', title: 'المعالجة', desc: 'عملية التلميع أو التنظيف بأدوات احترافية.' },
                            { step: '04', title: 'المراقبة', desc: 'فحص نهائي تحت الإضاءة للتأكد من الجودة.' }
                        ].map((item, i) => (
                            <div key={i} className="relative text-center">
                                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-neutral-900 text-3xl font-black text-brand-red shadow-xl">
                                    {item.step}
                                </div>
                                <h3 className="mb-2 text-xl font-bold">{item.title}</h3>
                                <p className="text-sm text-gray-500">{item.desc}</p>
                                {i !== 3 && (
                                    <div className="hidden md:block absolute top-10 left-0 w-full h-[2px] bg-gradient-to-l from-transparent via-white/10 to-transparent -translate-x-1/2 -z-10" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-24 bg-zinc-950">
                <div className="container mx-auto px-6">
                    <h2 className="mb-16 text-center text-3xl font-bold">ماذا يقول عملاؤنا</h2>
                    <div className="grid gap-6 md:grid-cols-3">
                        {[
                            { name: 'محمد أمين', text: 'خدمة في القمة، سيارتي رجعت جديدة. الله يبارك.', car: 'Golf 8' },
                            { name: 'ياسين ب.', text: 'تعامل راقي واحترافية عالية. أنصح بهم بشدة.', car: 'Mercedes A-Class' },
                            { name: 'رياض س.', text: 'السيراميك عندهم حاجة فور بزاف. شكراً للفريق.', car: 'Range Rover' },
                        ].map((review, i) => (
                            <div key={i} className="rounded-2xl bg-black p-8 border border-white/5">
                                <div className="flex gap-1 mb-4 text-yellow-500">
                                    {[1, 2, 3, 4, 5].map(star => <Star key={star} className="h-4 w-4 fill-current" />)}
                                </div>
                                <p className="mb-6 text-gray-300">"{review.text}"</p>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-brand-red/20 flex items-center justify-center font-bold text-brand-red">
                                        {review.name[0]}
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm">{review.name}</div>
                                        <div className="text-xs text-gray-500">{review.car}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-24 bg-zinc-950">
                <div className="container mx-auto px-6">
                    <div className="mx-auto max-w-3xl text-center">
                        <h2 className="mb-12 text-3xl font-bold">أسئلة شائعة</h2>
                        <div className="space-y-4 text-right">
                            {[
                                { q: 'كم تستغرق عملية التلميع؟', a: 'تستغرق عادةً من يوم إلى يومين حسب حالة السيارة ونوع التلميع المطلوب.' },
                                { q: 'هل يجب حجز موعد مسبقاً؟', a: 'نعم، نفضل الحجز المسبق لضمان تقديم أفضل خدمة وتخصيص الوقت الكافي لسيارتكم.' },
                                { q: 'ما هي المواد التي تستخدمونها؟', a: 'نستخدم منتجات عالمية عالية الجودة (مثل Meguiar\'s, Koch Chemie) لضمان أفضل النتائج والحفاظ على طلاء السيارة.' },
                            ].map((faq, i) => (
                                <div key={i} className="rounded-2xl bg-black border border-white/5 p-6 transition hover:border-brand-red/30">
                                    <h3 className="mb-2 text-lg font-bold text-white">{faq.q}</h3>
                                    <p className="text-gray-400">{faq.a}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact & Map */}
            <section id="contact" className="relative py-24 bg-black">
                <div className="container mx-auto px-6">
                    <div className="overflow-hidden rounded-[2.5rem] bg-neutral-900 border border-white/10">
                        <div className="grid lg:grid-cols-2">
                            <div className="p-12 lg:p-16">
                                <h2 className="mb-8 text-4xl font-bold">تفضل بزيارتنا</h2>

                                <div className="space-y-8">
                                    <div className="flex gap-6">
                                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/5 text-brand-red">
                                            <MapPin className="h-7 w-7" />
                                        </div>
                                        <div>
                                            <h3 className="mb-1 text-lg font-bold">الموقع</h3>
                                            <p className="text-gray-400">أم البواقي</p>
                                            <p className="text-sm text-gray-500 mt-1">بجانب وقف السبتي</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-6">
                                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/5 text-brand-red">
                                            <Phone className="h-7 w-7" />
                                        </div>
                                        <div>
                                            <h3 className="mb-1 text-lg font-bold">اتصل بنا</h3>
                                            <p className="text-gray-400 text-xl font-mono" dir="ltr">06 62 27 27 21</p>
                                            <p className="text-sm text-gray-500 mt-1">متاحون للإجابة على استفساراتكم</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-6">
                                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/5 text-brand-red">
                                            <Clock className="h-7 w-7" />
                                        </div>
                                        <div>
                                            <h3 className="mb-1 text-lg font-bold">ساعات العمل</h3>
                                            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-gray-400 text-sm">
                                                <span>يومياً</span>
                                                <span className="text-white">10:00 - 22:00</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Map Embed - Place Link Goes Here */}
                            <div className="relative h-full min-h-[400px] bg-gray-800">
                                <iframe
                                    src="https://maps.google.com/maps?q=35.8720184,7.1189545&t=&z=15&ie=UTF8&iwloc=&output=embed"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0, filter: 'grayscale(100%) invert(90%)' }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    className="absolute inset-0"
                                />
                                <div className="absolute bottom-6 right-6 z-10 w-40">
                                    <a
                                        href="https://maps.app.goo.gl/zh2KeLh4zLfHF3xK9"
                                        target="_blank"
                                        className="flex items-center justify-center gap-2 rounded-xl bg-brand-red px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-red-700 hover:scale-105"
                                    >
                                        <MapPin className="h-4 w-4" />
                                        <span>فتح في Maps</span>
                                    </a>
                                </div>
                                <div className="absolute inset-0 pointer-events-none border-l border-white/10" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/10 bg-black py-12">
                <div className="container mx-auto px-6 flex flex-col items-center justify-between gap-6 md:flex-row">
                    <div className="text-2xl font-bold tracking-tighter">
                        RS <span className="text-brand-red">DETAILING</span>
                    </div>
                    <div className="text-sm text-gray-600">
                        © {new Date().getFullYear()} designed by Agence AuraGraph.
                    </div>
                </div>
                <div className="mt-8 text-center">
                    <Link href="/login" className="text-xs text-zinc-900 transition hover:text-zinc-700">
                        دخول الموظفين
                    </Link>
                </div>
            </footer>

        </main >
    );
}
