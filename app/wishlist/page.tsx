"use client";

import Link from "next/link";
import Image from "next/image";
import { useWishlistStore } from "@/lib/stores/wishlist.store";
import { useCartStore } from "@/lib/stores/cart.store";
import { Footer } from "@/components/Footer";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { getLatestPrices } from "@/lib/actions/products.actions";
import { ConfirmModal } from "@/components/ConfirmModal";

interface WishlistItemProps {
    item: any;
    onRemove: (id: string) => void;
}

function WishlistItem({ item, onRemove }: WishlistItemProps) {
    const { t } = useLanguage();
    const addToCart = useCartStore((state) => state.addToCart);
    const [selectedSize, setSelectedSize] = useState<string | null>(item.selectedSize || null);
    const [isAdded, setIsAdded] = useState(false);
    const [showSizeError, setShowSizeError] = useState(false);
    const [currentImgIdx, setCurrentImgIdx] = useState(0);
    const router = useRouter();

    const variant = selectedSize && item.sizeVariants 
        ? item.sizeVariants.find((v: any) => v.size === selectedSize) 
        : null;

    const basePrice = variant ? parseFloat(variant.price) : parseFloat(item.price);
    const discountPercent = item.discount || 0;
    const fixedDiscountAmount = item.discountAmount || 0;
    
    // Calculate sale price based on explicit salePrice, percentage discount, or fixed discount amount
    const salePrice = variant?.salePrice 
        ? parseFloat(variant.salePrice) 
        : (item.salePrice 
            ? parseFloat(item.salePrice) 
            : (discountPercent > 0 
                ? basePrice * (1 - discountPercent / 100) 
                : (fixedDiscountAmount > 0 
                    ? basePrice - fixedDiscountAmount 
                    : null)));

    const displayPrice = salePrice !== null ? salePrice : basePrice;
    const originalPrice = salePrice !== null ? basePrice : null;

    const handleAddToCart = () => {
        if (item.sizes && item.sizes.length > 0 && !selectedSize) {
            setShowSizeError(true);
            setTimeout(() => setShowSizeError(false), 2000);
            return;
        }

        addToCart({
            id: selectedSize ? `${item.id}-${selectedSize}` : item.id,
            baseId: item.id,
            size: selectedSize || undefined,
            title: selectedSize ? `${item.title} / ${selectedSize}` : item.title,
            price: displayPrice,
            image: item.image
        });

        setIsAdded(true);
        setSelectedSize(null);
        setTimeout(() => setIsAdded(false), 2000);
    };

    const images = item.allImages || [item.image, item.hoverImage].filter(Boolean);

    return (
        <div className="group flex flex-col h-full">
            <div 
                onClick={(e) => {
                    const target = e.target as HTMLElement;
                    if (!target.closest('button')) {
                        router.push(`/product/${item.slug}`);
                    }
                }}
                className="relative aspect-[3/4] bg-[#f9f9f9] overflow-hidden cursor-pointer"
            >
                {/* Labels */}
                {item.label && (
                    <div className="absolute top-4 left-4 z-10 flex flex-col gap-1 items-start">
                        <span className={`text-[8px] md:text-[10px] uppercase font-black tracking-[0.2em] px-2 py-1 md:px-2.5 md:py-1.5 shadow-2xl backdrop-blur-md ${
                            item.label === 'BESTSELLER' ? 'bg-black text-white' :
                            item.label === 'NEW' ? 'bg-white text-black border border-black/10' :
                            'bg-zinc-100 text-black border border-black/5'
                        }`}>
                            {item.label === 'BESTSELLER' ? t('common.hit') : item.label === 'NEW' ? t('common.new_arrival') : t('common.sale')}
                        </span>
                    </div>
                )}

                {/* Desktop View: Smooth Hover */}
                <div className="hidden md:block absolute inset-0">
                    {item.image ? (
                        <div className="absolute inset-8">
                            <Image
                                src={item.image}
                                alt={item.title}
                                fill
                                className={`object-contain transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] ${item.hoverImage ? "group-hover:opacity-0 group-hover:scale-105 group-hover:-translate-x-3 group-hover:blur-sm" : "group-hover:opacity-90"}`}
                                sizes="25vw"
                            />
                            {item.hoverImage && (
                                <Image
                                    src={item.hoverImage}
                                    alt={`${item.title} - alternative view`}
                                    fill
                                    className="object-contain opacity-0 group-hover:opacity-100 transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] scale-110 group-hover:scale-100 translate-x-3 group-hover:translate-x-0"
                                    sizes="25vw"
                                />
                            )}
                        </div>
                    ) : (
                        <div className="w-full h-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-[8px] font-black uppercase text-black/10 dark:text-white/10">
                            N/A
                        </div>
                    )}
                </div>

                {/* Mobile View: Carousel with Arrows */}
                <div className="md:hidden absolute inset-0">
                    {images.length > 0 ? (
                        images.map((img: any, idx: number) => (
                            <div 
                                key={idx} 
                                className={`absolute inset-4 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${idx === currentImgIdx ? "opacity-100 translate-x-0" : "opacity-0 translate-x-[15%]"}`}
                            >
                                <Image
                                    src={img}
                                    alt={`${item.title} - view ${idx + 1}`}
                                    fill
                                    className="object-contain"
                                    sizes="50vw"
                                />
                            </div>
                        ))
                    ) : (
                        <div className="w-full h-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-[8px] font-black uppercase text-black/10 dark:text-white/10">
                            N/A
                        </div>
                    )}
                </div>

                {/* Arrows for Mobile */}
                {images.length > 1 && (
                    <div className="md:hidden absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-0 z-20 pointer-events-none">
                        <button
                            onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentImgIdx(prev => (prev - 1 + images.length) % images.length); }}
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                            className="w-10 h-16 flex items-center justify-center text-black/60 hover:text-black transition-all pointer-events-auto touch-manipulation active:scale-90"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 18l-6-6 6-6" /></svg>
                        </button>
                        <button
                            onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentImgIdx(prev => (prev + 1) % images.length); }}
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                            className="w-10 h-16 flex items-center justify-center text-black/60 hover:text-black transition-all pointer-events-auto touch-manipulation active:scale-90"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 18l6-6-6-6" /></svg>
                        </button>
                    </div>
                )}

                {/* Remove button */}
                <button
                    onClick={() => onRemove(item.id)}
                    className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center transition-all bg-white z-30"
                    aria-label="Remove from wishlist"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
            </div>

            {/* Info Section */}
            <div className="flex flex-col flex-1 pt-4">
                <div className="flex-1 space-y-2">
                    <Link href={`/product/${item.slug}`} className="hover:text-black/50 transition-colors">
                        <h2 className="text-[10px] uppercase tracking-[0.2em] font-black text-black leading-tight truncate">{item.title}</h2>
                    </Link>
                    <div className="space-y-4">
                        <div className="flex items-baseline gap-2">
                            <p className="text-[10px] tracking-widest font-black text-black">₴{displayPrice.toFixed(2)}</p>
                            {originalPrice && (
                                <p className="text-[8px] tracking-widest font-bold text-black/20 line-through">₴{originalPrice.toFixed(2)}</p>
                            )}
                        </div>

                        {/* Size Picker */}
                        {item.sizes && item.sizes.length > 0 && (
                            <div className={`flex flex-wrap gap-1 transition-all duration-300 ${showSizeError ? "scale-[1.02]" : ""}`}>
                                {item.sizes.map((size: string) => (
                                    <button
                                        key={size}
                                        onClick={() => { setSelectedSize(selectedSize === size ? null : size); setShowSizeError(false); }}
                                        className={`min-w-[24px] h-6 px-1 flex items-center justify-center text-[8px] font-bold border transition-colors ${selectedSize === size
                                            ? "bg-black text-white border-black"
                                            : showSizeError
                                                ? "border-red-500 text-red-500 animate-pulse"
                                                : "bg-white text-black/40 border-black/10 hover:border-black hover:text-black"
                                        }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <button
                    onClick={handleAddToCart}
                    className="w-full mt-6 py-3 bg-white text-black border border-black/10 text-[9px] uppercase font-bold tracking-[0.1em] hover:bg-zinc-50 transition-all flex items-center justify-center gap-2 px-2"
                >
                    {isAdded ? t('common.added') : (item.sizes && item.sizes.length > 0 && !selectedSize ? (showSizeError ? t('common.choose_size') : t('common.select_size')) : t('common.add_to_bag'))}
                </button>
            </div>
        </div>
    );
}

export default function WishlistPage() {
    const { t } = useLanguage();
    const items = useWishlistStore((state) => state.items);
    const removeFromWishlist = useWishlistStore((state) => state.removeFromWishlist);
    const clearWishlist = useWishlistStore((state) => state.clearWishlist);
    const syncItems = useWishlistStore((state) => state.syncItems);
    const [mounted, setMounted] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [hasSynced, setHasSynced] = useState(false);
    const [showClearConfirm, setShowClearConfirm] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted || items.length === 0 || hasSynced) return;

        const syncWishlist = async () => {
            setIsSyncing(true);
            try {
                const productIds = items.map(item => item.id);
                const latestData = await getLatestPrices(productIds);
                if (latestData && latestData.length > 0) {
                    syncItems(latestData);
                    setHasSynced(true);
                }
            } catch (error) {
                console.error("Failed to sync wishlist prices:", error);
            } finally {
                setIsSyncing(false);
            }
        };

        syncWishlist();
    }, [mounted, items.length, hasSynced]);

    if (!mounted) {
        return (
            <main className="flex-1 flex flex-col min-h-screen justify-between bg-white pt-6 border-t border-black/[0.03]">
                <div className="mx-auto w-full max-w-[1500px] px-6 mb-16">
                    <div className="h-10 border-b border-black/[0.1] mb-12 animate-pulse bg-zinc-50" />
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-10 gap-y-16">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="animate-pulse space-y-4">
                                <div className="aspect-[3/4] bg-zinc-100" />
                                <div className="h-3 bg-zinc-100 w-3/4" />
                                <div className="h-3 bg-zinc-50 w-1/4" />
                            </div>
                        ))}
                    </div>
                </div>
                <Footer />
            </main>
        );
    }

    return (
        <main className="flex-1 flex flex-col min-h-screen justify-between bg-white pt-6 border-t border-black/[0.03]">
            <div className="mx-auto w-full max-w-[1500px] px-6 mb-8 md:mb-16">

                {/* Refined Responsive Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-black/[0.1] pb-6 mb-8 gap-6">
                    <nav className="flex flex-wrap items-center gap-y-2 gap-x-3 text-[9px] uppercase tracking-[0.3em] font-black">
                        <Link href="/" className="text-black/30 hover:text-black transition-colors">{t('common.home')}</Link>
                        <span className="text-black/10">/</span>
                        <span className="text-black">{t('wishlist.title')}</span>
                    </nav>

                    <div className="hidden sm:flex items-center justify-end gap-4 w-auto border-black/[0.05] pt-0">
                        <span className="text-[10px] uppercase tracking-[0.5em] font-black text-black/20">ANVIBUD®</span>
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-black animate-pulse" />
                            <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-black">{t('wishlist.saved_items')}</span>
                        </div>
                    </div>
                </div>

                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-8 text-center">
                        <div className="text-[80px] md:text-[120px] leading-none opacity-5 font-black uppercase tracking-tighter select-none max-w-full overflow-hidden text-center">{t('wishlist.title')}</div>
                        <div className="space-y-3">
                            <h1 className="text-2xl font-black uppercase tracking-tighter text-black">{t('wishlist.empty_title')}</h1>
                            <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-black/30">{t('wishlist.empty_desc')}</p>
                        </div>
                        <Link
                            href="/"
                            className="mt-4 bg-black text-white px-8 py-3 text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-black/90 transition-colors"
                        >
                            {t('wishlist.explore_archive')}
                        </Link>
                    </div>
                ) : (
                    <div>
                        <div className="flex items-end justify-between mb-8 pb-4 border-b border-black/[0.03]">
                            <div className="flex items-baseline gap-3">
                                <h1 className="text-[11px] uppercase tracking-[0.4em] font-black text-black">
                                    {t('wishlist.saved_items')}
                                </h1>
                                <span className="text-[9px] font-bold text-black/20 tracking-widest">({items.length})</span>
                            </div>
                            <button
                                onClick={() => setShowClearConfirm(true)}
                                className="text-[8px] uppercase tracking-[0.3em] font-bold text-black/20 hover:text-black transition-colors"
                            >
                                {t('wishlist.clear_all')}
                            </button>
                        </div>

                        <ConfirmModal
                            isOpen={showClearConfirm}
                            onClose={() => setShowClearConfirm(false)}
                            onConfirm={clearWishlist}
                            title={t('wishlist.clear_all')}
                            message={t('wishlist.clear_confirm')}
                        />

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-10 gap-y-16">
                            {items.map((item) => (
                                <WishlistItem
                                    key={item.id}
                                    item={item}
                                    onRemove={removeFromWishlist}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </main>
    );
}
