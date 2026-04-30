"use client";

import { useCartStore } from "@/lib/stores/cart.store";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import Link from "next/link";
import Image from "next/image";
import { Footer } from "@/components/Footer";
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { getLatestPrices } from "@/lib/actions/products.actions";
import { ConfirmModal } from "@/components/ConfirmModal";
import { CheckoutModal } from "@/components/CheckoutModal";

export default function CartPage() {
  const { t, language } = useLanguage();
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const clearCart = useCartStore((state) => state.clearCart);
  const syncItems = useCartStore((state) => state.syncItems);
  const [mounted, setMounted] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasSynced, setHasSynced] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || items.length === 0 || hasSynced) return;

    const syncCart = async () => {
      setIsSyncing(true);
      try {
        const baseIds = Array.from(new Set(items.map(item => item.baseId)));
        const latestData = await getLatestPrices(baseIds);
        if (latestData && latestData.length > 0) {
          syncItems(latestData);
          setHasSynced(true);
        }
      } catch (error) {
        console.error("Failed to sync cart prices:", error);
      } finally {
        setIsSyncing(false);
      }
    };

    syncCart();
  }, [mounted, items.length, hasSynced]);

  if (!mounted) return null;

  const totalPrice = items.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <main className="flex-1 flex flex-col min-h-screen justify-between bg-white pt-6 border-t border-black/[0.03]">
      <div className="mx-auto w-full max-w-[1500px] px-6 mb-8 md:mb-16">
        
        {/* Refined Responsive Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-black/[0.1] pb-6 mb-8 gap-6">
          <nav className="flex flex-wrap items-center gap-y-2 gap-x-3 text-[9px] uppercase tracking-[0.3em] font-black">
            <Link href="/" className="text-black/30 hover:text-black transition-colors">{t('common.home')}</Link>
            <span className="text-black/10">/</span>
            <span className="text-black">{t('cart.title')}</span>
          </nav>

          <div className="hidden sm:flex items-center justify-end gap-4 w-auto border-black/[0.05] pt-0">
            <span className="text-[10px] uppercase tracking-[0.5em] font-black text-black/20">ANVIBUD®</span>
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-black animate-pulse" />
              <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-black">{t('cart.library_cart')}</span>
            </div>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-8 text-center">
            <div className="text-[80px] md:text-[120px] leading-none opacity-5 font-black uppercase tracking-tighter select-none max-w-full overflow-hidden">{t('cart.title')}</div>
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
            {/* Items Column */}
            <div className="space-y-0">
              {/* Secondary Header */}
              <div className="flex items-end justify-between mb-8 pb-4 border-b border-black/[0.03]">
                <div className="flex items-baseline gap-3">
                  <h1 className="text-[11px] uppercase tracking-[0.4em] font-black text-black">{t('cart.title')}</h1>
                  <span className="text-[9px] font-bold text-black/20 tracking-widest">({items.length} {t('cart.items')})</span>
                </div>
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="text-[8px] uppercase tracking-[0.3em] font-bold text-black/20 hover:text-black transition-colors"
                >
                  {t('cart.clear_all')}
                </button>
              </div>

              <ConfirmModal
                isOpen={showClearConfirm}
                onClose={() => setShowClearConfirm(false)}
                onConfirm={clearCart}
                title={t('cart.clear_all')}
                message={t('cart.clear_confirm')}
              />

              {/* Grid Header (Desktop) */}
              <div className="hidden md:grid grid-cols-[1fr_120px_100px_80px] gap-8 pb-4 border-b border-black/[0.05] mb-4">
                <span className="text-[9px] uppercase tracking-[0.4em] font-black text-black/30">{t('cart.archive_selection')}</span>
                <span className="text-[9px] uppercase tracking-[0.4em] font-black text-black/30 text-center">{t('common.qty')}</span>
                <span className="text-[9px] uppercase tracking-[0.4em] font-black text-black/30 text-right">{t('common.price')}</span>
                <span />
              </div>

              {/* Item List */}
              <div className="space-y-6 md:space-y-0">
                {items.map((item) => (
                  <div key={item.id} className="flex flex-col md:grid md:grid-cols-[1fr_120px_100px_80px] gap-6 md:gap-8 p-5 md:p-0 md:py-8 items-center border border-black/[0.07] md:border-0 md:border-b md:border-black/[0.05] last:border-0">
                    {/* Product Info (Mobile & Desktop) */}
                    <div className="flex flex-col w-full md:contents gap-4">
                      <div className="flex items-start gap-4">
                        <div className="relative w-20 h-20 flex-shrink-0 bg-[#f9f9f9] overflow-hidden border border-black/[0.03]">
                          {item.image ? (
                            <Image src={item.image} alt={item.title} fill className="object-cover" sizes="80px" />
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

                      {/* Controls Row (Mobile Only) */}
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

                    {/* Quantity (Desktop) */}
                    <div className="hidden md:flex items-center justify-between border border-black/10 h-9">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-9 h-full flex items-center justify-center text-black/40 hover:text-black text-lg transition-colors"
                      >−</button>
                      <span className="w-8 text-center text-[11px] font-black text-black">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-9 h-full flex items-center justify-center text-black/40 hover:text-black text-lg transition-colors"
                      >+</button>
                    </div>

                    {/* Price (Desktop) */}
                    <div className="hidden md:block text-right">
                      <span className="text-[11px] font-black tracking-widest text-black">
                        ₴{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>

                    {/* Remove (Desktop) */}
                    <div className="hidden md:flex justify-end">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-[9px] uppercase tracking-[0.4em] font-black text-black/30 hover:text-black transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary Column */}
            <div className="h-fit border border-black/[0.08] p-8 space-y-8 sticky top-24">
              <h2 className="text-[11px] uppercase tracking-[0.5em] font-black border-b border-black/[0.08] pb-6 text-black">{t('cart.order_summary')}</h2>

              <div className="space-y-4">
                <div className="flex justify-between text-[10px] uppercase tracking-[0.2em] font-bold text-black/40">
                  <span>{t('cart.subtotal')} ({items.reduce((a, b) => a + b.quantity, 0)} {t('cart.items')})</span>
                  <span>₴{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[10px] uppercase tracking-[0.2em] font-bold text-black/40">
                  <span>{t('cart.shipping')}</span>
                  <span className="text-green-600 uppercase font-black tracking-widest">{t('cart.free')}</span>
                </div>
                {totalPrice < 200 && (
                  <div className="bg-zinc-50 p-4 border-l-2 border-black/10">
                    <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-black/40 leading-relaxed">
                      {t('cart.shipping_promo').replace('${amount}', (200 - totalPrice).toFixed(2))}
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-8 border-t border-black pb-4">
                <div className="flex justify-between items-end mb-8">
                  <span className="text-[11px] uppercase tracking-[0.5em] font-black text-black">{t('cart.total')}</span>
                  <span className="text-2xl font-black tracking-tighter text-black leading-none">₴{totalPrice.toFixed(2)}</span>
                </div>
                <button 
                  onClick={() => setIsCheckoutOpen(true)}
                  className="w-full bg-black text-white py-4 text-[10px] uppercase tracking-[0.5em] font-black hover:bg-black/90 transition-all flex items-center justify-center gap-3 group"
                >
                  {t('cart.checkout')}
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="flex items-center gap-4 opacity-20">
                <div className="h-px flex-1 bg-black" />
                <ShoppingBag size={14} />
                <div className="h-px flex-1 bg-black" />
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />

      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
      />
    </main>
  );
}
