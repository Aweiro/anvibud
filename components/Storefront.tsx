import { ProductCard } from "@/components/ProductCard";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { FilterBar } from "./FilterBar";
import { getServerTranslation } from "@/lib/i18n/server";
import { InfiniteProductGrid } from "./InfiniteProductGrid";
import { ProductSlider } from "./ProductSlider";
import { HeroCarousel } from "./HeroCarousel";
import { SidebarCategories } from "./SidebarCategories";
import { 
    Hammer, 
    Paintbrush, 
    Home, 
    Zap, 
    Droplets, 
    Shovel, 
    Construction, 
    Wrench,
    ArrowRight,
    ChevronRight,
    MapPin,
    Clock,
    Truck,
    Check
} from "lucide-react";
import { CategoryGrid } from "./CategoryGrid";
import { SubcategoryGrid } from "./SubcategoryGrid";

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

interface Category {
    id: string;
    name: string;
    name_uk?: string | null;
    name_pl?: string | null;
    slug: string;
    image?: string | null;
    [key: string]: any;
}

export async function Storefront({
    categorySlug,
    subcategorySlug,
    searchParams,
    hideHero = false
}: {
    categorySlug?: string;
    subcategorySlug?: string;
    searchParams?: { [key: string]: string | string[] | undefined };
    hideHero?: boolean;
}) {
    const { t, lang } = await getServerTranslation();
    const whereClause: any = { isActive: true };

    if (subcategorySlug) {
        whereClause.subcategory = { slug: subcategorySlug };
    } else if (categorySlug) {
        whereClause.subcategory = {
            category: { slug: categorySlug }
        };
    }

    // Apply Filters
    const limit = 12;
    const sort = typeof searchParams?.sort === 'string' ? searchParams.sort : 'newest';
    const selectedSizes = typeof searchParams?.size === 'string' ? searchParams.size.split(',') : [];
    const selectedBrands = typeof searchParams?.brand === 'string' ? searchParams.brand.split(',') : [];
    const selectedLabels = typeof searchParams?.label === 'string' ? searchParams.label.split(',') : [];
    const searchQuery = typeof searchParams?.search === 'string' ? searchParams.search : undefined;

    if (searchQuery) {
        whereClause.OR = [
            { name: { contains: searchQuery, mode: 'insensitive' } },
            { name_uk: { contains: searchQuery, mode: 'insensitive' } },
            { name_pl: { contains: searchQuery, mode: 'insensitive' } },
            { brand: { contains: searchQuery, mode: 'insensitive' } },
        ];
    }

    if (selectedSizes.length > 0) {
        whereClause.sizes = {
            hasSome: selectedSizes
        };
    }

    if (selectedBrands.length > 0) {
        whereClause.brand = {
            in: selectedBrands
        };
    }

    if (selectedLabels.length > 0) {
        whereClause.label = {
            in: selectedLabels
        };
    }

    if (searchParams?.sale === 'true') {
        const saleConditions = {
            OR: [
                { discountAmount: { gt: 0 } },
                { label: 'SALE' },
                { sizeVariants: { not: Prisma.AnyNull } }
            ]
        };
        
        if (whereClause.OR) {
            // If we already have an OR from search, we wrap everything in AND
            const currentOR = whereClause.OR;
            delete whereClause.OR;
            whereClause.AND = [
                { OR: currentOR },
                saleConditions
            ];
        } else {
            whereClause.AND = [saleConditions];
        }
    }

    let orderBy: any = { createdAt: "desc" };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    if (sort === 'price_desc') orderBy = { price: 'desc' };

    const ITEMS_PER_PAGE = limit;
    const currentPage = Number(searchParams?.page) || 1;
    const skip = (currentPage - 1) * ITEMS_PER_PAGE;

    const totalProducts = await prisma.product.count({
        where: whereClause
    });

    const rawProducts = await prisma.product.findMany({
        where: whereClause,
        include: {
            subcategory: {
                include: { category: true }
            }
        },
        orderBy,
        take: ITEMS_PER_PAGE,
        skip: skip
    });

    const products: Product[] = JSON.parse(JSON.stringify(rawProducts));

    // Get all sizes available for this category context (ignoring size filter)
    const baseWhereClause: any = { isActive: true };
    if (subcategorySlug) {
        baseWhereClause.subcategory = { slug: subcategorySlug };
    } else if (categorySlug) {
        baseWhereClause.subcategory = { category: { slug: categorySlug } };
    }

    const rawFilterData = await prisma.product.findMany({
        where: baseWhereClause,
        select: { sizeVariants: true, brand: true, label: true }
    });

    // Fetch sale products separately to ensure they are always available for the slider
    const rawSaleProducts = await prisma.product.findMany({
        where: { 
            isActive: true,
            OR: [
                { discountAmount: { gt: 0 } },
                { label: 'SALE' },
                { sizeVariants: { not: Prisma.AnyNull } }
            ]
        },
        include: { subcategory: { include: { category: true } } },
        orderBy: { createdAt: 'desc' },
        take: 30
    });

    const saleProducts: Product[] = JSON.parse(JSON.stringify(rawSaleProducts)).filter((p: any) => {
        const hasMainDiscount = (p.discountAmount && Number(p.discountAmount) > 0) || p.label === 'SALE';
        let hasVariantDiscount = false;
        if (p.sizeVariants) {
            try {
                const variants = typeof p.sizeVariants === 'string' ? JSON.parse(p.sizeVariants) : p.sizeVariants;
                // According to schema comments, variants use 'salePrice'
                hasVariantDiscount = Array.isArray(variants) && variants.some((v: any) => v.salePrice && Number(v.salePrice) > 0);
            } catch (e) {}
        }
        return hasMainDiscount || hasVariantDiscount;
    });

    const filterData = JSON.parse(JSON.stringify(rawFilterData));
    const allSizes = Array.from(new Set(filterData.flatMap((p: any) => {
        if (!p.sizeVariants) return [];
        try {
            const variants = typeof p.sizeVariants === 'string' ? JSON.parse(p.sizeVariants) : p.sizeVariants;
            if (Array.isArray(variants)) {
                return variants.map((v: any) => v.size).filter(Boolean);
            }
        } catch (e) {}
        return [];
    }))) as string[];
    const allBrands = Array.from(new Set(filterData.map((p: any) => p.brand).filter(Boolean))) as string[];
    const allLabels = Array.from(new Set(filterData.map((p: any) => p.label).filter(Boolean))) as string[];

    allSizes.sort();
    allBrands.sort();
    allLabels.sort();

    // Fetch Popular Products (Bestsellers or Special Label)
    const rawPopular = await prisma.product.findMany({
        where: { isActive: true },
        take: 12,
        orderBy: { createdAt: "desc" } // In a real app, this might be by sales/views
    });
    const popularProducts: Product[] = JSON.parse(JSON.stringify(rawPopular));

    let categoryData = null;
    let subcategoryData = null;

    if (subcategorySlug) {
        const rawSub = await prisma.subcategory.findUnique({
            where: { slug: subcategorySlug },
            include: { category: true }
        });
        subcategoryData = JSON.parse(JSON.stringify(rawSub));
    } else if (categorySlug) {
        const rawCat = await prisma.category.findUnique({
            where: { slug: categorySlug }
        });
        categoryData = JSON.parse(JSON.stringify(rawCat));
    }

    const currentTitle = (lang === 'en' ? (subcategoryData?.name || categoryData?.name) : (subcategoryData?.[`name_${lang}`] || categoryData?.[`name_${lang}`] || subcategoryData?.name || categoryData?.name)) || t('common.selection');

    const catName = (lang === 'en' ? subcategoryData?.category?.name : subcategoryData?.category?.[`name_${lang}`] || subcategoryData?.category?.name);
    const subName = (lang === 'en' ? subcategoryData?.name : subcategoryData?.[`name_${lang}`] || subcategoryData?.name);

    const currentBreadcrumb = subcategoryData
        ? `${catName} / ${subName}`
        : (lang === 'en' ? categoryData?.name : categoryData?.[`name_${lang}`] || categoryData?.name);

    const categories = await prisma.category.findMany({
        select: { 
            id: true, 
            name: true, 
            name_uk: true, 
            name_pl: true, 
            slug: true, 
            image: true,
            subcategories: {
                select: {
                    id: true,
                    name: true,
                    name_uk: true,
                    name_pl: true,
                    slug: true,
                    image: true
                }
            }
        },
        orderBy: { name: 'asc' }
    });

    const subcategories = categorySlug 
        ? await prisma.subcategory.findMany({
            where: { category: { slug: categorySlug } },
            orderBy: { name: 'asc' }
        })
        : [];

    const tickerLogos = [
        "/brand1.png",
        "/brand2.png",
        "/brand3.png",
        "/brand4.png",
        "/brand5.png",
        "/brand6.png"
    ];

    return (
        <main className="flex-1 bg-white">

            {/* Hero Section with Sidebar */}
            {!hideHero && !categorySlug && !subcategorySlug && (
                <div className="mx-auto max-w-[1800px] px-0 lg:px-6 lg:mt-4">
                    <div className="flex flex-col lg:flex-row gap-0 lg:gap-6 h-auto lg:h-[600px]">
                        
                        {/* Desktop Sidebar (Client Component with Hover) */}
                        <SidebarCategories 
                            categories={categories as any} 
                            lang={lang} 
                            translations={{
                                categories_label: "Категорії товарів"
                            }}
                        />

                        {/* Carousel Area */}
                        <div className="flex-1 min-w-0 h-[400px] md:h-[500px] lg:h-full">
                            <HeroCarousel />
                        </div>

                    </div>
                </div>
            )}

            {/* Category/Subcategory Static Hero (Existing logic for deep pages) */}
            {!hideHero && (categorySlug || subcategorySlug) && (
                <div className="relative w-full overflow-hidden bg-[#f0f0f0] border-b border-black/[0.03]">
                    <div className="mx-auto max-w-[1800px] flex flex-col md:flex-row items-stretch relative h-[200px] md:h-[200px] overflow-hidden group">
                        {/* Background Image / Desktop Panel */}
                        <div className="absolute inset-0 md:relative md:flex-1 bg-zinc-100 overflow-hidden">
                            {(subcategoryData?.image || subcategoryData?.category?.image || categoryData?.image) ? (
                                <Image
                                    src={subcategoryData?.image || subcategoryData?.category?.image || categoryData?.image || ""}
                                    alt={currentTitle}
                                    fill
                                    className="object-cover transition-all duration-[2000ms] group-hover:scale-105 grayscale contrast-125 brightness-90 opacity-80 group-hover:opacity-100 group-hover:brightness-100"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px] uppercase tracking-widest text-black/10 font-bold italic bg-zinc-50">
                                    {t('home.visual_archive')}
                                </div>
                            )}
                            {/* Mobile Dark Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent md:hidden" />
                        </div>

                        {/* Text Content */}
                        <div className="flex-1 md:flex-1 bg-transparent md:bg-white flex flex-col justify-end md:justify-center px-6 pb-4 md:px-20 border-l border-black/[0.03] overflow-hidden">
                            {/* Abstract background text - hidden on mobile */}
                            <div className="absolute -right-4 top-1/2 -translate-y-1/2 text-[12vw] font-black text-black/[0.02] uppercase tracking-tighter leading-none select-none pointer-events-none italic hidden md:block">
                                {currentTitle}
                            </div>

                            <div className="relative z-10 space-y-6 pt-10 md:pt-0">
                                <nav className="flex items-center gap-2 text-[9px] uppercase tracking-[0.3em] font-black text-white/50 md:text-black/20 md:pt-2 md:border-t md:border-black/5">
                                    <Link href="/" className="hover:text-white md:hover:text-black transition-colors">{t('common.archive')}</Link>
                                    <span>/</span>
                                    <span className="text-white md:text-black">{currentBreadcrumb}</span>
                                </nav>
                                <div className="space-y-2">
                                    <h1 className="text-4xl md:text-[4vw] mb-4 font-black text-white md:text-black tracking-tighter uppercase italic leading-[0.8]">
                                        {currentTitle}
                                    </h1>

                                    <div className="flex items-center gap-4">
                                        <span className="text-[10px] uppercase tracking-[0.4em] font-black text-white/40 md:text-black/40">{totalProducts} {t('common.objects')}</span>
                                        <div className="w-8 h-[1px] bg-white/20 md:bg-black/10" />
                                        <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-white/20 md:text-black/10 italic">{t('home.contextual_library')} 26</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Subcategories Visual Navigation */}
            {categorySlug && subcategories.length > 0 && (
                <div className="bg-white border-b border-black/[0.03]">
                    <div className="mx-auto max-w-[1800px] px-4 md:px-6 py-6 md:py-10">
                        <SubcategoryGrid 
                            categorySlug={categorySlug}
                            subcategorySlug={subcategorySlug}
                            subcategories={subcategories as any}
                            lang={lang}
                        />
                    </div>
                </div>
            )}

            {/* Brand Ticker */}
            {!hideHero && !categorySlug && !subcategorySlug && (
                <div className="w-full bg-white py-4 overflow-hidden">
                    <div className="animate-marquee whitespace-nowrap flex items-center gap-2 md:gap-12">
                        {[...tickerLogos, ...tickerLogos].map((logo, i) => (
                            <div key={i} className="flex-shrink-0 h-10 md:h-18 w-24 md:w-56 relative grayscale opacity-40 hover:opacity-100 transition-opacity duration-300 transform hover:scale-110 flex items-center justify-center">
                                <img
                                    src={logo}
                                    alt="Partner Brand"
                                    className="max-h-full max-w-full object-contain"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Departments Section */}
            {!hideHero && !categorySlug && !subcategorySlug && categories.length > 0 && (
                <div className="mx-auto max-w-[1800px] px-6 mb-6">
                    <div className="flex items-end justify-between mb-4 md:mb-8 border-b border-black pb-4">
                        <h3 className="text-[11px] uppercase tracking-[0.5em] font-black text-black">
                            {t('common.explore_departments')}
                        </h3>
                        <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-black/40">Index / 01-0{categories.length}</span>
                    </div>
                    <CategoryGrid 
                        categories={categories as any} 
                        lang={lang} 
                        translations={{
                            browse_store: t('common.browse_store')
                        }} 
                    />
                </div>
            )}

            {/* Hot Deals Section (New Block - Fixed with global fetch) */}
            {(!categorySlug && !subcategorySlug && !hideHero) && saleProducts.length > 0 && (
                <div className="py-6 md:py-10 bg-white border-b border-black/5">
                    <div className="mx-auto max-w-[1800px] px-6">
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6 border-b border-black/10 pb-10">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                    <span className="text-[10px] uppercase tracking-[0.5em] font-black text-black/40 block">Limited Offers</span>
                                </div>
                                <h2 className="text-4xl md:text-6xl font-extrabold tracking-tighter uppercase text-black">{t('common.hot_deals')}</h2>
                                <p className="text-[11px] uppercase tracking-[0.3em] font-bold text-black/30">{t('common.hot_deals_desc')}</p>
                            </div>
                            <Link href="/shop?sale=true" className="group flex items-center gap-6 text-[11px] uppercase tracking-[0.4em] font-black text-black hover:text-black/50 transition-all">
                                {t('common.view_all')}
                                <div className="relative flex items-center">
                                    <span className="w-12 h-[1px] bg-black group-hover:w-20 transition-all duration-500" />
                                    <ArrowRight size={14} className="absolute -right-2 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-0 group-hover:translate-x-2" />
                                </div>
                            </Link>
                        </div>
                        <div className="mt-4">
                            <ProductSlider products={saleProducts.slice(0, 15)} lang={lang} />
                        </div>
                    </div>
                </div>
            )}

            {/* Brand Philosophy Section (Redesigned with Map and Pickup) */}
            {!hideHero && !categorySlug && !subcategorySlug && (
                <div className="bg-white pt-12 pb-16 md:py-16 border-y border-black/5 relative z-20">
                    <div className="mx-auto max-w-[1800px] px-6">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
                            
                            {/* Left Column: Philosophy Text */}
                            <div className="lg:col-span-5 space-y-8">
                                <div className="space-y-4">
                                    <span className="text-[10px] uppercase tracking-[0.6em] font-black text-black/30 block">{t('philosophy.label')}</span>
                                    <h3 className="text-4xl md:text-6xl font-extrabold tracking-tighter uppercase leading-[0.85] text-black">
                                        {t('philosophy.title_1')} <br />{t('philosophy.title_2')} <br />{t('philosophy.title_3')}
                                    </h3>
                                </div>
                                <div className="h-1 w-20 bg-black" />
                                <p className="text-lg text-black/70 font-light leading-relaxed italic max-w-xl">
                                    {t('philosophy.desc')}
                                </p>
                                <div className="pt-4">
                                    <Link href="/about" className="group inline-flex items-center gap-6 text-[11px] uppercase tracking-[0.4em] font-black text-black hover:text-black/50 transition-colors">
                                        {t('common.read_our_story')}
                                        <div className="relative flex items-center justify-center">
                                            <span className="w-12 h-[1px] bg-black group-hover:w-20 transition-all duration-500" />
                                            <ArrowRight size={14} className="absolute -right-2 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-0 group-hover:translate-x-2" />
                                        </div>
                                    </Link>
                                </div>
                            </div>

                            {/* Right Column: Map & Pickup Info */}
                            <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Map Container */}
                                <div className="relative h-[350px] md:h-full min-h-[400px] rounded-sm overflow-hidden border border-black/5 shadow-2xl group">
                                    <iframe 
                                        src="https://maps.google.com/maps?q=48.918,24.721&t=&z=15&ie=UTF8&iwloc=&output=embed" 
                                        width="100%" 
                                        height="100%" 
                                        style={{ border: 0, filter: 'grayscale(1) contrast(1.2) brightness(0.9)' }} 
                                        allowFullScreen={false} 
                                        loading="lazy" 
                                        referrerPolicy="no-referrer-when-downgrade"
                                        className="transition-all duration-1000 group-hover:grayscale-0 group-hover:brightness-100"
                                    ></iframe>
                                    <div className="absolute top-4 left-4 bg-black text-white px-4 py-2 text-[9px] font-black uppercase tracking-widest shadow-xl">
                                        Showroom_Location
                                    </div>
                                </div>

                                {/* Pickup Card */}
                                <div className="bg-zinc-50 p-8 md:p-10 flex flex-col justify-between border border-black/5 relative overflow-hidden group">
                                    {/* Decoration */}
                                    <div className="absolute -top-10 -right-10 text-[120px] font-black text-black/[0.03] select-none pointer-events-none group-hover:text-black/[0.05] transition-colors duration-700">
                                        ANV
                                    </div>

                                    <div className="space-y-10 relative z-10">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3 text-black/20">
                                                <Truck size={18} strokeWidth={1.5} />
                                                <div className="h-[1px] w-12 bg-black/10" />
                                            </div>
                                            <h4 className="text-2xl font-black uppercase tracking-tighter text-black">{t('philosophy.pickup_title')}</h4>
                                            <p className="text-[10px] uppercase tracking-widest text-black/40 font-bold leading-relaxed">{t('philosophy.pickup_desc')}</p>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="flex gap-4">
                                                <div className="w-10 h-10 flex items-center justify-center bg-black text-white rounded-sm flex-shrink-0">
                                                    <MapPin size={18} />
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-[9px] uppercase tracking-widest font-black text-black/30 block">{t('philosophy.address_label')}</span>
                                                    <span className="text-[11px] font-bold uppercase tracking-tight text-black">{t('philosophy.address_value')}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-4">
                                                <div className="w-10 h-10 flex items-center justify-center bg-white border border-black/10 text-black rounded-sm flex-shrink-0">
                                                    <Clock size={18} />
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-[9px] uppercase tracking-widest font-black text-black/30 block">{t('philosophy.hours_label')}</span>
                                                    <span className="text-[11px] font-bold uppercase tracking-tight text-black">{t('philosophy.hours_value')}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3 pt-4 border-t border-black/5">
                                            {[1, 2, 3].map((i) => (
                                                <div key={i} className="flex items-center gap-3">
                                                    <div className="w-4 h-4 rounded-full bg-black/5 flex items-center justify-center">
                                                        <Check size={10} className="text-black/40" />
                                                    </div>
                                                    <span className="text-[9px] uppercase tracking-[0.15em] font-bold text-black/60">
                                                        {t(`philosophy.pickup_benefit_${i}`)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mt-8">
                                        <a 
                                            href="https://maps.app.goo.gl/5NWtsgxGN65sK1Qm8" 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="block w-full bg-black text-white text-center py-4 text-[9px] font-black uppercase tracking-[0.3em] hover:bg-zinc-800 transition-all active:scale-[0.98] shadow-lg shadow-black/10"
                                        >
                                            Маршрут у Google Maps
                                        </a>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}

            {/* Filter Bar */}
            {(categorySlug || subcategorySlug || hideHero) && (
                <FilterBar allSizes={allSizes} allBrands={allBrands} />
            )}

            {/* Product Grid (Moved Up) */}
            <div className="mx-auto max-w-[1800px] px-6 pb-10">
                <div className="flex items-center justify-between mt-6 mb-4 md:mb-8 border-b border-black pb-4 gap-4">
                    <div className="flex flex-col md:flex-row md:items-center w-full justify-between gap-2 md:gap-4 overflow-hidden">
                        <h3 className="text-[11px] uppercase tracking-[0.5em] font-black text-black truncate">
                            {totalProducts > 0 ? (categorySlug ? t('common.department_selection') : t('common.current_collection')) : t('common.end_of_library')}
                        </h3>
                        <div className="text-[9px] uppercase tracking-[0.2em] font-bold text-black/40 flex-shrink-0">
                            {totalProducts} {t('common.items_available')}
                        </div>
                    </div>
                </div>

                {totalProducts === 0 ? (
                    <div className="py-40 text-center">
                        <h3 className="text-[12px] uppercase tracking-[0.4em] font-black text-black">{t('common.empty_library')}</h3>
                    </div>
                ) : (
                    <>
                        {(!categorySlug && !subcategorySlug && !hideHero) ? (
                            <ProductSlider
                                products={products}
                                lang={lang}
                            />
                        ) : (
                            <InfiniteProductGrid
                                initialProducts={products}
                                totalProducts={totalProducts}
                                categorySlug={categorySlug}
                                subcategorySlug={subcategorySlug}
                                sort={sort}
                                search={searchQuery}
                                lang={lang}
                            />
                        )}
                    </>
                )}
            </div>

            {/* Features Banner */}
            {!hideHero && !categorySlug && !subcategorySlug && (
                <div className="bg-black text-white md:py-32 py-12 overflow-hidden relative border-y border-white/5">
                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] select-none pointer-events-none">
                        <span className="text-[40vw] font-black uppercase tracking-tighter leading-none italic">ANVIBUD</span>
                    </div>

                    <div className="mx-auto max-w-[1800px] px-6 relative z-10 text-center">
                        <h3 className="text-4xl md:text-[5vw] font-black uppercase tracking-tighter md:mb-24 mb-12 max-w-5xl mx-auto leading-[0.85]">
                            {t('features.main_title')} <br /><span className="text-white/30 italic">{t('features.main_subtitle')}</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-4 lg:gap-16">
                            {[
                                { title: t('features.f1_title'), desc: t('features.f1_desc') },
                                { title: t('features.f2_title'), desc: t('features.f2_desc') },
                                { title: t('features.f3_title'), desc: t('features.f3_desc') }
                            ].map((feature, i) => (
                                <div key={i} className="space-y-4 border-l border-white/10 pl-8 text-left hover:border-white transition-colors duration-500">
                                    <h4 className="text-[11px] uppercase tracking-[0.4em] font-black">{feature.title}</h4>
                                    <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] leading-loose">{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Popular Products Section (Fixed Visibility) */}
            {!hideHero && !categorySlug && !subcategorySlug && popularProducts.length > 0 && (
                <div className="md:py-10 py-8 border-t border-black/5">
                    <div className="mx-auto max-w-[1800px] px-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                            <div className="space-y-2">
                                <span className="text-[10px] uppercase tracking-[0.5em] font-bold text-black/60">{t('common.selection')}</span>
                                <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-black">{t('common.most_wanted')}</h3>
                            </div>
                            <Link href="/shop" className="text-[11px] uppercase tracking-[0.3em] font-black border-b-2 border-black pb-1 hover:text-black/50 transition-colors text-black self-start md:self-auto">
                                {t('common.view_entire_archive')}
                            </Link>
                        </div>
                        <ProductSlider products={popularProducts} lang={lang} />
                    </div>
                </div>
            )}

            {/* Premium Redesigned Footer */}
            <Footer />
        </main>
    );
}
