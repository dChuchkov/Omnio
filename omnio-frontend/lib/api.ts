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

    return await response.json();
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
            category: { populate: ['image', 'parent'] },
            variants: true
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
            parent: { id: { $null: true } }
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
                populate: ['image'],
                pagination: { pageSize: 50 }
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
            footer: { populate: ['quickLinks', 'legalLinks', 'socialLinks'] },
            defaultSEO: true
        }
    });
}

// ============================================================
// AUTH & USER
// ============================================================

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
// COMMERCE (Cart & Orders)
// ============================================================

// TODO: Implement Cart/Order API calls when needed
