"use client";

import { useState } from "react";
import { Modal } from "./Modal";
import { Phone, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/lib/stores/toast.store";
import { createCallbackRequest } from "@/lib/actions/callback.actions";

interface ConsultationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ConsultationModal({ isOpen, onClose }: ConsultationModalProps) {
    const [phone, setPhone] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const { showToast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Basic UA phone validation regex
        // Matches: +380XXXXXXXXX, 380XXXXXXXXX, 0XXXXXXXXX
        const uaPhoneRegex = /^(\+?38)?0\d{9}$/;
        const cleanPhone = phone.replace(/\D/g, '');
        
        if (!uaPhoneRegex.test(cleanPhone)) {
            showToast("Будь ласка, введіть коректний український номер (+380...)", "error");
            return;
        }

        setIsSubmitting(true);
        
        try {
            const result = await createCallbackRequest(phone);
            
            if (result.success) {
                setIsSuccess(true);
                showToast("Заявка успішно відправлена!", "success");
                
                // Auto close after 3 seconds
                setTimeout(() => {
                    onClose();
                    setTimeout(() => {
                        setIsSuccess(false);
                        setPhone("");
                    }, 500);
                }, 3000);
            } else {
                showToast("Сталася помилка при відправці заявки", "error");
            }

        } catch (error) {
            showToast("Сталася помилка. Спробуйте пізніше", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatUAStore = (val: string) => {
        const numbers = val.replace(/\D/g, '');
        if (numbers.length === 0) return "";
        
        // If user is just typing part of the prefix, show it cleanly
        if (numbers === "3" || numbers === "38" || numbers === "380") {
            return "+380";
        }

        let body = numbers;
        // Strip prefix to get the 9-digit body
        if (numbers.startsWith('380')) {
            body = numbers.substring(3);
        } else if (numbers.startsWith('0')) {
            body = numbers.substring(1);
        } else if (numbers.length < 3) {
            // If it's a short sequence not starting with 0/380, treat as start of body
            body = numbers;
        }

        // Build the formatted string
        let result = "+380";
        if (body.length > 0) {
            result += " (" + body.substring(0, 2);
        }
        if (body.length > 2) {
            result += ") " + body.substring(2, 5);
        }
        if (body.length > 5) {
            result += " " + body.substring(5, 7);
        }
        if (body.length > 7) {
            result += " " + body.substring(7, 9);
        }
        
        return result;
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatUAStore(e.target.value);
        if (formatted.length <= 19) { // Limit to full mask length
            setPhone(formatted);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Замовити консультацію">
            <AnimatePresence mode="wait">
                {!isSuccess ? (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >
                        <div className="space-y-2">
                            <p className="text-xs text-black/60 dark:text-white/60 leading-relaxed uppercase tracking-widest font-bold">
                                Залиште ваші контактні дані, і наш експерт зателефонує вам найближчим часом.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40 group-focus-within:text-black dark:group-focus-within:text-white transition-colors">
                                    <Phone size={18} />
                                </div>
                                <input 
                                    type="tel"
                                    value={phone}
                                    onChange={handlePhoneChange}
                                    placeholder="+380 (__) ___ __ __"
                                    required
                                    className="w-full bg-black/[0.03] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 px-12 py-4 text-sm font-bold outline-none focus:border-black dark:focus:border-white transition-all text-black dark:text-white"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 bg-black dark:bg-white text-white dark:text-black text-[11px] font-black uppercase tracking-[0.3em] hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <div className="w-4 h-4 border-2 border-current border-t-transparent animate-spin rounded-full" />
                                ) : (
                                    <>
                                        Замовити дзвінок
                                        <ArrowRight size={14} />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="pt-2">
                            <p className="text-[9px] text-center text-black/30 dark:text-white/30 uppercase tracking-[0.1em] font-medium">
                                Натискаючи кнопку, ви погоджуєтесь з обробкою персональних даних
                            </p>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="py-10 flex flex-col items-center text-center space-y-4"
                    >
                        <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle2 size={40} />
                        </div>
                        <h4 className="text-lg font-black uppercase tracking-widest text-black dark:text-white">Дякуємо!</h4>
                        <p className="text-xs text-black/60 dark:text-white/60 uppercase tracking-widest font-bold">
                            Ваша заявка прийнята. <br /> Очікуйте на дзвінок.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </Modal>
    );
}
