import Link from "next/link";

export const metadata = {
    title: "MIGRA_ADMIN // SYSTEM_DASHBOARD",
};

export default function AdminDashboardPage() {
    return (
        <div className="max-w-6xl mx-auto py-8 md:py-12 px-4 md:px-6">
            {/* System Header Ledger */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 md:mb-20 gap-6 md:gap-8">
                <div className="space-y-3 md:space-y-4">
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-1 h-6 md:w-1.5 md:h-8 bg-black dark:bg-white" />
                        <h1 className="text-3xl md:text-6xl font-black uppercase tracking-tighter text-black dark:text-white leading-[0.8] break-words">
                            Central_Command
                        </h1>
                    </div>
                    <div className="flex flex-col space-y-1">
                        <p className="text-[10px] uppercase font-black tracking-[0.3em] text-black/40 dark:text-white/40">
                            OPERATOR: ARSEN_BOGAK // SESSION_ID: {Math.random().toString(36).substring(7).toUpperCase()}
                        </p>
                        <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-black/20 dark:text-white/20 font-mono">
                            CORE_SYNC: ACTIVE // LATENCY: 24MS // UPTIME: 99.9%
                        </p>
                    </div>
                </div>

                <div className="text-right hidden md:block">
                    <span className="text-[8px] font-mono uppercase text-black/40 dark:text-white/40 block">LOCAL_TIMESTAMP</span>
                    <span className="text-[12px] font-black font-mono text-black dark:text-white uppercase tracking-widest">
                        {new Date().toISOString().slice(0, 19).replace('T', ' ')}
                    </span>
                </div>
            </div>

            {/* Dashboard Architecture Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
                {/* Products Module */}
                <Link
                    href="/admin/products"
                    className="group relative border border-black dark:border-white p-8 bg-white dark:bg-black hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all overflow-hidden"
                >
                    <div className="absolute top-4 right-4 text-[9px] font-mono font-black opacity-20 group-hover:opacity-100 transition-opacity">
                        [01]
                    </div>
                    <div className="space-y-10 relative z-10">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-black uppercase tracking-tight">Inventory</h2>
                            <p className="text-[9px] uppercase tracking-widest leading-relaxed opacity-60">
                                Product Registry Management // Price Sync // Stock Verification Protocol
                            </p>
                        </div>
                        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em]">
                            <span>ACCESS_REGISTRY</span>
                            <svg className="w-4 h-4 transition-transform group-hover:translate-x-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </div>
                    </div>
                </Link>

                {/* Categories Module */}
                <Link
                    href="/admin/categories"
                    className="group relative border border-black dark:border-white p-8 bg-white dark:bg-black hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all overflow-hidden"
                >
                    <div className="absolute top-4 right-4 text-[9px] font-mono font-black opacity-20 group-hover:opacity-100 transition-opacity">
                        [02]
                    </div>
                    <div className="space-y-10 relative z-10">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-black uppercase tracking-tight">Catalogs</h2>
                            <p className="text-[9px] uppercase tracking-widest leading-relaxed opacity-60">
                                Node Structure Mapping // Sub-Entity Logic // Global Taxonomy Override
                            </p>
                        </div>
                        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em]">
                            <span>MAPPING_UI</span>
                            <svg className="w-4 h-4 transition-transform group-hover:translate-x-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </div>
                    </div>
                </Link>

                {/* Orders Module */}
                <Link
                    href="/admin/orders"
                    className="group relative border border-black dark:border-white p-8 bg-white dark:bg-black hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all overflow-hidden"
                >
                    <div className="absolute top-4 right-4 text-[9px] font-mono font-black opacity-20 group-hover:opacity-100 transition-opacity">
                        [03]
                    </div>
                    <div className="space-y-10 relative z-10">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-black uppercase tracking-tight">Orders</h2>
                            <p className="text-[9px] uppercase tracking-widest leading-relaxed opacity-60">
                                Transactional Ledger // Logistic Routing // Fulfillment Queue Terminal
                            </p>
                        </div>
                        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em]">
                            <span>ACCESS_LEDGER</span>
                            <svg className="w-4 h-4 transition-transform group-hover:translate-x-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Quick-Inject Shortcuts Section */}
            <div className="mt-12 md:mt-20">
                <div className="flex items-center gap-4 mb-4 opacity-20">
                    <span className="text-[8px] font-black uppercase tracking-[0.4em] whitespace-nowrap">QUICK_SHORTCUTS</span>
                    <div className="h-px w-full bg-black dark:bg-white" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-1 md:gap-4">
                    <Link
                        href="/admin/products/create"
                        className="flex items-center justify-between p-6 md:p-10 border border-black dark:border-white bg-black dark:bg-white text-white dark:text-black hover:bg-transparent hover:text-black dark:hover:bg-transparent dark:hover:text-white transition-all group"
                    >
                        <div className="space-y-1">
                            <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.4em] block opacity-40 group-hover:opacity-100 transition-opacity">Protocol_049</span>
                            <h3 className="text-lg md:text-xl font-black uppercase tracking-widest">Inject_Product</h3>
                        </div>
                        <span className="text-xl md:text-2xl font-light opacity-30 group-hover:opacity-100 group-hover:rotate-90 transition-all">+</span>
                    </Link>

                    <Link
                        href="/admin/categories/create"
                        className="flex items-center justify-between p-6 md:p-10 border border-black dark:border-white bg-white dark:bg-black text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all group"
                    >
                        <div className="space-y-1">
                            <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.4em] block opacity-40 group-hover:opacity-100 transition-opacity">Protocol_051</span>
                            <h3 className="text-lg md:text-xl font-black uppercase tracking-widest">Define_Catalog</h3>
                        </div>
                        <span className="text-xl md:text-2xl font-light opacity-30 group-hover:opacity-100 group-hover:rotate-90 transition-all">+</span>
                    </Link>
                </div>
            </div>

            {/* System Status Footer */}
            <div className="mt-20 pt-10 border-t border-black/10 dark:border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[8px] font-black uppercase tracking-[0.3em] opacity-40">System_Status: Optimal</span>
                    </div>
                    <div className="w-px h-4 bg-black/10 dark:bg-white/10" />
                    <span className="text-[8px] font-black uppercase tracking-[0.3em] opacity-40">Encryption: SHA-256</span>
                </div>
                <div className="text-[8px] font-mono font-bold uppercase opacity-20 tracking-widest">
                    MIGRA_ADMN_V4.PRODUCTION // STABLE_RELEASE
                </div>
            </div>
        </div>
    );
}
