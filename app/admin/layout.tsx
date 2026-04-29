"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        document.body.classList.add("is-admin");
        return () => document.body.classList.remove("is-admin");
    }, []);

    const menuItems = [
        {
            name: "Dashboard", href: "/admin", icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a2 2 0 002 2h3a2 2 0 002-2v-4a1 1 0 011-1h2a1 1 0 011 1v4a2 2 0 002 2h3a2 2 0 002-2V10M9 21h6" />
                </svg>
            )
        },
        {
            name: "Products", href: "/admin/products", icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
            )
        },
        {
            name: "Categories", href: "/admin/categories", icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
            )
        },
        {
            name: "Orders", href: "/admin/orders", icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
            )
        },
        {
            name: "Config", href: "/admin/settings", icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            )
        },
    ];

    return (
        <div className="min-h-screen bg-[#f1f1f1] dark:bg-[#0a0a0a] flex text-black dark:text-white transition-colors duration-300">
            {/* Sidebar Desktop */}
            <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 z-50 bg-white dark:bg-black border-r border-black dark:border-zinc-800 p-8">
                <div className="mb-16 flex items-center gap-3">
                    <div className="w-8 h-8 bg-black dark:bg-white rounded-none flex items-center justify-center">
                        <span className="text-white dark:text-black font-black text-[10px]">M</span>
                    </div>
                    <span className="font-black tracking-tighter uppercase text-xl">Admin_Sys</span>
                </div>

                <nav className="flex-1 space-y-3">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-4 px-4 py-3 rounded-none text-[10px] uppercase tracking-[0.2em] font-black transition-all border ${isActive
                                    ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white shadow-[4px_4px_0_rgba(0,0,0,0.1)] dark:shadow-none"
                                    : "text-zinc-400 border-transparent hover:border-black/10 dark:hover:border-white/10"
                                    }`}
                            >
                                {item.icon}
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="pt-8 border-t border-black/10 dark:border-white/10">
                    <Link
                        href="/"
                        className="flex items-center gap-4 px-4 py-3 rounded-none text-[10px] uppercase tracking-[0.2em] font-black text-zinc-400 hover:text-black dark:hover:text-white transition-all group"
                    >
                        <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Main_Portal
                    </Link>
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm lg:hidden transition-opacity"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-[70] w-72 bg-white dark:bg-black border-r border-black dark:border-zinc-800 p-8 transform transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] lg:hidden ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                }`}>
                <div className="flex justify-between items-center mb-12">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-black dark:bg-white rounded-none flex items-center justify-center">
                            <span className="text-white dark:text-black font-black text-[10px]">M</span>
                        </div>
                        <span className="font-black tracking-tighter uppercase text-xl">Admin</span>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="text-black dark:text-white">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <nav className="flex-1 space-y-3">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center gap-4 px-4 py-3 rounded-none text-[10px] uppercase tracking-[0.2em] font-black transition-all border ${isActive
                                    ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                                    : "text-zinc-400 border-transparent"
                                    }`}
                            >
                                {item.icon}
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 inset-x-0 z-50 bg-white dark:bg-black border-b border-black dark:border-zinc-800 px-6 py-4 flex items-center justify-between">
                <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="p-2 -ml-2 text-black dark:text-white"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                <span className="font-black tracking-tighter uppercase text-lg">Admin_Terminal</span>
                <Link
                    href="/"
                    className="text-[10px] font-black uppercase tracking-widest text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors"
                >
                    __Exit
                </Link>
            </header>

            {/* Main Content */}
            <main className="flex-1 w-full min-w-0 lg:pl-64 pt-20 lg:pt-0 min-h-screen">
                {children}
            </main>
        </div>
    );
}
