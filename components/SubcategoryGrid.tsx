"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

interface Subcategory {
    id: string;
    name: string;
    name_uk?: string | null;
    name_pl?: string | null;
    slug: string;
    image?: string | null;
    [key: string]: any;
}

interface SubcategoryGridProps {
    categorySlug: string;
    subcategorySlug?: string;
    subcategories: Subcategory[];
    lang: string;
}

export function SubcategoryGrid({ categorySlug, subcategorySlug, subcategories, lang }: SubcategoryGridProps) {
    const [showAll, setShowAll] = useState(false);
    
    // We show "All" button + subcategories
    // On mobile 3 per row. One row is 3 items.
    // If we have "All" + 2 subcategories, it's 1 row.
    // If we have more, we might want to hide them.
    
    const itemsToShow = showAll ? subcategories : subcategories.slice(0, 5); // 1 (All) + 5 = 6 (2 rows)
    const hasMore = subcategories.length > 5;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-3 md:flex md:flex-wrap md:items-center gap-2 md:gap-4 transition-all duration-500">
                {/* "All" Card */}
                <Link 
                    href={`/${categorySlug}`}
                    className={`relative aspect-[4/3] md:w-48 overflow-hidden group transition-all duration-500 flex flex-col items-center justify-center border-2 ${!subcategorySlug 
                        ? 'bg-black border-black text-white shadow-lg z-20 scale-105' 
                        : 'bg-zinc-50 border-black/5 text-black/40 hover:border-black/20 hover:text-black z-10'}`}
                >
                    <div className="flex flex-col items-center gap-1">
                        <span className={`text-[9px] md:text-xs font-black uppercase tracking-[0.3em] transition-colors`}>
                            Все
                        </span>
                        <div className={`h-[1px] w-4 transition-all duration-500 ${!subcategorySlug ? 'bg-white/40 w-8' : 'bg-black/10 w-4'}`} />
                    </div>
                </Link>

                {itemsToShow.map((sub) => {
                    const isActive = subcategorySlug === sub.slug;
                    const name = sub[`name_${lang}`] || sub.name;
                    return (
                        <Link 
                            key={sub.id} 
                            href={`/${categorySlug}/${sub.slug}`}
                            className={`relative aspect-[4/3] md:w-48 bg-zinc-100 overflow-hidden group transition-all duration-500 ${isActive ? 'ring-2 ring-black ring-offset-2 z-20 scale-105 shadow-xl' : 'opacity-100 hover:opacity-100 z-10'}`}
                        >
                            <div className={`absolute inset-0 flex items-center justify-center transition-colors z-10 px-2 text-center ${isActive ? 'bg-black/40' : 'bg-black/30 group-hover:bg-black/20'}`}>
                                <span className="text-[8px] md:text-[11px] font-black uppercase tracking-wider text-white leading-tight drop-shadow-md">{name}</span>
                            </div>
                            {sub.image ? (
                                <img 
                                    src={sub.image} 
                                    alt={name}
                                    className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-110 grayscale-0"
                                />
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900" />
                            )}
                        </Link>
                    );
                })}
            </div>

            {hasMore && !showAll && (
                <div className="flex justify-center pt-2">
                    <button
                        onClick={() => setShowAll(true)}
                        className="flex items-center gap-2 px-6 py-3 border border-black/10 text-[9px] font-black uppercase tracking-[0.3em] hover:bg-black hover:text-white transition-all group"
                    >
                        Показати ще
                        <ChevronDown size={12} className="group-hover:translate-y-0.5 transition-transform" />
                    </button>
                </div>
            )}
        </div>
    );
}
