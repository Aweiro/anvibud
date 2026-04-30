import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductInfoClient } from "@/components/ProductInfoClient";
import { ProductSlider } from "@/components/ProductSlider";
import { Footer } from "@/components/Footer";
import { getServerTranslation } from "@/lib/i18n/server";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    const product = await prisma.product.findUnique({
        where: { slug: resolvedParams.slug }
    });

    if (!product) return { title: "Product Not Found | MIGRA" };

    return { title: `${product.name} | MIGRA Contextual` };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    const { t, lang } = await getServerTranslation();

    const rawProduct = await prisma.product.findUnique({
        where: { slug: resolvedParams.slug },
        include: {
            subcategory: {
                include: {
                    category: true
                }
            }
        }
    });

    if (!rawProduct) {
        notFound();
    }

    // Cast once to carry sizes + isCustomOrder (fields exist at runtime via schema)
    const product = rawProduct as typeof rawProduct & { sizes: string[]; isCustomOrder: boolean };

    const price = Number(product.price);
    const discountAmount = Number(product.discountAmount);
    const hasDiscount = discountAmount > 0;
    const discountedPrice = Math.max(0, price - discountAmount);
    // discountPercent calculated on-the-fly in display logic below if needed
    const discountPercent = hasDiscount ? Math.round((discountAmount / price) * 100) : 0;

    // Fetch related products (same subcategory)
    const rawRelatedProducts = await prisma.product.findMany({
        where: {
            subcategoryId: product.subcategoryId,
            id: { not: product.id }
        },
        take: 11,
        orderBy: { createdAt: "desc" }
    });

    const relatedProducts = rawRelatedProducts.map(p => ({
        ...p,
        price: Number(p.price),
        discountAmount: Number(p.discountAmount)
    }));

    const catName = (lang === 'en' ? product.subcategory.category.name : (product.subcategory.category as any)[`name_${lang}`] || product.subcategory.category.name);
    const subName = (lang === 'en' ? product.subcategory.name : (product.subcategory as any)[`name_${lang}`] || product.subcategory.name);
    const prodName = (lang === 'en' ? product.name : (product as any)[`name_${lang}`] || product.name);

    const breadcrumbs = [
        { label: t('common.home'), href: "/" },
        { label: catName, href: `/${product.subcategory.category.slug}` },
        { label: subName, href: `/${product.subcategory.category.slug}/${product.subcategory.slug}` },
        { label: prodName, href: `/product/${product.slug}` }
    ];

    return (
        <main className="flex-1 flex flex-col min-h-screen justify-between bg-white pt-6 border-t border-black/[0.03]">
            <div className="mx-auto w-full max-w-[1500px] px-6 mb-16">

                {/* Refined Minimal Header */}
                {/* Refined Responsive Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-black/[0.1] pb-6 mb-8 gap-6">
                    <nav className="flex flex-wrap items-center gap-y-2 gap-x-3 text-[9px] uppercase tracking-[0.3em] font-black">
                        {breadcrumbs.map((crumb, i) => (
                            <div key={crumb.href} className="flex items-center gap-2">
                                <Link
                                    href={crumb.href}
                                    className={`${i === breadcrumbs.length - 1 ? "text-black" : "text-black/30 hover:text-black"} transition-colors break-words`}
                                >
                                    {crumb.label}
                                </Link>
                                {i < breadcrumbs.length - 1 && <span className="text-black/10">/</span>}
                            </div>
                        ))}
                    </nav>

                    <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-4 w-full sm:w-auto border-t sm:border-t-0 border-black/[0.05] pt-4 sm:pt-0">
                        <span className="text-[10px] uppercase tracking-[0.5em] font-black text-black/20">ANVIBUD®</span>
                        <div className="w-12 h-[1px] bg-black/10 hidden xl:block" />
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-black animate-pulse" />
                            <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-black whitespace-nowrap">{t('product.archival_item')}</span>
                        </div>
                    </div>
                </div>

                {/* Top Section: Gallery and Form Actions */}
                <div className="flex flex-col lg:flex-row gap-12 xl:gap-18">
                    {/* Left: Gallery */}
                    <div className="w-full lg:w-[55%] xl:w-[60%]">
                        <ProductGallery images={product.images} label={(product as any).label} />
                    </div>

                    {/* Right: Info (Sticky Form) */}
                    <div className="w-full lg:w-[45%] xl:w-[40%] flex flex-col justify-start">
                        <div className="sticky top-28 space-y-10">

                            <Suspense fallback={<div className="h-96 animate-pulse bg-black/5 dark:bg-white/5" />}>
                                <ProductInfoClient
                                    product={{
                                        ...product,
                                        price: price,
                                        discountAmount: discountAmount,
                                        sizes: product.sizes,
                                        sizeVariants: product.sizeVariants as any,
                                        baseSize: (product as any).baseSize,
                                        image: product.images[0]
                                    }}
                                    prodName={prodName}
                                />
                            </Suspense>
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Details, Specs, Shipping */}
                <div className="mt-8 pt-6 border-t border-black/5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-24 mb-12">
                        <div className="space-y-6">
                            <h3 className="text-[11px] uppercase tracking-[0.4em] font-black border-b border-black pb-4 inline-block text-black">{t('product.description')}</h3>
                            <div className="text-xs font-light leading-loose text-black/70 whitespace-pre-wrap">
                                {(product as any)[`description_${lang}`] || product.description || t('product.default_desc')}
                            </div>
                        </div>
                        <div className="space-y-6">
                            <h3 className="text-[11px] uppercase tracking-[0.4em] font-black border-b border-black pb-4 inline-block text-black">{t('product.shipping_returns')}</h3>
                            <div className="space-y-4 text-[10px] uppercase tracking-[0.2em] text-black/50 leading-loose">
                                <p>{t('product.shipping_desc_1')}</p>
                                <p>{t('product.shipping_desc_2')}</p>
                            </div>
                        </div>
                    </div>

                    {/* Dynamic Specifications Table */}
                    {product.specifications && Array.isArray(product.specifications) && product.specifications.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-lg md:text-xl font-black text-black">{t('product.specifications') || 'Характеристики'}</h3>
                            <div className="flex flex-col border-t border-black/5">
                                {(product.specifications as {key: string, value: string}[]).map((spec, idx) => (
                                    <div key={idx} className={`grid grid-cols-2 py-3 px-4 ${idx % 2 === 0 ? 'bg-zinc-50' : 'bg-white'}`}>
                                        <div className="text-[11px] md:text-xs font-medium text-black/60 pr-4">{spec.key}</div>
                                        <div className="text-[11px] md:text-xs font-bold text-black">{spec.value}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="mt-8 border-t border-black/5 pt-6">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl md:text-3xl font-black text-black uppercase tracking-tighter">{t('product.related_context')}</h3>
                        </div>
                        <ProductSlider products={relatedProducts as any} lang={lang} />
                    </div>
                )}
            </div>

            <Footer />
        </main>
    );
}
