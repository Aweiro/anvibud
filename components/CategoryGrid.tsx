"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

interface Category {
    id: string;
    name: string;
    name_uk?: string | null;
    name_ru?: string | null;
    name_pl?: string | null;
    slug: string;
    image?: string | null;
    [key: string]: any;
}

interface CategoryGridProps {
    categories: Category[];
    lang: string;
    translations: {
        browse_store: string;
    };
}

export function CategoryGrid({ categories, lang, translations }: CategoryGridProps) {
    const [showAll, setShowAll] = useState(false);
    
    const visibleCategories = showAll ? categories : categories.slice(0, 6);
    const hasMore = categories.length > 6;

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
                {visibleCategories.map((cat) => (
                    <Link
                        key={cat.id}
                        href={`/${cat.slug}`}
                        className="group relative aspect-[1/1] md:aspect-[16/10] bg-[#f9f9f9] overflow-hidden"
                    >
                        {cat.image && (
                            <img
                                src={cat.image}
                                alt={cat.name}
                                className="absolute inset-0 w-full h-full object-cover grayscale-0 group-hover:grayscale opacity-100 transition-all duration-700 group-hover:scale-105"
                            />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity md:bg-transparent md:group-hover:bg-black/20 md:transition-colors md:duration-500" />
                        <div className="absolute inset-0 p-4 md:p-10 flex flex-col justify-end">
                            <h4 className="text-white text-[12px] md:text-3xl font-black uppercase tracking-wider drop-shadow-lg leading-[1.1] break-words">
                                {(lang === 'en' ? cat.name : cat[`name_${lang}`] || cat.name)}
                            </h4>
                        </div>
                    </Link>
                ))}
            </div>

            {hasMore && !showAll && (
                <div className="flex justify-center pt-4">
                    <button
                        onClick={() => setShowAll(true)}
                        className="flex items-center gap-3 px-8 py-4 border-2 border-black text-[10px] font-black uppercase tracking-[0.3em] hover:bg-black hover:text-white transition-all group"
                    >
                        Показати ще
                        <ChevronDown size={14} className="group-hover:translate-y-1 transition-transform" />
                    </button>
                </div>
            )}
        </div>
    );
}
