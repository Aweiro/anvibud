"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCartStore } from "@/lib/stores/cart.store";
import { useWishlistStore } from "@/lib/stores/wishlist.store";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Search, Menu, X, ChevronRight, ShoppingBag, Heart, LayoutGrid } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Subcategory = {
    id: string;
    name: string;
    name_uk?: string | null;
    name_ru?: string | null;
    name_pl?: string | null;
    slug: string;
    image?: string | null;
};
type Category = {
    id: string;
    name: string;
    name_uk?: string | null;
    name_ru?: string | null;
    name_pl?: string | null;
    slug: string;
    subcategories: Subcategory[];
    image?: string | null;
};

export function HeaderClient({ 
    categories,
    settings 
}: { 
    categories: Category[];
    settings?: any;
}) {
    const { language, setLanguage, t, getLocalized } = useLanguage();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isCatalogOpen, setIsCatalogOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState<Category | null>(categories[0] || null);
    const [searchQuery, setSearchQuery] = useState("");
    const [placeholder, setPlaceholder] = useState("");
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [typingSpeed, setTypingSpeed] = useState(150);

    const placeholders = settings?.searchPlaceholders?.length > 0 
        ? settings.searchPlaceholders 
        : [
            t('common.search_placeholder') || "Пошук товарів...",
            "Цемент М-500",
            "Газоблок Стоунлайт",
            "Штукатурка Knauf",
            "Мінеральна вата",
            "Фарба для стін",
            "Покрівельні матеріали"
        ];

    useEffect(() => {
        const handleTyping = () => {
            const current = placeholderIndex % placeholders.length;
            const fullText = placeholders[current];

            if (isDeleting) {
                setPlaceholder(fullText.substring(0, placeholder.length - 1));
                setTypingSpeed(50);
            } else {
                setPlaceholder(fullText.substring(0, placeholder.length + 1));
                setTypingSpeed(150);
            }

            if (!isDeleting && placeholder === fullText) {
                setTimeout(() => setIsDeleting(true), 2000);
            } else if (isDeleting && placeholder === "") {
                setIsDeleting(false);
                setPlaceholderIndex(placeholderIndex + 1);
            }
        };

        const timer = setTimeout(handleTyping, typingSpeed);
        return () => clearTimeout(timer);
    }, [placeholder, isDeleting, placeholderIndex, typingSpeed, placeholders]);
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const catalogRef = useRef<HTMLDivElement>(null);
    const catalogButtonRef = useRef<HTMLButtonElement>(null);

    const cartCount = useCartStore((state) => state.items.reduce((a, b) => a + b.quantity, 0));
    const wishlistCount = useWishlistStore((state) => state.items.length);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        setIsCatalogOpen(false);
        setIsMobileMenuOpen(false);
    }, [pathname]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const isOutsideMenu = catalogRef.current && !catalogRef.current.contains(event.target as Node);
            const isOutsideButton = catalogButtonRef.current && !catalogButtonRef.current.contains(event.target as Node);
            
            if (isOutsideMenu && isOutsideButton) {
                setIsCatalogOpen(false);
            }
        };
        if (isCatalogOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isCatalogOpen]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/shop?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    if (pathname?.startsWith("/admin")) return null;

    const effectiveCartCount = mounted ? cartCount : 0;
    const effectiveWishlistCount = mounted ? wishlistCount : 0;

    return (
        <>
            {/* Mobile Menu Backdrop */}
            <AnimatePresence>
                {(isMobileMenuOpen || isCatalogOpen) && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999]"
                        onClick={() => {
                            setIsMobileMenuOpen(false);
                            setIsCatalogOpen(false);
                        }}
                    />
                )}
            </AnimatePresence>

            <header className="sticky top-0 z-[10000] w-full bg-white border-b border-black/10 text-black">
                <div className="mx-auto max-w-[1800px] px-4 md:px-6">
                    <div className="flex h-16 md:h-20 items-center justify-between">
                        
                        {/* Left Column: Logo & Catalog */}
                        <div className="flex-1 flex items-center gap-4 md:gap-8">
                            <Link
                                href="/"
                                className="text-xl md:text-2xl font-black tracking-tighter flex items-center gap-2 flex-shrink-0"
                            >
                                <span className="bg-black text-white px-2 py-0.5 transform -skew-x-12">ANVI</span>
                                <span className="text-black">BUD</span>
                            </Link>

                            <button
                                ref={catalogButtonRef}
                                onClick={() => setIsCatalogOpen(!isCatalogOpen)}
                                className={`hidden md:flex items-center gap-2 px-6 py-2.5 transition-all rounded-none flex-shrink-0 font-bold uppercase tracking-widest text-[12px] ${isCatalogOpen ? "bg-zinc-100 text-black" : "bg-black text-white hover:bg-zinc-800"}`}
                            >
                                {isCatalogOpen ? <X size={18} /> : <LayoutGrid size={18} />}
                                {t('common.catalog') || 'Каталог'}
                            </button>
                        </div>

                        {/* Center Column: Search Bar */}
                        <div className="flex-[2] hidden md:flex justify-center px-8">
                            <form onSubmit={handleSearch} className="relative group w-full max-w-4xl">
                                <input
                                    type="text"
                                    placeholder={placeholder}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-zinc-100 border-none px-14 py-3.5 text-sm focus:ring-2 focus:ring-black/5 transition-all outline-none rounded-none"
                                />
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-black/30 group-focus-within:text-black transition-colors" size={20} />
                                {searchQuery && (
                                    <button 
                                        type="button" 
                                        onClick={() => setSearchQuery("")}
                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-black/30 hover:text-black transition-colors"
                                    >
                                        <X size={18} />
                                    </button>
                                )}
                            </form>
                        </div>

                        {/* Right Column: Actions */}
                        <div className="flex-1 flex items-center justify-end gap-2 md:gap-6">
                            {/* Language Switcher - Desktop */}
                            <div className="hidden lg:block relative group">
                                <button className="flex items-center gap-1.5 text-[11px] font-black tracking-widest text-black/50 hover:text-black transition-colors">
                                    <span className="uppercase">{language}</span>
                                    <ChevronRight size={12} className="rotate-90 opacity-40" />
                                </button>
                                <div className="absolute top-full right-0 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[10001]">
                                    <div className="bg-white border border-black/10 shadow-xl py-1 min-w-[80px]">
                                        {['en', 'uk', 'ru', 'pl'].map((lang) => (
                                            <button
                                                key={lang}
                                                onClick={() => setLanguage(lang as any)}
                                                className={`w-full text-left px-4 py-2 text-[10px] uppercase tracking-widest hover:bg-zinc-50 ${language === lang ? "font-black text-black" : "text-black/40"}`}
                                            >
                                                {lang}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <Link href="/wishlist" className="relative p-2 hover:bg-zinc-100 transition-colors rounded-full group" aria-label="Wishlist">
                                <Heart size={22} className="text-black group-hover:fill-black transition-all" />
                                {effectiveWishlistCount > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">{effectiveWishlistCount}</span>
                                )}
                            </Link>

                            <Link href="/cart" className="relative p-2 hover:bg-zinc-100 transition-colors rounded-full group" aria-label="Cart">
                                <ShoppingBag size={22} className="text-black" />
                                {effectiveCartCount > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 bg-black text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">{effectiveCartCount}</span>
                                )}
                            </Link>

                            {/* Mobile Search & Menu Toggles */}
                            <button
                                onClick={() => setIsMobileMenuOpen(true)}
                                className="md:hidden p-2 hover:bg-black/5 rounded-full"
                            >
                                <Menu size={24} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mega Menu (Desktop) */}
                <AnimatePresence>
                    {isCatalogOpen && (
                        <motion.div
                            ref={catalogRef}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-full left-0 w-full bg-white border-b border-black/10 shadow-2xl z-[10002] hidden md:block"
                        >
                            <div className="mx-auto max-w-[1800px] flex h-[600px]">
                                {/* Left Side: Main Categories */}
                                <div className="w-80 border-r border-black/5 overflow-y-auto overflow-x-hidden bg-zinc-50/50">
                                    {categories.map((category) => (
                                        <button
                                            key={category.id}
                                            onMouseEnter={() => setActiveCategory(category)}
                                            onClick={() => router.push(`/${category.slug}`)}
                                            className={`w-full text-left px-5 py-3 text-sm font-black uppercase tracking-widest transition-all flex items-center justify-between group relative ${activeCategory?.id === category.id ? "bg-white text-black" : "text-black/30 hover:text-black hover:bg-black/[0.02]"}`}
                                        >
                                            <span className="relative z-10">{getLocalized(category)}</span>
                                            
                                            {/* Active Indicator Bar */}
                                            {activeCategory?.id === category.id && (
                                                <motion.div 
                                                    layoutId="activeCategoryBar"
                                                    className="absolute left-0 top-0 bottom-0 w-1 bg-black"
                                                />
                                            )}

                                            <ChevronRight 
                                                size={16} 
                                                className={`transition-all duration-300 ${activeCategory?.id === category.id ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`} 
                                            />
                                        </button>
                                    ))}
                                </div>

                                {/* Right Side: Subcategories & Images */}
                                <div className="flex-1 bg-white flex overflow-hidden">
                                    <div className="flex-1 p-12 overflow-y-auto">
                                        {activeCategory && (
                                            <div className="space-y-12">
                                                <div>
                                                    <Link 
                                                        href={`/${activeCategory.slug}`}
                                                        className="inline-block text-3xl font-black uppercase tracking-tighter mb-8 hover:text-zinc-600 transition-colors"
                                                    >
                                                        {getLocalized(activeCategory)}
                                                    </Link>
                                                    
                                                    <div className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                                        {activeCategory.subcategories.map((sub) => (
                                                            <Link
                                                                key={sub.id}
                                                                href={`/${activeCategory.slug}/${sub.slug}`}
                                                                className="group block space-y-2"
                                                            >
                                                                <div className="aspect-square bg-zinc-100 overflow-hidden relative border border-black/5">
                                                                    {sub.image ? (
                                                                        <img 
                                                                            src={sub.image} 
                                                                            alt={getLocalized(sub)}
                                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                                        />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center">
                                                                            <LayoutGrid size={24} className="text-black/10" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <span className="block text-[9px] font-black uppercase tracking-widest text-center group-hover:text-zinc-600 transition-colors leading-tight">
                                                                    {getLocalized(sub)}
                                                                </span>
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </div>
                                                
                                                {/* Promo Items */}
                                                <div className="grid grid-cols-2 gap-6 pt-8 border-t border-zinc-100">
                                                    <div className="bg-zinc-100 aspect-video p-6 flex flex-col justify-center group overflow-hidden relative">
                                                        <div className="relative z-10">
                                                            <p className="text-black/40 text-[9px] uppercase font-bold tracking-widest mb-1">Професійні поради</p>
                                                            <h4 className="text-black text-sm font-bold uppercase mb-3">Як обрати фундамент?</h4>
                                                            <span className="text-[10px] font-bold border-b border-black pb-0.5 group-hover:pr-4 transition-all italic">Читати далі</span>
                                                        </div>
                                                        <div className="absolute right-0 bottom-0 w-24 h-24 opacity-10 transform translate-x-4 translate-y-4 group-hover:scale-110 transition-transform">
                                                            <LayoutGrid size={96} />
                                                        </div>
                                                    </div>
                                                    <div className="bg-zinc-900 aspect-video p-6 flex flex-col justify-center text-white group overflow-hidden relative">
                                                        <div className="relative z-10">
                                                            <p className="text-white/40 text-[9px] uppercase font-bold tracking-widest mb-1">Доставка</p>
                                                            <h4 className="text-white text-sm font-bold uppercase mb-3">Власна логістика</h4>
                                                            <span className="text-[10px] font-bold border-b border-white pb-0.5 group-hover:pr-4 transition-all italic">Детальніше</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Visual Column: Category Image Preview */}
                                    <div className="w-[400px] bg-zinc-50 relative overflow-hidden group">
                                        <AnimatePresence mode="wait">
                                            {activeCategory?.image ? (
                                                <motion.div
                                                    key={activeCategory.id}
                                                    initial={{ opacity: 0, scale: 1.1 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 1.05 }}
                                                    transition={{ duration: 0.4 }}
                                                    className="absolute inset-0"
                                                >
                                                    <img 
                                                        src={activeCategory.image} 
                                                        alt={activeCategory.name}
                                                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                                    <div className="absolute bottom-8 left-8 right-8 text-white">
                                                        <p className="text-[10px] uppercase font-bold tracking-[0.4em] mb-2 opacity-60">Колекція</p>
                                                        <h3 className="text-2xl font-black uppercase tracking-tighter italic">
                                                            {getLocalized(activeCategory)}
                                                        </h3>
                                                    </div>
                                                </motion.div>
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center p-12 text-center text-zinc-300">
                                                    <div className="space-y-4">
                                                        <LayoutGrid size={48} className="mx-auto opacity-20" />
                                                        <p className="text-[10px] uppercase font-bold tracking-widest leading-loose">
                                                            ANVIBUD <br/>
                                                            QUALITY MATERIALS <br/>
                                                            SINCE 2026
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Mobile Menu (Drawer) */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-white z-[100001] shadow-2xl flex flex-col"
                        >
                            <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                                <span className="text-xl font-black italic">ANVIBUD</span>
                                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                                {/* Search in Mobile Menu */}
                                <form onSubmit={handleSearch} className="relative">
                                    <input
                                        type="text"
                                        placeholder="Пошук..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-zinc-100 border-none px-10 py-3 text-sm outline-none"
                                    />
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30" size={16} />
                                </form>

                                <div className="space-y-6">
                                    <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-zinc-400">Каталог товарів</p>
                                    {categories.map((category) => (
                                        <div key={category.id} className="space-y-4">
                                            <Link
                                                href={`/${category.slug}`}
                                                className="block text-lg font-black uppercase italic tracking-tighter"
                                            >
                                                {getLocalized(category)}
                                            </Link>
                                            <div className="pl-4 border-l border-zinc-100 space-y-3">
                                                {category.subcategories.map((sub) => (
                                                    <Link
                                                        key={sub.id}
                                                        href={`/${category.slug}/${sub.slug}`}
                                                        className="block text-sm text-zinc-500 font-medium"
                                                    >
                                                        {getLocalized(sub)}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="p-6 bg-zinc-50 border-t border-zinc-100 grid grid-cols-4 gap-2">
                                {['en', 'uk', 'ru', 'pl'].map((lang) => (
                                    <button
                                        key={lang}
                                        onClick={() => setLanguage(lang as any)}
                                        className={`py-3 text-[10px] font-black uppercase tracking-widest border ${language === lang ? "bg-black text-white border-black" : "bg-white text-zinc-400 border-transparent"}`}
                                    >
                                        {lang}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>
        </>
    );
}
