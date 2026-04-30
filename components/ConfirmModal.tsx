"use client";

import { Modal } from "./Modal";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText,
    cancelText,
    isDestructive = true
}: ConfirmModalProps) {
    const { t } = useLanguage();

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="space-y-8">
                <p className="text-[11px] uppercase tracking-[0.2em] font-bold text-black/50 dark:text-white/50 leading-relaxed">
                    {message}
                </p>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`flex-1 py-4 text-[10px] uppercase tracking-[0.4em] font-black transition-all bg-black dark:bg-white text-white dark:text-black hover:opacity-90`}
                    >
                        {confirmText || t('common.confirm') || 'Підтвердити'}
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 text-[10px] uppercase tracking-[0.4em] font-black border border-black/10 dark:border-white/10 text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
                    >
                        {cancelText || t('common.cancel') || 'Скасувати'}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
