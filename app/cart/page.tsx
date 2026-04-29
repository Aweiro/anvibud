"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useCartStore, calculateCartTotal } from "@/lib/stores/cart.store";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Footer } from "@/components/Footer";
import { CheckoutModal } from "@/components/CheckoutModal";

export default function CartPage() {
  const { t } = useLanguage();
  const items = useCartStore((state) => state.items);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);
  const totalPrice = calculateCartTotal(items);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <main className="flex-1 flex flex-col min-h-screen justify-between bg-white pt-6 border-t border-black/[0.03]">
        <div className="mx-auto w-full max-w-[1500px] px-6 mb-16">
          <div className="h-10 border-b border-black/[0.1] mb-12 animate-pulse bg-zinc-50" />
          <div className="space-y-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-8 animate-pulse border-b border-black/5 pb-8">
                <div className="w-20 h-20 bg-zinc-100" />
                <div className="flex-1 space-y-4">
                  <div className="h-4 bg-zinc-100 w-1/3" />
                  <div className="h-3 bg-zinc-50 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col min-h-screen justify-between bg-white pt-6 border-t border-black/[0.03]">
      <div className="mx-auto w-full max-w-[1500px] px-6 mb-8 md:mb-16">
        <div className="flex items-center justify-between border-b border-black/[0.1] pb-6 mb-6 md:mb-12">
          <div className="flex items-center gap-6">
            <nav className="flex flex-wrap items-center gap-2 text-[9px] uppercase tracking-[0.3em] font-black text-black/30">
              <Link href="/" className="hover:text-black transition-colors">{t('common.home')}</Link>
              <span>/</span>
              <span className="text-black">{t('cart.title')}</span>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] uppercase tracking-[0.5em] font-black text-black/20">ANVIBUD®</span>
            <div className="w-12 h-[1px] bg-black/10 hidden sm:block" />
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-black" />
              <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-black">{t('cart.library_cart')}</span>
            </div>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-8 text-center">
            <div className="text-[80px] md:text-[120px] leading-none opacity-5 font-black uppercase tracking-tighter select-none max-w-full overflow-hidden text-center">{t('cart.empty')}</div>
            <div className="space-y-3">
              <h1 className="text-2xl font-black uppercase tracking-tighter text-black">{t('cart.empty_title')}</h1>
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-black/30">{t('cart.empty_desc')}</p>
            </div>
            <Link
              href="/"
              className="mt-4 bg-black text-white px-8 py-3 text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-black/90 transition-colors"
            >
              {t('wishlist.explore_archive')}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12">
            {/* Items */}
            <div className="space-y-0">
              <div className="flex items-center justify-between md:grid md:grid-cols-[1fr_120px_100px_80px] md:gap-8 pb-4 border-b border-black/[0.1] mb-6 md:mb-0">
                <span className="text-[10px] md:text-[9px] uppercase tracking-[0.4em] font-black text-black md:text-black/30">{t('cart.archive_selection')}</span>
                <span className="hidden md:block text-[9px] uppercase tracking-[0.4em] font-black text-black/30 text-center">{t('common.qty')}</span>
                <span className="hidden md:block text-[9px] uppercase tracking-[0.4em] font-black text-black/30 text-right">{t('common.price')}</span>
                <div className="flex justify-end">
                  <button
                    onClick={clearCart}
                    className="text-[9px] uppercase tracking-[0.3em] font-bold text-black/30 hover:text-black transition-colors border-b border-black/10 hover:border-black pb-0.5"
                  >
                    {t('cart.clear')}
                  </button>
                </div>
              </div>
              {items.map((item, i) => (
                <div key={item.id} className={`flex flex-col md:grid md:grid-cols-[1fr_120px_100px_80px] gap-6 md:gap-8 p-5 mb-6 md:p-0 md:mb-0 md:py-8 items-center border border-black/[0.07] md:border-0 md:border-b md:border-black/[0.05] last:mb-0 md:last:border-0`}>                  {/* TOP: Product info + Quantity (Mobile) */}
                  <div className="flex flex-col w-full md:contents gap-4">
                    <div className="flex items-start gap-4">
                      <div className="relative w-20 h-20 md:w-20 md:h-20 flex-shrink-0 bg-[#f9f9f9] overflow-hidden border border-black/[0.03]">
                        {item.image ? (
                          <Image src={item.image} alt={item.title} fill className="object-cover" sizes="(max-width: 768px) 80px, 80px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[8px] uppercase tracking-widest text-black/20 font-bold">{t('cart.no_image')}</div>
                        )}
                      </div>
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <h2 className="text-[10px] md:text-[11px] uppercase tracking-[0.15em] font-black text-black leading-snug break-words">
                          {item.title}
                        </h2>
                        {item.size && (
                          <span className="inline-block text-[8px] uppercase font-bold text-black/40 border border-black/5 px-1.5 py-0.5">
                            {item.size}
                          </span>
                        )}
                        <p className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-bold text-black/30">₴{item.price.toFixed(2)}</p>
                      </div>
                    </div>

                    {/* Controls Row for Mobile */}
                    <div className="flex items-center justify-between pt-4 border-t border-black/[0.03] md:hidden">
                      <div className="flex items-center border border-black/10 h-8">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-full flex items-center justify-center text-black/40 hover:text-black text-base"
                        >−</button>
                        <span className="w-8 text-center text-[10px] font-black text-black">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-full flex items-center justify-center text-black/40 hover:text-black text-base"
                        >+</button>
                      </div>
                      
                      <div className="text-right">
                        <span className="block text-[8px] uppercase tracking-[0.2em] font-bold text-black/20 mb-0.5">Total</span>
                        <span className="text-[11px] font-black tracking-widest text-black">
                          ₴{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="md:hidden text-[9px] uppercase tracking-[0.4em] font-black text-black/30 hover:text-black transition-colors self-start"
                    >
                      {t('common.remove')}
                    </button>
                  </div>

                  {/* Quantity (Desktop Only) */}
                  <div className="hidden md:flex items-center justify-between border border-black/10">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-9 h-9 flex items-center justify-center text-black/40 hover:text-black text-lg transition-colors"
                    >−</button>
                    <span className="w-8 text-center text-[11px] font-black text-black">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-9 h-9 flex items-center justify-center text-black/40 hover:text-black text-lg transition-colors"
                    >+</button>
                  </div>

                  {/* BOTTOM/GRID: Price and Remove (Desktop) */}
                  <div className="hidden md:flex flex-col md:text-right">
                    <span className="text-[11px] font-black tracking-widest text-black">
                      ₴{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="hidden md:block text-[9px] uppercase tracking-[0.4em] font-black text-black/30 hover:text-black transition-colors md:text-left"
                  >
                    {t('common.remove')}
                  </button>
                </div>
              ))}

            </div>

            {/* Summary */}
            <div className="h-fit border border-black/[0.08] p-8 space-y-8 sticky top-24">
              <h2 className="text-[11px] uppercase tracking-[0.5em] font-black border-b border-black/[0.08] pb-6 text-black">{t('cart.order_summary')}</h2>

              <div className="space-y-4">
                <div className="flex justify-between text-[10px] uppercase tracking-[0.2em] font-bold text-black/40">
                  <span>{t('cart.subtotal')} ({items.reduce((a, b) => a + b.quantity, 0)} {t('cart.items')})</span>
                  <span>₴{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[10px] uppercase tracking-[0.2em] font-bold text-black/40">
                  <span>{t('cart.shipping')}</span>
                  <span>{totalPrice >= 200 ? t('cart.complimentary') : t('cart.calculated_at_checkout')}</span>
                </div>
                <div className="border-t border-black/[0.06] pt-4 flex justify-between">
                  <span className="text-[11px] uppercase tracking-[0.3em] font-black text-black">{t('common.total')}</span>
                  <span className="text-[13px] font-black tracking-widest text-black">₴{totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setIsCheckoutOpen(true)}
                  className="block w-full bg-black text-white text-center py-4 text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-black/90 transition-colors"
                >
                  {t('cart.proceed_to_checkout')}
                </button>
                <Link
                  href="/"
                  className="block w-full border border-black/10 text-center py-3 text-[10px] uppercase tracking-[0.4em] font-bold text-black hover:border-black transition-colors"
                >
                  {t('cart.continue_shopping')}
                </Link>
              </div>

              {totalPrice < 200 && (
                <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-black/30 text-center">
                  {t('cart.shipping_promo').replace('${amount}', (200 - totalPrice).toFixed(2))}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
      <Footer />
    </main>
  );
}
