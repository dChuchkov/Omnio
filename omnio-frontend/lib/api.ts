// lib/api.ts - Strapi API Client
import qs from 'qs';
import type {
    Product,
    Category,
    Page,
    GlobalSettings,
    StrapiCollectionResponse,
    StrapiSingleResponse,
    User,
    Cart,
    Order
} from './types';
import { products } from './data';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';

// ============================================================
// HELPERS
// ============================================================

export function getStrapiURL(path = ''): string {
    return `${STRAPI_URL}${path}`;
}

export function getStrapiMedia(url: string | null): string | null {
    if (!url) return null;
    if (url.startsWith('http') || url.startsWith('//')) return url;
    return getStrapiURL(url);
}

// ---- Auth: lightweight JWT manager ----

// Prefer cookie on server; localStorage on client.
// This keeps things SSR-safe and avoids "Bearer undefined".
export type AuthToken = string | null;

let memoryToken: AuthToken = null; // server-side or fallback

export function getToken(): AuthToken {
    // Server: no window; use in-memory
    if (typeof window === 'undefined') return memoryToken;
    try {
        const t = window.localStorage.getItem('jwt'); // Changed from 'omnio_jwt' to match existing code
        return t || null;
    } catch {
        return memoryToken;
    }
}

export function setToken(token: string | null) {
    memoryToken = token;
    if (typeof window !== 'undefined') {
        try {
            if (token) window.localStorage.setItem('jwt', token);
            else window.localStorage.removeItem('jwt');
        } catch {
            // ignore storage errors, rely on memoryToken
        }
    }
}

// Builds Authorization header only if token exists.
export function getAuthHeaders(extra?: Record<string, string>): { headers: Record<string, string> } {
    const token = getToken();
    const base: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) base.Authorization = `Bearer ${token}`;
    const headers = { ...base, ...(extra || {}) };
    return { headers };
}

async function fetchAPI<T>(path: string, urlParamsObject = {}, options: RequestInit = {}): Promise<T> {
    const { headers: callerHeaders, ...restOptions } = options;

    const queryString = qs.stringify(urlParamsObject, { encodeValuesOnly: true, arrayFormat: 'brackets' });
    const requestUrl = `${getStrapiURL()}/api${path}${queryString ? `?${queryString}` : ''}`;

    // Merge auth headers (Bearer if present), callerHeaders, and default JSON content type
    const auth = getAuthHeaders(callerHeaders as Record<string, string>);

    // Debug logging
    if (process.env.NODE_ENV === 'development') {
        console.log('[API] Fetching:', path, 'Params:', urlParamsObject);
        console.log('[API] Full URL:', requestUrl);
    }

    const response = await fetch(requestUrl, {
        ...restOptions,
        headers: auth.headers,
        next: { revalidate: 60, ...(restOptions as any)?.next }
    } as RequestInit & { next?: { revalidate?: number } });

    if (!response.ok) {
        let msg = `${response.status} ${response.statusText}`;
        try {
            const text = await response.text();
            const parsed = JSON.parse(text);
            const errMsg = parsed?.error?.message || parsed?.message || text;
            msg = `${msg} - ${errMsg}`;
            console.error('[API] Error body:', parsed);
        } catch {
            // non-JSON error body
        }
        // Don't throw for 404s, return null or empty
        if (response.status === 404) return null as any;
        throw new Error(`API Error: ${msg}`);
    }

    const data = await response.json();

    // Debug logging
    if (process.env.NODE_ENV === 'development') {
        console.log('[API] Response:', data);
    }

    return data;
}

// ============================================================
// PRODUCTS
// ============================================================

export async function getProducts(locale = 'en'): Promise<StrapiCollectionResponse<Product>> {
    return fetchAPI('/products', {
        locale,
        populate: {
            image: true,
            images: true,
            category: {
                populate: { image: true }
            }
        },
        pagination: { pageSize: 100 }
    });
}

export async function getProductBySlug(slug: string, locale = 'en'): Promise<StrapiCollectionResponse<Product>> {
    return fetchAPI('/products', {
        locale,
        filters: { slug: { $eq: slug } },
        populate: {
            image: true,
            images: true,
            category: { populate: { image: true, parent: true } }
        }
    });
}

export async function getFeaturedProducts(locale = 'en'): Promise<StrapiCollectionResponse<Product>> {
    return fetchAPI('/products', {
        locale,
        filters: { isFeatured: { $eq: true } },
        populate: { image: true, category: true },
        pagination: { pageSize: 12 }
    });
}

export async function getProductsByCategory(categorySlug: string, locale = 'en'): Promise<StrapiCollectionResponse<Product>> {
    return fetchAPI('/products', {
        locale,
        filters: {
            category: {
                slug: { $eq: categorySlug }
            }
        },
        populate: { image: true, images: true, category: true },
        pagination: { pageSize: 50 }
    });
}

// Get products from parent category (includes products from all subcategories)
export async function getProductsByParentCategory(categorySlug: string, locale = 'en'): Promise<StrapiCollectionResponse<Product>> {
    return fetchAPI('/products', {
        locale,
        filters: {
            $or: [
                // Products directly in this category
                { category: { slug: { $eq: categorySlug } } },
                // Products in subcategories of this category
                { category: { parent: { slug: { $eq: categorySlug } } } }
            ]
        },
        populate: { image: true, images: true, category: true },
        pagination: { pageSize: 100 }
    });
}

// ============================================================
// CATEGORIES
// ============================================================

export async function getCategories(locale = 'en'): Promise<StrapiCollectionResponse<Category>> {
    return fetchAPI('/categories', {
        locale,
        populate: {
            image: true,
            parent: true,
            children: {
                populate: { image: true }
            }
        },
        pagination: { pageSize: 100 }
    });
}

export async function getParentCategories(locale = 'en'): Promise<StrapiCollectionResponse<Category>> {
    return fetchAPI('/categories', {
        locale,
        filters: {
            parent: { $null: true }
        },
        populate: {
            image: true,
            children: {
                populate: { image: true }
            }
        }
    });
}

export async function getCategoryBySlug(slug: string, locale = 'en'): Promise<StrapiCollectionResponse<Category>> {
    return fetchAPI('/categories', {
        locale,
        filters: { slug: { $eq: slug } },
        populate: {
            image: true,
            parent: true,
            children: { populate: { image: true } },
            products: {
                populate: { image: true }
            }
        }
    });
}

// ============================================================
// PAGES (Dynamic Zone)
// ============================================================

export async function getPageBySlug(slug: string, locale = 'en'): Promise<StrapiCollectionResponse<Page>> {
    return fetchAPI('/pages', {
        locale,
        filters: { slug: { $eq: slug } },
        populate: {
            sections: {
                on: {
                    'dynamic-zone.hero-section': { populate: { backgroundImage: true } },
                    'dynamic-zone.feature-grid': { populate: { features: true } },
                    'dynamic-zone.content-block': { populate: '*' },
                    'dynamic-zone.product-carousel': { populate: { products: true } }
                }
            },
            seo: true
        }
    });
}

// ============================================================
// GLOBAL SETTINGS (Single Type)
// ============================================================

export async function getGlobalSettings(locale = 'en'): Promise<StrapiSingleResponse<GlobalSettings>> {
    return fetchAPI('/global-setting', {
        locale,
        populate: {
            header: { populate: { logo: true, navigationLinks: true } },
            footer: { populate: { quickLinks: true, legalLinks: true } },
            defaultSeo: true
        }
    });
}

// ============================================================
// AUTH & USER
// ============================================================

export async function login(identifier: string, password: string): Promise<any> {
    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            identifier,
            password,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
    }

    return response.json();
}

export async function register(username: string, email: string, password: string): Promise<any> {
    const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username,
            email,
            password,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Registration failed');
    }

    return response.json();
}

export async function logout(): Promise<any> {
    const response = await fetch('/api/auth/logout', {
        method: 'POST',
    });

    if (!response.ok) {
        throw new Error('Logout failed');
    }

    return response.json();
}

export async function fetchUser(token?: string): Promise<any> {
    if (token) {
        // Server-side or explicit token usage
        const response = await fetch(`${getStrapiURL()}/api/users/me`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (!response.ok) return null;
        return response.json();
    } else {
        // Client-side proxy usage
        const response = await fetch('/api/auth/me');
        if (!response.ok) return null;
        return response.json();
    }
}

// COMMERCE (Cart & Wishlist)
// ============================================================

// CART

export async function getCart(token?: string): Promise<any> {
    if (token) {
        // Server-side: use provided token to call Strapi directly
        return fetchAPI('/carts/me', {}, { headers: { Authorization: `Bearer ${token}` } })
            .then((res: any) => res?.data ?? null)
            .catch(() => null);
    } else {
        // Client-side: use Proxy Route (cookie)
        const response = await fetch('/api/cart/me', { credentials: 'include', cache: 'no-store' });
        if (!response.ok) return null;
        const json = await response.json();
        return json.data ?? null;
    }
}

export async function createCart(token?: string): Promise<any> {
    if (token) {
        return fetch(`${getStrapiURL()}/api/carts/me`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        }).then(res => res.json());
    } else {
        const response = await fetch('/api/cart/me', {
            method: 'POST'
        });
        return response.json();
    }
}

// addToCart now accepts either numeric id or documentId string
export async function addToCart(productIdentifier: number | string, quantity: number): Promise<any> {
    const payload: any = { quantity };

    // If a string is passed, treat it as documentId; otherwise numeric id
    if (typeof productIdentifier === 'string') {
        payload.productDocumentId = productIdentifier;
    } else {
        payload.product = productIdentifier;
    }

    const response = await fetch('/api/cart/items', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
    });

    // handle non-ok gracefully
    if (!response.ok) {
        const text = await response.text().catch(() => '');
        console.warn('addToCart proxy returned non-ok', response.status, text);
        return null;
    }

    const json = await response.json().catch(() => null);
    return json;
}

export async function updateCartItem(itemId: number, quantity: number): Promise<any> {
    const response = await fetch(`/api/cart/items/${itemId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            quantity
        }),
        credentials: 'include'
    });
    return response.json();
}

export async function removeFromCart(itemId: number): Promise<any> {
    const response = await fetch(`/api/cart/items/${itemId}`, {
        method: 'DELETE',
        credentials: 'include'
    });
    return response.json();
}

// WISHLIST

export async function getWishlist(token?: string, userId?: number): Promise<any> {
    if (token && userId) {
        return fetchAPI('/wishlists', {
            filters: { user: { id: { $eq: userId } } },
            populate: {
                products: {
                    populate: { image: true }
                }
            }
        }, {
            headers: { Authorization: `Bearer ${token}` }
        }).then((res: any) => res.data?.[0] ?? null);
    } else if (userId) {
        const query = qs.stringify({
            filters: { user: { id: { $eq: userId } } },
            populate: {
                products: {
                    populate: { image: true }
                }
            }
        }, { encodeValuesOnly: true, arrayFormat: 'brackets' });

        const response = await fetch(`/api/wishlist?${query}`, { cache: 'no-store' });
        if (!response.ok) return null;
        const json = await response.json();
        return json.data?.[0] ?? null;
    }
    return null;
}

export async function createWishlist(token?: string, userId?: number): Promise<any> {
    if (!userId) throw new Error('User ID required');

    if (token) {
        return fetch(`${getStrapiURL()}/api/wishlists`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                data: {
                    user: userId,
                    products: []
                }
            })
        }).then(res => res.json());
    } else {
        const response = await fetch('/api/wishlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                data: {
                    user: userId,
                    products: []
                }
            })
        });
        return response.json();
    }
}

export async function updateWishlist(token: string | undefined, wishlistId: number, productIds: number[]): Promise<any> {
    if (token) {
        return fetch(`${getStrapiURL()}/api/wishlists/${wishlistId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                data: {
                    products: productIds
                }
            })
        }).then(res => res.json());
    } else {
        const response = await fetch(`/api/wishlist/${wishlistId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                data: {
                    products: productIds
                }
            })
        });
        return response.json();
    }
}

// ORDERS
// ============================================================

export async function placeOrder(token?: string): Promise<any> {
    if (token) {
        return fetchAPI('/orders/place', {}, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }
        });
    } else {
        // Fallback: use Next.js API proxy which handles the HTTP-only cookie
        const response = await fetch('/api/orders/place', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || error.message || 'Failed to place order');
        }

        return response.json();
    }
}
