"use client";

import { FormEvent, useState } from "react";
import { useCartStore, calculateCartTotal } from "@/lib/stores/cart.store";
import { checkoutSchema } from "@/lib/validations/checkout";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { getSiteSettings } from "@/app/admin/settings/actions";
import { useEffect } from "react";

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
    const { t } = useLanguage();
    const items = useCartStore((state) => state.items);
    const clearCart = useCartStore((state) => state.clearCart);
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [shippingThreshold, setShippingThreshold] = useState(200);
    const [shippingCostValue, setShippingCostValue] = useState(0);

    useEffect(() => {
        async function load() {
            const settings = await getSiteSettings();
            if (settings) {
                setShippingThreshold(Number(settings.freeShippingThreshold) || 200);
                setShippingCostValue(Number(settings.shippingCost) || 0);
            }
        }
        load();
    }, []);

    const subtotal = calculateCartTotal(items);
    const shippingCost = subtotal >= shippingThreshold ? 0 : shippingCostValue;
    const finalTotal = subtotal + shippingCost;

    if (!isOpen) return null;

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");

        const payload = {
            name,
            phone,
            items: items.map((item) => ({
                productId: item.baseId,
                size: item.size,
                price: item.price,
                quantity: item.quantity,
            })),
            shippingCost: shippingCost,
            subtotal: subtotal,
            total: finalTotal,
        };

        const result = checkoutSchema.safeParse(payload);

        if (!result.success) {
            const firstError = t('checkout.error_details');
            setError(firstError);
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(result.data),
            });

            if (!response.ok) {
                setError(t('checkout.error_generic'));
                return;
            }

            setIsSuccess(true);
            setTimeout(() => {
                clearCart();
                onClose();
                // We could redirect to a success page or just close and let cart show empty
            }, 3000);
        } catch {
            setError(t('checkout.error_connection'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-500"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-lg bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-black/20 hover:text-black transition-colors"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                </button>

                <div className="p-12">
                    {isSuccess ? (
                        <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
                            <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center animate-bounce">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M20 6L9 17L4 12" />
                                </svg>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black uppercase tracking-tighter">{t('checkout.order_received')}</h3>
                                <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-black/30">{t('checkout.success_desc')}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-10">
                            {/* Header */}
                            <div className="space-y-2">
                                <span className="text-[9px] uppercase tracking-[0.5em] font-black text-black/20">{t('checkout.finalize_order')}</span>
                                <h2 className="text-3xl font-black uppercase tracking-tighter leading-none">{t('checkout.checkout')}</h2>
                            </div>

                            {/* Order Recap */}
                            <div className="border-y border-black/5 py-6 space-y-4">
                                <div className="flex justify-between items-center text-[10px] uppercase tracking-[0.2em] font-bold text-black/40">
                                    <span>{t('cart.subtotal')}</span>
                                    <span>{subtotal.toFixed(2)} ₴</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] uppercase tracking-[0.2em] font-bold text-black/40">
                                    <span>{t('cart.shipping')}</span>
                                    <span className={shippingCost === 0 ? "text-green-600" : "text-black"}>
                                        {shippingCost === 0 ? t('cart.free') : `${shippingCost.toFixed(2)} ₴`}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-[11px] uppercase tracking-[0.3em] font-black text-black pt-4 border-t border-black/5">
                                    <span>{t('cart.total')}</span>
                                    <span>{finalTotal.toFixed(2)} ₴</span>
                                </div>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] uppercase tracking-[0.3em] font-black text-black/40 ml-1">{t('checkout.full_name')}</label>
                                        <input
                                            required
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder={t('checkout.name_placeholder')}
                                            className="w-full bg-black/[0.03] border-none px-4 py-4 text-[11px] uppercase tracking-[0.2em] font-bold placeholder:text-black/10 focus:ring-1 ring-black outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] uppercase tracking-[0.3em] font-black text-black/40 ml-1">{t('checkout.phone_number')}</label>
                                        <input
                                            required
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="+380 00 000 00 00"
                                            className="w-full bg-black/[0.03] border-none px-4 py-4 text-[11px] uppercase tracking-[0.2em] font-bold placeholder:text-black/10 focus:ring-1 ring-black outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <p className="text-red-500 text-[10px] uppercase tracking-wider font-bold text-center">{error}</p>
                                )}

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-black text-white py-5 text-[10px] uppercase tracking-[0.4em] font-black hover:bg-black/90 active:scale-[0.98] transition-all disabled:opacity-50"
                                >
                                    {isSubmitting ? t('checkout.processing') : `${t('checkout.complete_purchase')} ${finalTotal.toFixed(2)} ₴`}
                                </button>

                                <p className="text-center text-black/20 text-[8px] uppercase tracking-widest leading-relaxed">
                                    {t('checkout.terms_agreement')}
                                </p>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
