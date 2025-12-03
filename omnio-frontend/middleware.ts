import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["en", "de"];
const defaultLocale = "en";

// Simple locale detection
function getLocale(request: NextRequest): string {
    // Check cookie first
    const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
    if (cookieLocale && locales.includes(cookieLocale)) {
        return cookieLocale;
    }

    // Check Accept-Language header
    const acceptLanguage = request.headers.get("accept-language");
    if (acceptLanguage) {
        // Very simple parser: take the first 2 chars of the first language
        // e.g., "de-DE,de;q=0.9,en;q=0.8" -> "de"
        const preferredLocale = acceptLanguage.split(",")[0].split("-")[0];
        if (locales.includes(preferredLocale)) {
            return preferredLocale;
        }
    }

    return defaultLocale;
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if the pathname is missing a locale
    const pathnameIsMissingLocale = locales.every(
        (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
    );

    // Exclude static files, API routes, and Next.js internals
    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/api") ||
        pathname.startsWith("/static") ||
        pathname.includes(".") // files with extensions (images, etc.)
    ) {
        return;
    }

    if (pathnameIsMissingLocale) {
        const locale = getLocale(request);

        // Redirect to the same path with locale prefix
        return NextResponse.redirect(
            new URL(`/${locale}${pathname.startsWith("/") ? "" : "/"}${pathname}`, request.url)
        );
    }

    // If locale is present, store it in a cookie for client-side access
    const locale = pathname.split('/')[1];
    const response = NextResponse.next();
    response.cookies.set('NEXT_LOCALE', locale);

    return response;
}

export const config = {
    matcher: [
        // Skip all internal paths (_next)
        "/((?!_next).*)",
        // Optional: only run on root (/)
        // "/"
    ],
};
