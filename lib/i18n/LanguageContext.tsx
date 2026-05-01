"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import en from "./dictionaries/en.json";
import uk from "./dictionaries/uk.json";
import pl from "./dictionaries/pl.json";

type Language = "en" | "uk" | "pl";

const dictionaries = {
    en,
    uk,
    pl,
};

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
    getLocalized: (item: any, field?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({
    children,
    initialLanguage = "uk"
}: {
    children: ReactNode;
    initialLanguage?: Language;
}) {
    const [language, setLanguage] = useState<Language>(initialLanguage);

    const handleSetLanguage = (lang: Language) => {
        if (lang === language) return;
        setLanguage(lang);
        // Set cookie so server can read it
        document.cookie = `migra_lang=${lang}; path=/; max-age=31536000`; // 1 year

        // Show loading state before reload
        document.body.classList.add('switching-language');

        window.location.reload(); // Reload to update server components
    };

    const t = (key: string): string => {
        const keys = key.split(".");
        let result: any = dictionaries[language];

        for (const k of keys) {
            if (result && result[k]) {
                result = result[k];
            } else {
                return key;
            }
        }

        return typeof result === "string" ? result : key;
    };

    const getLocalized = (item: any, field: string = "name"): string => {
        if (!item) return "";
        if (language === "en") return item[field] || "";
        const localizedField = `${field}_${language}`;
        return item[localizedField] || item[field] || "";
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t, getLocalized }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}
