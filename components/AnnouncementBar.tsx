import { prisma } from "@/lib/prisma";
import { getServerTranslation } from "@/lib/i18n/server";
import Link from "next/link";

export async function AnnouncementBar() {
    const settings = await prisma.siteSettings.findUnique({
        where: { id: "global" }
    });

    if (!settings || !settings.announcementActive) return null;

    const items = Array.isArray(settings.announcementItems) ? settings.announcementItems : [];
    if (items.length === 0) return null;

    const { lang } = await getServerTranslation();
    const speed = settings.announcementSpeed ?? 30;
    const isStatic = speed === 0;

    return (
        <div 
            style={{ 
                backgroundColor: settings.announcementBgColor || "#000000",
                color: settings.announcementTextColor || "#ffffff"
            }}
            className="announcement-bar w-full py-2.5 px-4 overflow-hidden relative z-[40] border-b border-white/5"
        >
            <div className="mx-auto max-w-[1800px]">
                <div 
                    className={`flex items-center gap-12 md:gap-24 whitespace-nowrap ${isStatic ? "justify-center" : "animate-marquee hover:[animation-play-state:paused] cursor-default"}`}
                    style={!isStatic ? { animationDuration: `${speed}s` } : {}}
                >
                    {/* Repeat items many times to ensure continuous marquee, unless static */}
                    {(isStatic ? items : Array.from({ length: 10 }).flatMap(() => items)).map((item: any, i, arr) => {
                        const text = item[`text_${lang}`] || item.text_en || item.text_uk || "";
                        const isLast = i === arr.length - 1;
                        
                        const content = (
                            <div key={i} className="flex items-center gap-12 md:gap-24">
                                <span className="text-[10px] font-black uppercase tracking-[0.25em] flex items-center">
                                    {text}
                                </span>
                                {(!isStatic || !isLast) && (
                                    <span className="text-current opacity-20 font-light">|</span>
                                )}
                            </div>
                        );

                        if (item.link) {
                            return (
                                <Link key={i} href={item.link} className="hover:opacity-70 transition-opacity">
                                    {content}
                                </Link>
                            );
                        }

                        return <div key={i}>{content}</div>;
                    })}
                </div>
            </div>
        </div>
    );
}
