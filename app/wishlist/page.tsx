"use client";

import Link from "next/link";
import { useWishlistStore } from "@/lib/stores/wishlist.store";
import { Footer } from "@/components/Footer";
import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { getLatestPrices } from "@/lib/actions/products.actions";
import { ConfirmModal } from "@/components/ConfirmModal";
import { ProductCard } from "@/components/ProductCard";

export default function WishlistPage() {
    const { t } = useLanguage();
    const items = useWishlistStore((state) => state.items);
    const removeFromWishlist = useWishlistStore((state) => state.removeFromWishlist);
    const clearWishlist = useWishlistStore((state) => state.clearWishlist);
    const syncItems = useWishlistStore((state) => state.syncItems);
    const [mounted, setMounted] = useState(false);
    const [hasSynced, setHasSynced] = useState(false);
    const [showClearConfirm, setShowClearConfirm] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted || items.length === 0 || hasSynced) return;

        const syncWishlist = async () => {
            try {
                const productIds = items.map(item => item.id);
                const latestData = await getLatestPrices(productIds);
                if (latestData && latestData.length > 0) {
                    syncItems(latestData);
                    setHasSynced(true);
                }
            } catch (error) {
                console.error("Failed to sync wishlist prices:", error);
            }
        };

        syncWishlist();
    }, [mounted, items.length, hasSynced]);

    if (!mounted) {
        return (
            <main className="flex-1 flex flex-col min-h-screen justify-between bg-white pt-6 border-t border-black/[0.03]">
                <div className="mx-auto w-full max-w-[1500px] px-6 mb-16">
                    <div className="h-10 border-b border-black/[0.1] mb-12 animate-pulse bg-zinc-50" />
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-16">
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

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-16">
                            {items.map((item) => (
                                <ProductCard
                                    key={item.id}
                                    id={item.id}
                                    title={item.title}
                                    price={item.price}
                                    discountAmount={item.discountAmount}
                                    image={item.image || ""}
                                    hoverImage={item.hoverImage}
                                    allImages={item.allImages}
                                    slug={item.slug}
                                    sizes={item.sizes}
                                    label={item.label}
                                    specifications={item.specifications}
                                    sizeVariants={item.sizeVariants}
                                    baseSize={item.baseSize}
                                    variant="wishlist"
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
