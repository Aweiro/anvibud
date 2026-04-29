
"use client";

import { useEffect, useState, useRef } from "react";
import { ProductCard } from "./ProductCard";
import { ProductSkeleton } from "./ProductSkeleton";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface Product {
    id: string;
    name: string;
    name_uk?: string;
    name_ru?: string;
    name_pl?: string;
    slug: string;
    price: number | string;
    discountAmount?: number | string;
    images: string[];
    sizes: string[];
    brand?: string;
    label?: 'BESTSELLER' | 'NEW' | 'SALE' | null;
    [key: string]: any;
}

interface InfiniteProductGridProps {
    initialProducts: Product[];
    totalProducts: number;
    categorySlug?: string;
    subcategorySlug?: string;
    sort?: string;
    search?: string;
    lang: string;
}

export function InfiniteProductGrid({
    initialProducts,
    totalProducts,
    categorySlug,
    subcategorySlug,
    sort,
    search,
    lang
}: InfiniteProductGridProps) {
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(initialProducts.length < totalProducts);
    const loaderRef = useRef<HTMLDivElement>(null);
    const { t } = useLanguage();

    const loadMore = async () => {
        if (loading || !hasMore) return;
        setLoading(true);
        const nextPage = page + 1;

        try {
            const params = new URLSearchParams({
                page: nextPage.toString(),
                limit: "12",
                sort: sort || "newest"
            });
            if (categorySlug) params.append("categorySlug", categorySlug);
            if (subcategorySlug) params.append("subcategorySlug", subcategorySlug);
            if (search) params.append("search", search);

            const res = await fetch(`/api/products?${params.toString()}`);
            const data = await res.json();

            if (data.products && data.products.length > 0) {
                setProducts(prev => [...prev, ...data.products]);
                setPage(nextPage);
                if (products.length + data.products.length >= totalProducts) {
                    setHasMore(false);
                }
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error("Error loading products:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMore) {
                loadMore();
            }
        }, { threshold: 0, rootMargin: "600px" });

        if (loaderRef.current) {
            observer.observe(loaderRef.current);
        }

        return () => observer.disconnect();
    }, [hasMore, page, loading, sort, search]); // Added deps to ensure it reacts to state changes

    // Reset when sort or slugs change
    useEffect(() => {
        setProducts(initialProducts);
        setPage(1);
        setHasMore(initialProducts.length < totalProducts);
    }, [initialProducts, totalProducts]);

    return (
        <>
            <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-16 md:gap-x-10 md:gap-y-10">
                {products.map((product) => (
                    <ProductCard
                        key={product.id}
                        id={product.id}
                        title={(lang === 'en' ? product.name : product[`name_${lang}`] || product.name)}
                        slug={product.slug}
                        price={Number(product.price)}
                        image={product.images?.[0] || "/window.svg"}
                        hoverImage={product.images?.[1]}
                        allImages={product.images}
                        discountAmount={Number(product.discountAmount)}
                        sizes={product.sizes}
                        label={product.label as any}
                        specifications={product.specifications}
                    />
                ))}

                {/* Show skeletons inside the same grid while loading more */}
                {loading && Array.from({ length: 12 }).map((_, i) => (
                    <ProductSkeleton key={`skeleton-${i}`} />
                ))}
            </div>

            {hasMore && (
                <div ref={loaderRef} className="h-20 w-full" />
            )}

            {!hasMore && products.length > 0 && (
                <div className="mt-20 text-center">
                    <div className="h-px bg-black/5 w-24 mx-auto mb-6" />
                    <p className="text-[10px] uppercase tracking-[0.4em] font-black text-black/20">
                        {t('common.end_of_library')}
                    </p>
                </div>
            )}
        </>
    );
}
