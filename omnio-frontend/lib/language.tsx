"use client"
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type Locale = 'en' | 'de';

interface LanguageContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>('en');

    useEffect(() => {
        // Check localStorage on mount
        const saved = localStorage.getItem('locale') as Locale;
        if (saved && (saved === 'en' || saved === 'de')) {
            setLocaleState(saved);
        }
    }, []);

    const setLocale = (newLocale: Locale) => {
        setLocaleState(newLocale);
        localStorage.setItem('locale', newLocale);
        // Optional: Refresh page to fetch new content
        window.location.reload();
    };

    return (
        <LanguageContext.Provider value={{ locale, setLocale }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) throw new Error('useLanguage must be used within LanguageProvider');
    return context;
}
