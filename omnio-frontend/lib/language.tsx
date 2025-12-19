"use client"

import { createContext, useContext, ReactNode } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';

export type Locale = 'en' | 'de';

interface LanguageContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const params = useParams();
    const router = useRouter();
    const pathname = usePathname();

    // Derive locale from URL params, fallback to 'en'
    const locale = (params?.lang as Locale) || 'en';

    const setLocale = (newLocale: Locale) => {
        if (newLocale === locale) return;

        // Replace the locale segment in the pathname
        const segments = pathname.split('/');
        // segments[0] is empty string because pathname starts with /
        // segments[1] is the locale (e.g. 'en' or 'de')
        segments[1] = newLocale;
        const newPath = segments.join('/');

        // Set cookie for middleware preference
        document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;

        router.push(newPath);
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
