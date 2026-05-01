"use client";

import type { StaticImageData } from "next/image";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useCartStore } from "@/lib/stores/cart.store";
import { useWishlistStore } from "@/lib/stores/wishlist.store";
import { useLanguage } from "@/lib/i18n/LanguageContext";

type ProductCardProps = {
  id: string;
  title: string;
  slug?: string;
  description?: string;
  price: number;
  image: string | StaticImageData;
  hoverImage?: string | StaticImageData;
  allImages?: string[];
  discountAmount?: number;
  currency?: string;
  className?: string;
  sizes?: string[];
  label?: 'BESTSELLER' | 'NEW' | 'SALE' | null;
  specifications?: { key: string, value: string }[];
  sizeVariants?: { size: string, price: string, salePrice?: string }[];
  baseSize?: string;
  variant?: 'default' | 'wishlist';
  onRemove?: (id: string) => void;
};

const formatPrice = (price: number, currency: string) =>
  new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(price);

export function ProductCard({
  id,
  title,
  slug,
  price,
  image,
  hoverImage,
  allImages = [],
  discountAmount = 0,
  currency = "UAH",
  className = "",
  sizes = [],
  label,
  specifications,
  sizeVariants = [],
  baseSize,
  variant = 'default',
  onRemove,
}: ProductCardProps) {
  const { t } = useLanguage();
  const [isAdded, setIsAdded] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [showSizeError, setShowSizeError] = useState(false);
  const [currentImgIdx, setCurrentImgIdx] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Combine images for mobile carousel
  const carouselImages = allImages.length > 0
    ? allImages
    : [image, hoverImage].filter(Boolean) as (string | StaticImageData)[];

  const addToCart = useCartStore((state) => state.addToCart);
  const addToWishlist = useWishlistStore((state) => state.addToWishlist);
  const removeFromWishlist = useWishlistStore((state) => state.removeFromWishlist);
  const isWishlisted = useWishlistStore((state) => state.isWishlisted(id));

  const [cardPrice, setCardPrice] = useState<number>(price);
  const [cardSalePrice, setCardSalePrice] = useState<number | null>(discountAmount > 0 ? price - discountAmount : null);

  useEffect(() => {
    let matched = false;
    if (selectedSize && sizeVariants.length > 0) {
      const variant = sizeVariants.find(v => v.size === selectedSize);
      if (variant) {
        const vPrice = parseFloat(variant.price);
        const vSalePrice = variant.salePrice ? parseFloat(variant.salePrice) : null;
        setCardPrice(vPrice);
        setCardSalePrice(vSalePrice);
        matched = true;
      }
    }

    if (!matched) {
      setCardPrice(price);
      setCardSalePrice(discountAmount > 0 ? price - discountAmount : null);
    }
  }, [selectedSize, sizeVariants, price, discountAmount]);

  const finalPrice = cardSalePrice !== null ? cardSalePrice : cardPrice;
  const originalPrice = cardSalePrice !== null ? cardPrice : price;
  const hasDiscount = cardSalePrice !== null && cardSalePrice < cardPrice;
  const discountPercent = hasDiscount ? Math.round(((cardPrice - cardSalePrice) / cardPrice) * 100) : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (sizes.length > 0 && !selectedSize) {
      setShowSizeError(true);
      setTimeout(() => setShowSizeError(false), 2000);
      return;
    }

    addToCart({
      id: selectedSize ? `${id}-${selectedSize}` : id,
      baseId: id,
      size: selectedSize || undefined,
      title: selectedSize ? `${title} / ${selectedSize}` : title,
      price: finalPrice,
      image: typeof carouselImages[0] === "string" ? carouselImages[0] : undefined,
    });

    setIsAdded(true);
    setSelectedSize(null);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (variant === 'wishlist' && onRemove) {
      onRemove(id);
      return;
    }

    if (isWishlisted) {
      removeFromWishlist(id);
    } else {
      addToWishlist({
        id,
        title,
        price, // Base price
        discountAmount,
        image: typeof carouselImages[0] === "string" ? (carouselImages[0] as string) : undefined,
        hoverImage: typeof carouselImages[1] === "string" ? (carouselImages[1] as string) : undefined,
        allImages: carouselImages.every(img => typeof img === 'string') ? carouselImages as string[] : undefined,
        slug: slug ?? "",
        sizes,
        selectedSize,
        sizeVariants,
        baseSize,
        specifications,
      });
    }
  };

  const nextImage = (e: React.MouseEvent | React.PointerEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (carouselImages.length > 1) {
      setCurrentImgIdx((prev) => (prev + 1) % carouselImages.length);
    }
  };

  const prevImage = (e: React.MouseEvent | React.PointerEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (carouselImages.length > 1) {
      setCurrentImgIdx((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
    }
  };


  return (
    <article className={`group relative flex flex-col h-full bg-white ${className}`}>
      <div className="relative">
        {/* 1. Image Container (instead of Link for better event control) */}
        {slug ? (
          <div 
            onClick={(e) => {
              // Only navigate if we're not clicking a button or its children
              const target = e.target as HTMLElement;
              if (!target.closest('button')) {
                router.push(`/product/${slug}`);
              }
            }}
            className="block relative aspect-[3/4] w-full bg-[#f9f9f9] overflow-hidden group/img cursor-pointer"
          >
            {/* Unified Image Display: Carousel with Smooth Hover Effect for Desktop */}
            <div className="absolute inset-0 p-4 md:p-8">
              {carouselImages.map((img, idx) => (
                <Image
                  key={idx}
                  src={img}
                  alt={`${title} - view ${idx + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 320px"
                  className={`object-contain transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] p-4 ${
                    idx === currentImgIdx 
                      ? (isLoaded ? "opacity-100 scale-100 translate-x-0" : "opacity-0 scale-95") 
                      : "opacity-0 scale-105 translate-x-4 pointer-events-none"
                  } ${
                    // Smooth Hover Effect for the first two images on desktop (No Blur)
                    idx === 0 && carouselImages.length > 1 && currentImgIdx === 0
                      ? "md:group-hover/img:opacity-0 md:group-hover/img:scale-105 md:group-hover/img:-translate-x-3"
                      : ""
                  } ${
                    idx === 1 && carouselImages.length > 1 && currentImgIdx === 0
                      ? "md:opacity-0 md:group-hover/img:opacity-100 md:group-hover/img:scale-100 md:group-hover/img:translate-x-0 md:scale-110 md:translate-x-3"
                      : ""
                  }`}
                  onLoad={() => setIsLoaded(true)}
                />
              ))}
            </div>
            {label && (
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-1 items-start">
                <span className={`text-[8px] md:text-[10px] uppercase font-black tracking-[0.2em] px-2 py-1 md:px-2.5 md:py-1.5 shadow-2xl backdrop-blur-md ${label === 'BESTSELLER' ? 'bg-black text-white' :
                  label === 'NEW' ? 'bg-white text-black border border-black/20' :
                    'bg-zinc-100 text-black border border-black/5'
                  }`}>
                  {label === 'BESTSELLER' ? t('common.hit') : label === 'NEW' ? t('common.new_arrival') : t('common.sale')}
                </span>
              </div>
            )}
            {hasDiscount && (
              <span className="absolute bottom-4 left-4 bg-black text-white text-[10px] uppercase font-bold px-2 py-1 tracking-tighter">
                -{discountPercent}%
              </span>
            )}

            {/* Hover Specifications Overlay (Desktop only) */}
            {specifications && Array.isArray(specifications) && specifications.length > 0 && (
              <div className="hidden lg:flex absolute inset-x-0 bottom-0 flex-col justify-end p-6 bg-gradient-to-t from-[#f9f9f9] via-[#f9f9f9]/90 to-transparent opacity-0 group-hover/img:opacity-100 transition-all duration-500 z-20 translate-y-2 group-hover/img:translate-y-0">
                {(specifications as {key: string, value: string}[]).slice(0, 3).map((spec, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[9px] uppercase tracking-[0.1em] py-1.5 border-b border-black/5 last:border-0">
                    <span className="text-black/50 truncate pr-2 font-medium">{spec.key}</span>
                    <span className="font-bold text-black truncate">{spec.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="block relative aspect-[3/4] w-full bg-[#f9f9f9] overflow-hidden" />
        )}

        {/* 2. detached Wishlist Button / Remove Button */}
        <button
          type="button"
          onClick={handleWishlist}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center transition-all bg-white z-30 border border-black/5 hover:border-black/20"
          aria-label={variant === 'wishlist' ? "Remove from wishlist" : "Toggle wishlist"}
        >
          {variant === 'wishlist' ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              className={`h-4 w-4 transition-colors duration-300 ${mounted && isWishlisted ? "fill-black stroke-black" : "fill-none stroke-black"}`}
            >
              <path
                d="M12 20.25c-4.5-4-7.5-6.85-7.5-10.25A4.22 4.22 0 0 1 8.75 5.75 4.7 4.7 0 0 1 12 7.06a4.7 4.7 0 0 1 3.25-1.31A4.22 4.22 0 0 1 19.5 10c0 3.4-3 6.25-7.5 10.25Z"
                strokeWidth="1"
                strokeLinecap="square"
                strokeLinejoin="miter"
              />
            </svg>
          )}
        </button>

        {/* 3. Image Carousel Arrows - Minimal Tab Design (Centered) */}
        {carouselImages.length > 1 && (
          <div className="absolute inset-y-0 inset-x-0 flex items-center justify-between z-[40] pointer-events-none">
            <button
              onPointerDown={prevImage}
              onClick={(e) => { 
                e.preventDefault(); 
                e.stopPropagation(); 
              }}
              type="button"
              className="w-6 h-12 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-r-lg text-black/60 shadow-sm border border-black/5 transition-all pointer-events-auto touch-manipulation hover:text-black active:scale-95 opacity-100 md:opacity-0 md:group-hover/img:opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
              aria-label="Previous image"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
            <button
              onPointerDown={nextImage}
              onClick={(e) => { 
                e.preventDefault(); 
                e.stopPropagation(); 
              }}
              type="button"
              className="w-6 h-12 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-l-lg text-black/60 shadow-sm border border-black/5 transition-all pointer-events-auto touch-manipulation hover:text-black active:scale-95 opacity-100 md:opacity-0 md:group-hover/img:opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
              aria-label="Next image"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M9 18l6-6-6-6" /></svg>
            </button>
          </div>
        )}
        
        {/* Mobile Indicator Dots */}
        {carouselImages.length > 1 && (
          <div className="md:hidden absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1 z-30">
            {carouselImages.map((_, i) => (
              <div 
                key={i} 
                className={`w-1 h-1 rounded-full transition-all duration-300 ${i === currentImgIdx ? "bg-black w-3" : "bg-black/20"}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* 4. Details Section (Title, Price under it, sizes below) */}
      <div className="flex flex-col pt-4 space-y-3 flex-1">
        <div className="flex flex-col space-y-1">
          {slug ? (
            <Link href={`/product/${slug}`} className="text-[12px] uppercase tracking-wider font-medium text-black truncate hover:text-black/50 transition-colors">
              {title}
            </Link>
          ) : (
            <h3 className="text-[12px] uppercase tracking-wider font-medium text-black truncate">{title}</h3>
          )}

          <div className="flex items-center gap-2 pt-4">
            <span className="text-[12px] font-bold text-black">
              {formatPrice(finalPrice, currency)}
            </span>
            {hasDiscount && (
              <span className="text-[11px] text-black/30 line-through">
                {formatPrice(originalPrice, currency)}
              </span>
            )}
          </div>
        </div>

        {sizes.length > 0 && (
          <div className={`flex flex-wrap gap-1 transition-all duration-300 ${
            variant === 'wishlist' ? "opacity-100 translate-x-0" : "lg:opacity-0 lg:group-hover:opacity-100 lg:translate-x-2 lg:group-hover:translate-x-0"
          } ${showSizeError ? "scale-105" : ""}`}>
            {(isExpanded ? sizes : sizes.slice(0, 5)).map((size) => (
              <button
                key={size}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedSize(selectedSize === size ? null : size);
                  setShowSizeError(false);
                }}
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
            {sizes.length > 5 && !isExpanded && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsExpanded(true);
                }}
                className="h-6 px-1.5 flex items-center justify-center text-[8px] font-black text-black/25 bg-zinc-50 border border-black/5 hover:bg-black hover:text-white hover:border-black transition-all"
              >
                +{sizes.length - 5}
              </button>
            )}
            {isExpanded && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsExpanded(false);
                }}
                className="h-6 px-1.5 flex items-center justify-center text-[8px] font-black text-black/40 hover:text-black transition-all"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 15l-6-6-6 6" /></svg>
              </button>
            )}
          </div>
        )}

        <div className="mt-auto pt-2">
          {/* 5. Quick Add Button */}
          <button
            onClick={handleAddToCart}
            type="button"
            className={`w-full py-3 text-[10px] uppercase font-bold tracking-[0.2em] hover:tracking-[0.25em] active:scale-[0.98] transition-all duration-300 z-10 relative ${
              variant === 'wishlist' 
                ? "bg-white text-black border border-black/10 hover:bg-zinc-50 opacity-100" 
                : "bg-black text-white hover:bg-zinc-800 lg:opacity-0 lg:group-hover:opacity-100"
            }`}
          >
            {isAdded ? t('common.added') : (sizes.length > 0 && !selectedSize ? (showSizeError ? t('common.choose_size') : t('common.select_size')) : t('common.add_to_bag'))}
          </button>
        </div>
      </div>
    </article>
  );
}
