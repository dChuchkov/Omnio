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

async function fetchAPI<T>(path: string, urlParamsObject = {}, options = {}): Promise<T> {
    const mergedOptions = {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    };

    const queryString = qs.stringify(urlParamsObject, { encodeValuesOnly: true });
    const requestUrl = `${getStrapiURL()}/api${path}${queryString ? `?${queryString}` : ''}`;

    // Debug logging
    if (process.env.NODE_ENV === 'development') {
        console.log('[API] Fetching:', path, 'Params:', urlParamsObject);
        console.log('[API] Full URL:', requestUrl);
    }

    const response = await fetch(requestUrl, {
        ...mergedOptions,
        next: { revalidate: 60 } // ISR: revalidate every 60 seconds
    } as RequestInit & { next?: { revalidate?: number } });

    if (!response.ok) {
        console.error(`API Error: ${response.status} ${response.statusText}`);
        // Don't throw for 404s, return null or empty
        if (response.status === 404) return null as any;
        throw new Error(`API Error: ${response.statusText}`);
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
                populate: ['image']
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
            category: { populate: ['image', 'parent'] }
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
                populate: ['image']
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
                populate: ['image']
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
            children: { populate: ['image'] },
            products: {
                populate: ['image']
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
                    'dynamic-zone.hero-section': { populate: ['backgroundImage'] },
                    'dynamic-zone.feature-grid': { populate: ['features'] },
                    'dynamic-zone.content-block': { populate: '*' },
                    'dynamic-zone.product-carousel': { populate: ['category'] }
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
            header: { populate: ['logo', 'navigationLinks'] },
            footer: { populate: ['quickLinks', 'legalLinks'] },
            defaultSeo: true
        }
    });
}

// ============================================================
// AUTH & USER
// ============================================================

export async function login(identifier: string, password: string): Promise<any> {
    const response = await fetch(`${getStrapiURL()}/api/auth/local`, {
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
        throw new Error(error.error?.message || 'Login failed');
    }

    return response.json();
}

export async function register(username: string, email: string, password: string): Promise<any> {
    const response = await fetch(`${getStrapiURL()}/api/auth/local/register`, {
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
        throw new Error(error.error?.message || 'Registration failed');
    }

    return response.json();
}

export async function fetchUser(token: string): Promise<User> {
    const response = await fetch(`${getStrapiURL()}/api/users/me`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    if (!response.ok) throw new Error('Failed to fetch user');
    return response.json();
}

// ============================================================
// COMMERCE (Cart & Wishlist)
// ============================================================

// CART

export async function getCart(token: string, userId: number): Promise<any> {
    const response = await fetchAPI('/carts', {
        filters: { users_permissions_user: { id: { $eq: userId } } },
        populate: {
            cart_items: {
                populate: {
                    product: {
                        populate: ['image']
                    }
                }
            }
        }
    }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return (response as any).data[0];
}

export async function createCart(token: string, userId: number): Promise<any> {
    const response = await fetch(`${getStrapiURL()}/api/carts`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
            data: {
                users_permissions_user: userId
            }
        })
    });
    return response.json();
}

export async function addToCart(token: string, cartId: number, productId: number, quantity: number): Promise<any> {
    // First check if item exists in cart
    // This logic might be better in a custom controller, but doing it client-side for now
    // Actually, we should just create a cart-item linked to the cart

    const response = await fetch(`${getStrapiURL()}/api/cart-items`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
            data: {
                cart: cartId,
                product: productId,
                quantity
            }
        })
    });
    return response.json();
}

export async function updateCartItem(token: string, itemId: number, quantity: number): Promise<any> {
    const response = await fetch(`${getStrapiURL()}/api/cart-items/${itemId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
            data: {
                quantity
            }
        })
    });
    return response.json();
}

export async function removeFromCart(token: string, itemId: number): Promise<any> {
    const response = await fetch(`${getStrapiURL()}/api/cart-items/${itemId}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.json();
}

// WISHLIST

export async function getWishlist(token: string, userId: number): Promise<any> {
    const response = await fetchAPI('/wishlists', {
        filters: { user: { id: { $eq: userId } } },
        populate: {
            products: {
                populate: ['image']
            }
        }
    }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return (response as any).data[0];
}

export async function createWishlist(token: string, userId: number): Promise<any> {
    const response = await fetch(`${getStrapiURL()}/api/wishlists`, {
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
    });
    return response.json();
}

export async function updateWishlist(token: string, wishlistId: number, productIds: number[]): Promise<any> {
    const response = await fetch(`${getStrapiURL()}/api/wishlists/${wishlistId}`, {
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
    });
    return response.json();
}

