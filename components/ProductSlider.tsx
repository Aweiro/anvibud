
"use client";

import { useRef, useState, useEffect } from "react";
import { ProductCard } from "./ProductCard";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface Product {
    id: string;
    name: string;
    name_uk?: string;
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

interface ProductSliderProps {
    products: Product[];
    lang: string;
}

export function ProductSlider({ products, lang }: ProductSliderProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const [scrollProgress, setScrollProgress] = useState(0);

    const checkScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
            setScrollProgress(scrollLeft / (scrollWidth - clientWidth));
        }
    };

    useEffect(() => {
        const el = scrollRef.current;
        if (el) {
            el.addEventListener("scroll", checkScroll);
            checkScroll();
            window.addEventListener("resize", checkScroll);
        }
        return () => {
            el?.removeEventListener("scroll", checkScroll);
            window.removeEventListener("resize", checkScroll);
        };
    }, []);

    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            const { clientWidth } = scrollRef.current;
            const scrollAmount = direction === "left" ? -clientWidth * 0.8 : clientWidth * 0.8;
            scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
        }
    };

    return (
        <div className="relative group/slider overflow-hidden">
            {/* Desktop Side Navigation Arrows (Premium) */}
            <div className="hidden md:flex absolute inset-y-0 left-0 right-0 items-center justify-between z-50 pointer-events-none px-2">
                <button
                    onClick={() => scroll("left")}
                    disabled={!canScrollLeft}
                    className={`w-12 h-12 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-md shadow-xl border border-black/5 transition-all duration-500 pointer-events-auto text-black/60 ${!canScrollLeft
                        ? "opacity-0 -translate-x-4 pointer-events-none"
                        : "opacity-100 translate-x-0 hover:text-black active:scale-90"
                        }`}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                </button>
                <button
                    onClick={() => scroll("right")}
                    disabled={!canScrollRight}
                    className={`w-12 h-12 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-md shadow-xl border border-black/5 transition-all duration-500 pointer-events-auto text-black/60 ${!canScrollRight
                        ? "opacity-0 translate-x-4 pointer-events-none"
                        : "opacity-100 translate-x-0 hover:text-black active:scale-90"
                        }`}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M9 18l6-6-6-6" />
                    </svg>
                </button>
            </div>

            {/* Scrollable Container */}
            <div
                ref={scrollRef}
                className="flex gap-4 md:gap-10 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pb-10"
                style={{ WebkitOverflowScrolling: "touch" }}
            >
                {products.map((product) => (
                    <div
                        key={product.id}
                        className="flex-shrink-0 w-[calc(50%-8px)] sm:w-[calc(33.333%-27px)] lg:w-[calc(25%-30px)] xl:w-[calc(20%-32px)] snap-start"
                    >
                        <ProductCard
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
                            sizeVariants={product.sizeVariants}
                            baseSize={product.baseSize}
                        />
                    </div>
                ))}
            </div>

            {/* Custom Scrollbar Progress - Aesthetic choice */}
            <div className="h-[1px] w-full bg-black/10 relative overflow-hidden">
                <div
                    className="absolute top-0 bottom-0 bg-black transition-all duration-300 ease-out"
                    style={{
                        left: `${scrollProgress * 80}%`,
                        width: '20%'
                    }}
                />
            </div>
        </div>
    );
}
