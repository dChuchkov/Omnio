import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["en", "de"];
const defaultLocale = "en";

function getLocale(request: NextRequest): string {
    const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
    if (cookieLocale && locales.includes(cookieLocale)) return cookieLocale;

    const acceptLanguage = request.headers.get("accept-language");
    if (acceptLanguage) {
        const preferredLocale = acceptLanguage.split(",")[0].split("-")[0];
        if (locales.includes(preferredLocale)) return preferredLocale;
    }

    return defaultLocale;
}

export function middleware(request: NextRequest) {
    const { pathname, search } = request.nextUrl;

    // If path already contains a locale prefix, just continue
    const hasLocalePrefix = locales.some((loc) => pathname === `/${loc}` || pathname.startsWith(`/${loc}/`));
    if (hasLocalePrefix) {
        // Only set cookie if it differs from current cookie to avoid unnecessary Set-Cookie headers
        const current = request.cookies.get("NEXT_LOCALE")?.value;
        const locale = pathname.split("/")[1];
        if (locale && locale !== current && locales.includes(locale)) {
            const res = NextResponse.next();
            res.cookies.set("NEXT_LOCALE", locale, { path: "/", sameSite: "lax" });
            return res;
        }
        return NextResponse.next();
    }

    // Path is missing locale — redirect to detected locale and preserve query string
    const locale = getLocale(request);
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname}`;
    url.search = search; // preserve query string
    return NextResponse.redirect(url);
}

export const config = {
    matcher: [
        // Run middleware for all non-internal, non-api, non-static routes
        "/((?!_next|api|static).*)"
    ]
};
