"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/lib/stores/cart.store";
import { useWishlistStore } from "@/lib/stores/wishlist.store";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function ProductActions({
    product,
    sizes = [],
    sizeVariants = [],
    selectedSize,
    onSizeSelect
}: {
    product: { id: string; name: string; price: number; image?: string; slug: string; stock: number; isCustomOrder: boolean; label?: any };
    sizes?: string[];
    sizeVariants?: { size: string, price: string, salePrice?: string, stock?: string }[];
    selectedSize?: string | null;
    onSizeSelect?: (size: string | null) => void;
}) {
    const { t } = useLanguage();
    const safeSizes = sizes || [];
    const [internalSelectedSize, setInternalSelectedSize] = useState<string | null>(safeSizes.length === 1 ? safeSizes[0] : null);
    
    const activeSize = selectedSize !== undefined ? selectedSize : internalSelectedSize;
    const setActiveSize = onSizeSelect || setInternalSelectedSize;

    const [currentPrice, setCurrentPrice] = useState<number>(product.price);
    const [mounted, setMounted] = useState(false);
    const [isAdded, setIsAdded] = useState(false);
    const [sizeError, setSizeError] = useState(false);

    useEffect(() => {
        if (activeSize && sizeVariants.length > 0) {
            const variant = sizeVariants.find(v => v.size === activeSize);
            if (variant) {
                const vPrice = variant.salePrice ? parseFloat(variant.salePrice) : parseFloat(variant.price);
                setCurrentPrice(vPrice);
            }
        } else {
            setCurrentPrice(product.price);
        }
    }, [activeSize, sizeVariants, product.price]);

    useEffect(() => {
        setMounted(true);
    }, []);

    const addToCart = useCartStore((state) => state.addToCart);
    const addToWishlist = useWishlistStore((state) => state.addToWishlist);
    const removeFromWishlist = useWishlistStore((state) => state.removeFromWishlist);
    const isWishlisted = useWishlistStore((state) => state.isWishlisted(product.id));

    const handleAddToCart = () => {
        if (safeSizes.length > 0 && !activeSize) {
            setSizeError(true);
            setTimeout(() => setSizeError(false), 2500);
            return;
        }

        addToCart({
            id: activeSize ? `${product.id}-${activeSize}` : product.id,
            baseId: product.id,
            size: activeSize || undefined,
            title: activeSize ? `${product.name} / ${activeSize}` : product.name,
            price: currentPrice,
            image: product.image,
        });

        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    const handleWishlist = () => {
        if (isWishlisted) {
            removeFromWishlist(product.id);
        } else {
            addToWishlist({
                id: product.id,
                title: product.name,
                price: product.price,
                image: product.image,
                slug: product.slug,
                label: product.label,
            });
        }
    };

    return (
        <div className="space-y-12">
            {/* Sizes */}
            {safeSizes.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className={`text-[10px] uppercase tracking-[0.4em] font-bold transition-colors duration-300 ${sizeError ? "text-red-500" : "text-black/60"}`}>
                            {t('product_actions.select_size')}
                        </span>
                        <button className="text-[9px] uppercase tracking-[0.2em] font-bold text-black/40 border-b border-black/20 hover:text-black hover:border-black transition-colors">
                            {t('product_actions.size_guide')}
                        </button>
                    </div>
                    <div className={`flex flex-wrap gap-2 transition-all duration-300 ${sizeError ? "outline outline-1 outline-red-400 p-2" : ""}`}>
                        {safeSizes.map((size) => {
                            const variant = sizeVariants.find(v => v.size === size);
                            const variantPrice = variant ? (variant.salePrice ? parseFloat(variant.salePrice) : parseFloat(variant.price)) : null;
                            
                            return (
                                <button
                                    key={size}
                                    onClick={() => { setActiveSize(size); setSizeError(false); }}
                                    className={`relative min-w-[3rem] h-11 px-3 flex flex-col items-center justify-center transition-all duration-300 ${activeSize === size
                                        ? "bg-black text-white"
                                        : sizeError
                                            ? "bg-white text-black border border-red-300 hover:border-red-500"
                                            : "bg-white text-black border border-black/10 hover:border-black"
                                        }`}
                                >
                                    <span className="text-[10px] font-black uppercase tracking-widest">{size}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Inline toast */}
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${sizeError ? "max-h-10 opacity-100" : "max-h-0 opacity-0"}`}>
                        <p className="flex items-center gap-2 text-[9px] uppercase tracking-[0.3em] font-bold text-red-500">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            {t('product_actions.select_size_error')}
                        </p>
                    </div>
                </div>
            )}

            {/* Availability */}
            <div className="flex items-center gap-3 border-t border-b border-black/5 py-4">
                <div className={`w-2 h-2 rounded-full ${product.isCustomOrder ? "bg-orange-500" : (product.stock > 0 ? "bg-green-500" : "bg-red-500")}`} />
                <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-black/60">
                    {product.isCustomOrder ? t('product_actions.made_to_order') : (product.stock > 0 ? t('product_actions.available') : t('product_actions.out_of_stock'))}
                </span>
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-4">
                <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={!product.isCustomOrder && product.stock <= 0}
                    className="w-full bg-black text-white py-4 text-[11px] uppercase tracking-[0.3em] font-bold hover:bg-black/90 transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isAdded ? t('product_actions.added_to_library') : ((!product.isCustomOrder && product.stock <= 0) ? t('product_actions.sold_out') : t('product_actions.add_to_library'))}
                </button>
                <button
                    type="button"
                    onClick={handleWishlist}
                    className={`w-full py-3 text-[11px] uppercase tracking-[0.3em] font-bold border flex items-center justify-center gap-3 transition-all duration-300 ${isWishlisted
                        ? "border-black bg-black/5 text-black"
                        : "border-black/10 text-black hover:border-black"
                        }`}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill={mounted && isWishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className="mb-[1px]">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                    {mounted && isWishlisted ? t('product_actions.in_wishlist') : t('product_actions.save_for_later')}
                </button>
            </div>
        </div>
    );
}
