"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type WishlistProduct = {
    id: string;
    title: string;
    price: number;
    image?: string;
    hoverImage?: string;
    allImages?: string[];
    slug: string;
    sizes?: string[];
    selectedSize?: string | null;
    sizeVariants?: { size: string, price: string, salePrice?: string, stock?: string }[];
    baseSize?: string;
    label?: 'BESTSELLER' | 'NEW' | 'SALE' | null;
    discountAmount?: number;
    salePrice?: number;
    specifications?: { key: string, value: string }[];
};

type WishlistStore = {
    items: WishlistProduct[];
    addToWishlist: (product: WishlistProduct) => void;
    removeFromWishlist: (productId: string) => void;
    isWishlisted: (productId: string) => boolean;
    clearWishlist: () => void;
    syncItems: (latestData: any[]) => void;
};

export const useWishlistStore = create<WishlistStore>()(
    persist(
        (set, get) => ({
            items: [],
            addToWishlist: (product) => {
                set((state) => {
                    const exists = state.items.find((item) => item.id === product.id);
                    if (exists) return state;
                    return { items: [...state.items, product] };
                });
            },
            removeFromWishlist: (productId) => {
                set((state) => ({
                    items: state.items.filter((item) => item.id !== productId),
                }));
            },
            isWishlisted: (productId) => {
                return get().items.some((item) => item.id === productId);
            },
            clearWishlist: () => {
                set({ items: [] });
            },
            syncItems: (latestData) => {
                set((state) => ({
                    items: state.items.map((item) => {
                        const latest = latestData.find(d => d.id === item.id);
                        if (!latest) return item;
                        return {
                            ...item,
                            price: latest.price,
                            discountAmount: latest.discountAmount,
                            sizeVariants: latest.sizeVariants,
                            specifications: latest.specifications,
                        };
                    })
                }));
            },
        }),
        {
            name: "migra-wishlist",
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                items: state.items,
            }),
        },
    ),
);
