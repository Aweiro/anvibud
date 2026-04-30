"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type CartProduct = {
  id: string; // Unique key for cart (baseId-size)
  baseId: string; // Database ID
  size?: string;
  title: string;
  price: number;
  image?: string;
};

export type CartItem = CartProduct & {
  quantity: number;
};

type CartStore = {
  items: CartItem[];
  addToCart: (product: CartProduct, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  syncItems: (latestData: any[]) => void;
};

export const calculateCartTotal = (items: CartItem[]) =>
  items.reduce((total, item) => total + item.price * item.quantity, 0);

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addToCart: (product, quantity = 1) => {
        if (quantity <= 0) {
          return;
        }

        set((state) => {
          const existingItem = state.items.find((item) => item.id === product.id);

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item,
              ),
            };
          }

          return {
            items: [...state.items, { ...product, quantity }],
          };
        });
      },
      removeFromCart: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        }));
      },
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.id === productId ? { ...item, quantity } : item,
          ),
        }));
      },
      clearCart: () => {
        set({ items: [] });
      },
      getTotalPrice: () => calculateCartTotal(get().items),
      syncItems: (latestData) => {
        set((state) => ({
          items: state.items.map((item) => {
            const productId = item.baseId || item.id.split('-')[0];
            const latest = latestData.find((d) => d.id === productId);
            if (!latest) return item;

            const baseRegularPrice = Number(latest.price);
            const baseDiscountAmount = Number(latest.discountAmount || 0);
            let newPrice = baseRegularPrice - baseDiscountAmount;

            // Handle variants
            if (item.size && latest.sizeVariants) {
              const variants = latest.sizeVariants as any[];
              const variant = variants.find((v: any) => v.size === item.size);
              if (variant) {
                const vPrice = Number(variant.price);
                if (variant.salePrice) {
                  newPrice = Number(variant.salePrice);
                } else if (baseDiscountAmount > 0) {
                  // Apply same discount amount if variant doesn't have its own
                  newPrice = vPrice - baseDiscountAmount;
                } else {
                  newPrice = vPrice;
                }
              }
            }

            return {
              ...item,
              price: newPrice,
            };
          }),
        }));
      },
    }),
    {
      name: "migra-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
      }),
    },
  ),
);
