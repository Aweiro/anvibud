import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ProductStatusToggle from "./ProductStatusToggle";

interface PageProps {
    searchParams: Promise<{ categoryId?: string }>;
}

export default async function AdminProductsPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const categoryId = params.categoryId;

    const [products, categories] = await Promise.all([
        prisma.product.findMany({
            where: categoryId ? { subcategory: { categoryId } } : {},
            include: {
                subcategory: {
                    include: {
                        category: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        }),
        prisma.category.findMany(),
    ]);

    return (
        <div className="min-h-screen bg-[#f8f8f8] dark:bg-[#080808] py-8 md:py-12 px-4 md:px-10">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-16 gap-6 md:gap-8">
                    <div className="space-y-3 md:space-y-4 w-full">
                        <div className="flex items-center gap-3 md:gap-4">
                            <div className="w-1 h-6 md:h-8 bg-black dark:bg-white flex-shrink-0" />
                            <h1 className="text-xl sm:text-2xl md:text-5xl font-black uppercase tracking-tighter text-black dark:text-white leading-none break-words">
                                Inventory_Registry
                            </h1>
                        </div>
                        <p className="text-[8px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.4em] font-bold text-black/40 dark:text-white/40 leading-relaxed max-w-full">
                            System Control // Database Management // v4.2.0
                        </p>
                    </div>

                    <Link
                        href="/admin/products/create"
                        className="w-full md:w-auto px-6 md:px-10 py-4 md:py-5 bg-black dark:bg-white text-white dark:text-black text-[9px] md:text-[10px] uppercase tracking-[0.3em] font-black transition-all hover:bg-zinc-800 dark:hover:bg-zinc-200 flex items-center justify-center gap-4 md:gap-6 group border border-black dark:border-white shadow-[8px_8px_0_rgba(0,0,0,0.05)] md:shadow-none whitespace-nowrap"
                    >
                        <span>[+] Create_Entry</span>
                        <svg className="w-3 h-3 md:w-4 md:h-4 transition-transform group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </Link>
                </div>

                {/* Filter Navigation */}
                <div className="mb-8 md:mb-12 flex gap-1 overflow-x-auto no-scrollbar py-2 border-b border-black/5 dark:border-white/5">
                    <Link
                        href="/admin/products"
                        className={`px-4 md:px-6 py-3 text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-black transition-all border whitespace-nowrap ${!categoryId
                            ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                            : "bg-transparent border-transparent text-black/30 dark:text-white/30 hover:text-black dark:hover:text-white"
                            }`}
                    >
                        Index_All
                    </Link>
                    {categories.map((cat) => (
                        <Link
                            key={cat.id}
                            href={`/admin/products?categoryId=${cat.id}`}
                            className={`px-4 md:px-6 py-3 text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-black transition-all border whitespace-nowrap ${categoryId === cat.id
                                ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                                : "bg-transparent border-transparent text-black/30 dark:text-white/30 hover:text-black dark:hover:text-white"
                                }`}
                        >
                            {cat.name.toUpperCase()}
                        </Link>
                    ))}
                </div>

                {/* Table / Ledger */}
                <div className="bg-white dark:bg-zinc-950 border border-black/10 dark:border-white/10 overflow-hidden shadow-[12px_12px_0_rgba(0,0,0,0.02)] md:shadow-none">
                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto no-scrollbar">
                        <table className="w-full text-left border-collapse table-auto">
                            <thead>
                                <tr className="bg-black/5 dark:bg-white/5 border-b border-black/10 dark:border-white/10 text-[9px] uppercase tracking-[0.3em] font-black text-black/50 dark:text-white/50">
                                    <th className="px-6 py-6 text-left whitespace-nowrap">ID_Code / Specification</th>
                                    <th className="px-6 py-6 text-left whitespace-nowrap">Classification</th>
                                    <th className="px-6 py-6 text-left whitespace-nowrap">Market_Value</th>
                                    <th className="px-6 py-6 text-left whitespace-nowrap">Inventory</th>
                                    <th className="px-6 py-6 text-right whitespace-nowrap">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-black/5 dark:divide-white/5">
                                {products.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-24 text-center text-[10px] uppercase tracking-[0.5em] font-bold text-black/20 dark:text-white/20">
                                            NO_DATA_RETRIEVED
                                        </td>
                                    </tr>
                                )}
                                {products.map((product) => (
                                    <tr
                                        key={product.id}
                                        className="group hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors"
                                    >
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 p-1 flex-shrink-0 group-hover:scale-105 transition-transform duration-500 overflow-hidden">
                                                    {product.images?.[0] ? (
                                                        <img
                                                            src={product.images[0]}
                                                            className="w-full h-full object-cover grayscale brightness-95 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-700"
                                                            alt={product.name}
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-[8px] font-black uppercase text-black/10 dark:text-white/10">
                                                            N/A
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="text-[11px] font-black uppercase tracking-widest text-black dark:text-white truncate max-w-[200px]">
                                                        {product.name}
                                                    </div>
                                                    <div className="text-[8px] text-black/30 dark:text-white/30 font-mono tracking-tighter">
                                                        ID: {product.id.slice(0, 8).toUpperCase()}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <span className="text-[8px] uppercase tracking-[0.2em] font-black px-2 py-1 bg-black/5 dark:bg-white/5 text-black/60 dark:text-white/60 whitespace-nowrap">
                                                {product.subcategory?.category?.name} // {product.subcategory?.name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="text-[11px] font-black tracking-widest text-black dark:text-white">
                                                {(Number(product.price) - Number(product.discountAmount)).toFixed(2)} ₴
                                                {Number(product.discountAmount) > 0 && (
                                                    <span className="ml-2 text-[9px] text-black/20 dark:text-white/20 line-through tracking-normal font-normal">
                                                        {Number(product.price).toFixed(2)} ₴
                                                    </span>
                                                )}
                                            </div>
                                            {(product as any).label && (
                                                <div className="text-[8px] text-orange-500 dark:text-orange-400 mt-1 font-black uppercase tracking-widest">
                                                    [{(product as any).label.toUpperCase()}]
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex flex-col gap-1.5 min-w-[120px]">
                                                {/* Base product stock */}
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-0.5 h-3 ${product.stock > 10 ? "bg-black dark:bg-white" : "bg-red-500"}`} />
                                                    <span className={`text-[9px] uppercase font-black tracking-widest ${product.stock > 0 ? "text-black dark:text-white" : "text-red-500"}`}>
                                                        {product.baseSize ? `${product.baseSize}: ` : ""}{product.stock}U
                                                    </span>
                                                </div>
                                                {/* Variants stocks */}
                                                {(product.sizeVariants as any[])?.map((v, i) => (
                                                    <div key={i} className="flex items-center gap-2 opacity-60">
                                                        <div className={`w-0.5 h-2 ${Number(v.stock) > 5 ? "bg-black/40 dark:bg-white/40" : "bg-red-400"}`} />
                                                        <span className={`text-[8px] uppercase font-bold tracking-widest ${Number(v.stock) > 0 ? "text-black/60 dark:text-white/60" : "text-red-400"}`}>
                                                            {v.size}: {v.stock || 0}U
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <ProductStatusToggle
                                                    productId={product.id}
                                                    initialStatus={(product as any).isActive}
                                                />
                                                <Link
                                                    href={`/admin/products/${product.id}/edit`}
                                                    className="inline-block px-4 py-2 border border-black dark:border-white text-[9px] uppercase tracking-[0.2em] font-black hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
                                                >
                                                    MODIFY
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card Layout */}
                    <div className="md:hidden divide-y divide-black/10 dark:divide-white/10">
                        {products.map((product) => (
                            <div key={product.id} className="p-6 space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-20 h-20 bg-white dark:bg-zinc-900 border border-black/5 p-1 flex-shrink-0 overflow-hidden">
                                        {product.images?.[0] ? (
                                            <img src={product.images[0]} className="w-full h-full object-cover grayscale" alt="" />
                                        ) : (
                                            <div className="w-full h-full bg-zinc-100 dark:bg-zinc-800" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <div className="text-[13px] font-black uppercase tracking-tight text-black dark:text-white truncate">
                                                {product.name}
                                            </div>
                                            {(product as any).label && (
                                                <span className="text-[7px] text-orange-500 dark:text-orange-400 font-black uppercase tracking-widest">
                                                    [{(product as any).label}]
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-[9px] text-black/40 dark:text-white/40 uppercase tracking-widest font-bold">
                                            {product.subcategory?.category?.name}
                                        </div>
                                        <div className="flex flex-col gap-2 mt-4">
                                            <ProductStatusToggle
                                                productId={product.id}
                                                initialStatus={(product as any).isActive}
                                            />
                                            <Link
                                                href={`/admin/products/${product.id}/edit`}
                                                className="w-full px-6 py-2 border border-black dark:border-white text-[9px] text-center uppercase font-black hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
                                            >
                                                MODIFY_RECORD
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 pt-4 border-t border-black/5 gap-4">
                                    <div className="space-y-1">
                                        <span className="text-[8px] uppercase font-black text-black/30 dark:text-white/30 tracking-widest">Market Value</span>
                                        <div className="text-[11px] font-black text-black dark:text-white tracking-widest">
                                            {(Number(product.price) - Number(product.discountAmount)).toFixed(2)} ₴
                                            {Number(product.discountAmount) > 0 && (
                                                <span className="ml-2 text-[8px] text-black/20 dark:text-white/20 line-through tracking-normal font-normal">
                                                    {Number(product.price).toFixed(2)} ₴
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <span className="text-[8px] uppercase font-black text-black/30 dark:text-white/30 tracking-widest">Inventory</span>
                                        <div className="space-y-1">
                                            <div className={`text-[11px] font-black tracking-widest ${product.stock > 0 ? "text-black dark:text-white" : "text-red-500"}`}>
                                                {product.baseSize ? `${product.baseSize}: ` : ""}{product.stock}U
                                            </div>
                                            {(product.sizeVariants as any[])?.map((v, i) => (
                                                <div key={i} className={`text-[9px] font-bold tracking-widest opacity-60 ${Number(v.stock) > 0 ? "text-black/60 dark:text-white/60" : "text-red-400"}`}>
                                                    {v.size}: {v.stock || 0}U
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
