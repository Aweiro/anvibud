"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, LayoutGrid, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Subcategory {
    id: string;
    name: string;
    name_uk?: string | null;
    name_pl?: string | null;
    slug: string;
    image?: string | null;
}

interface Category {
    id: string;
    name: string;
    name_uk?: string | null;
    name_pl?: string | null;
    slug: string;
    image?: string | null;
    subcategories: Subcategory[];
}

interface SidebarCategoriesProps {
    categories: Category[];
    lang: string;
    translations: {
        categories_label: string;
    };
}

export function SidebarCategories({ categories, lang, translations }: SidebarCategoriesProps) {
    const [hoveredCategory, setHoveredCategory] = useState<Category | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const getLocalized = (item: any) => {
        if (lang === 'en') return item.name;
        return item[`name_${lang}`] || item.name;
    };

    const handleMouseEnter = (category: Category) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setHoveredCategory(category);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setHoveredCategory(null);
        }, 150);
    };

    return (
        <aside 
            className="hidden lg:flex flex-col w-[320px] bg-white border border-black/5 rounded-sm overflow-visible shadow-sm relative z-[100]"
            onMouseLeave={handleMouseLeave}
        >
            <div className="p-4 bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-between rounded-t-sm">
                <span>{translations.categories_label}</span>
                <ArrowRight size={14} />
            </div>
            
            <nav className="flex-1 py-2">
                {categories.map((category) => (
                    <div key={category.id} className="relative">
                        <Link
                            href={`/${category.slug}`}
                            onMouseEnter={() => handleMouseEnter(category)}
                            className={`flex items-center justify-between px-5 py-3 text-[11px] font-bold uppercase tracking-widest transition-all border-l-2 group ${hoveredCategory?.id === category.id ? "text-black bg-zinc-50 border-black" : "text-black/60 border-transparent hover:text-black hover:bg-zinc-50"}`}
                        >
                            <span>{getLocalized(category)}</span>
                            <ChevronRight 
                                size={14} 
                                className={`transition-all duration-300 ${hoveredCategory?.id === category.id ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"}`} 
                            />
                        </Link>
                    </div>
                ))}
            </nav>

            {/* Floating Subcategories Panel */}
            <AnimatePresence>
                {hoveredCategory && hoveredCategory.subcategories.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -5 }}
                        transition={{ duration: 0.2 }}
                        onMouseEnter={() => {
                            if (timeoutRef.current) clearTimeout(timeoutRef.current);
                        }}
                        className="absolute left-full top-[-1px] h-[calc(100%+2px)] w-[450px] bg-white border border-black/5 shadow-2xl z-[101] overflow-hidden flex flex-col"
                    >
                        <div className="p-6 bg-zinc-50 border-b border-black/5 flex items-center justify-between">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-black">
                                {getLocalized(hoveredCategory)}
                            </h4>
                            <span className="text-[9px] font-bold text-black/30 uppercase tracking-widest">
                                {hoveredCategory.subcategories.length} items
                            </span>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            <div className="grid grid-cols-1 gap-1">
                                {hoveredCategory.subcategories.map((sub) => (
                                    <Link
                                        key={sub.id}
                                        href={`/${hoveredCategory.slug}/${sub.slug}`}
                                        className="group p-3 rounded-sm hover:bg-zinc-50 text-black transition-all duration-300 flex items-center gap-4 border-b border-black/[0.02] last:border-0"
                                    >
                                        <div className="w-12 h-12 rounded-sm bg-zinc-100 flex-shrink-0 overflow-hidden border border-black/5 relative">
                                            {sub.image ? (
                                                <img 
                                                    src={sub.image} 
                                                    alt={getLocalized(sub)}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center opacity-20">
                                                    <LayoutGrid size={16} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase tracking-widest leading-tight">
                                                {getLocalized(sub)}
                                            </span>
                                            <ChevronRight size={12} className="opacity-0 group-hover:opacity-40 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Visual Preview in Menu */}
                        <div className="p-4 bg-zinc-50 border-t border-black/5">
                            <Link 
                                href={`/${hoveredCategory.slug}`}
                                className="flex items-center justify-center gap-3 w-full py-3 bg-black text-white text-[9px] font-black uppercase tracking-[0.3em] hover:bg-zinc-800 transition-all"
                            >
                                <LayoutGrid size={12} />
                                View All Category
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(0,0,0,0.05);
                    border-radius: 10px;
                }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb {
                    background: rgba(0,0,0,0.1);
                }
            `}</style>
        </aside>
    );
}
