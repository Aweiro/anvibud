"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function Footer() {
    const { t } = useLanguage();

    const sections = [
        {
            title: t('nav.store'),
            links: [
                { id: t('nav.all_products'), href: '/shop' },
                { id: t('nav.new_arrivals'), href: '/shop?sort=newest' },
                { id: t('nav.archives'), href: '/archives' },
                { id: t('nav.sale'), href: '/shop?label=SALE' }
            ]
        },
        {
            title: t('nav.about'),
            links: [
                { id: t('nav.our_story'), href: '/about' },
                { id: t('nav.manufacturing'), href: '/about#manufacturing' },
                { id: t('nav.sustainability'), href: '/about#sustainability' },
                { id: t('nav.materials'), href: '/about#materials' }
            ]
        },
        {
            title: t('nav.support'),
            links: [
                { id: t('nav.shipping'), href: '/support/shipping' },
                { id: t('nav.returns'), href: '/support/returns' },
                { id: t('nav.contact'), href: '/support/contact' },
                { id: t('nav.faq'), href: '/support/faq' },
                { id: t('nav.track_order'), href: '/support/track' }
            ]
        }
    ];

    return (
        <footer className="bg-black text-white pt-12 md:pt-32 pb-12 px-6 overflow-hidden">
            <div className="mx-auto max-w-[1800px]">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-14 lg:gap-16 mb-6 md:mb-32">
                    {/* Brand Column */}
                    <div className="space-y-10 lg:col-span-1">
                        <div>
                            <h2 className="text-4xl font-black tracking-tighter mb-4 italic flex items-center gap-2">
                                <span className="bg-white text-black px-2 py-0.5 transform -skew-x-12">ANVI</span>
                                <span>BUD</span>
                            </h2>
                            <p className="text-[11px] uppercase tracking-[0.2em] leading-loose text-white/40 max-w-xs">
                                {t('footer.tagline')}
                            </p>
                        </div>
                        <div className="flex gap-4">
                            {['IG', 'TW', 'FB', 'YT'].map(social => (
                                <span key={social} className="w-12 h-12 border border-white/10 flex items-center justify-center text-[10px] font-bold hover:bg-white hover:text-black transition-all duration-300 cursor-pointer group">
                                    <span className="group-hover:scale-110 transition-transform">{social}</span>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Navigation Columns */}
                    <div className="lg:col-span-2 grid grid-cols-2 lg:grid-cols-3 gap-12">
                        {sections.map((col, i) => (
                            <div key={i} className="space-y-8">
                                <h4 className="text-[12px] uppercase tracking-[0.4em] font-black">{col.title}</h4>
                                <ul className="space-y-5">
                                    {col.links.map(link => (
                                        <li key={link.id} className="text-[10px] uppercase tracking-[0.2em] text-white/40 hover:text-white hover:translate-x-1 transition-all cursor-pointer inline-block w-full">
                                            <Link href={link.href}>{link.id}</Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* Newsletter Column */}
                    <div className="space-y-10 lg:col-span-1">
                        <div className="space-y-6">
                            <h4 className="text-[12px] uppercase tracking-[0.4em] font-black">{t('footer.join_context')}</h4>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 leading-loose">
                                {t('footer.newsletter_desc')}
                            </p>
                        </div>
                        <div className="flex border-b border-white/20 focus-within:border-white transition-all duration-500 pb-3 group">
                            <input
                                type="email"
                                placeholder={t('footer.email_placeholder')}
                                className="bg-transparent border-none outline-none text-[10px] uppercase tracking-[0.3em] w-full placeholder:text-white/60"
                            />
                            <button className="text-[12px] font-bold group-hover:translate-x-2 transition-transform px-4">
                                &rarr;
                            </button>
                        </div>
                        <div className="text-[9px] uppercase tracking-[0.2em] text-white/20">
                            {t('footer.privacy_agreement')} <span className="underline cursor-pointer hover:text-white">{t('footer.privacy_policy')}</span>.
                        </div>
                    </div>
                </div>

                {/* Footer Bottom Line */}
                <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex flex-wrap justify-center md:justify-start gap-x-10 gap-y-4 text-[10px] uppercase tracking-[0.3em] font-bold text-white/20">
                        <span className="hover:text-white cursor-pointer transition-colors">{t('footer.privacy_policy')}</span>
                        <span className="hover:text-white cursor-pointer transition-colors">{t('footer.terms_of_service')}</span>
                        <span className="hover:text-white cursor-pointer transition-colors">{t('footer.cookie_settings')}</span>
                        <span className="hover:text-white cursor-pointer transition-colors">{t('footer.accessibility')}</span>
                    </div>
                    <div className="text-[10px] uppercase tracking-[0.4em] font-black text-white/20">
                        ANVIBUD © 2026. {t('all_rights_reserved')}.
                    </div>
                </div>
            </div>
        </footer>
    );
}
