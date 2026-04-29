"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { ProductActions } from "./ProductActions";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface ProductInfoClientProps {
    product: {
        id: string;
        name: string;
        price: number;
        discountAmount: number;
        image?: string;
        slug: string;
        stock: number;
        isCustomOrder: boolean;
        label?: any;
        sizeVariants?: any[];
        sizes: string[];
        baseSize?: string;
    };
    prodName: string;
}

export function ProductInfoClient({ product, prodName }: ProductInfoClientProps) {
    const { t } = useLanguage();
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const initialSize = product.baseSize || (product.sizes.length === 1 ? product.sizes[0] : null);
    const [selectedSize, setSelectedSize] = useState<string | null>(initialSize);
    
    // Read size from URL on mount
    useEffect(() => {
        const sizeParam = searchParams.get("size");
        if (sizeParam && product.sizes.includes(sizeParam)) {
            setSelectedSize(sizeParam);
        }
    }, [searchParams, product.sizes]);

    const handleSizeSelect = (size: string | null) => {
        setSelectedSize(size);
        if (size) {
            const params = new URLSearchParams(searchParams.toString());
            params.set("size", size);
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        }
    };

    // Initial prices from server
    const [displayPrice, setDisplayPrice] = useState(product.price - product.discountAmount);
    const [originalPrice, setOriginalPrice] = useState(product.price);
    const [stock, setStock] = useState(product.stock);

    useEffect(() => {
        let matched = false;

        if (selectedSize && product.sizeVariants && product.sizeVariants.length > 0) {
            const variant = product.sizeVariants.find((v: any) => v.size === selectedSize);
            if (variant) {
                const vPrice = Number(variant.price);
                const vSalePrice = variant.salePrice ? Number(variant.salePrice) : null;
                const vStock = variant.stock !== null ? Number(variant.stock) : product.stock;

                if (vSalePrice !== null) {
                    setDisplayPrice(vSalePrice);
                    setOriginalPrice(vPrice);
                } else {
                    setDisplayPrice(vPrice);
                    setOriginalPrice(vPrice);
                }
                setStock(vStock);
                matched = true;
            }
        }

        if (!matched) {
            // Reset to base product prices if no variant matched (includes baseSize)
            setDisplayPrice(product.price - product.discountAmount);
            setOriginalPrice(product.price);
            setStock(product.stock);
        }
    }, [selectedSize, product]);

    const hasDiscount = originalPrice > displayPrice;
    const discountPercent = hasDiscount ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100) : 0;

    return (
        <div className="sticky top-28 space-y-10">
            {/* Title & Price */}
            <div className="space-y-4 text-black">
                <h1 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter leading-[0.9] text-black">
                    {prodName}
                </h1>

                <div className="flex items-baseline gap-4 text-black">
                    <span className="text-2xl font-bold tracking-widest text-black">
                        ₴{displayPrice.toFixed(2)}
                    </span>
                    {hasDiscount && (
                        <>
                            <span className="text-sm text-black/30 line-through tracking-widest">
                                ₴{originalPrice.toFixed(2)}
                            </span>
                            <span className="text-[10px] uppercase tracking-widest font-bold text-red-500">
                                {discountPercent}% {t('product.off')}
                            </span>
                        </>
                    )}
                </div>
            </div>

            {/* Actions */}
            <ProductActions
                product={{
                    ...product,
                    name: prodName,
                    price: displayPrice,
                    stock: stock,
                }}
                sizes={product.sizes}
                sizeVariants={product.sizeVariants}
                selectedSize={selectedSize}
                onSizeSelect={handleSizeSelect}
            />
        </div>
    );
}
