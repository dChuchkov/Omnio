// lib/types.ts - TypeScript interfaces matching Strapi schemas

// ============================================================
// MEDIA
// ============================================================
export interface StrapiMedia {
    id: number;
    url: string;
    alternativeText: string | null;
    width: number;
    height: number;
    formats?: {
        thumbnail?: { url: string; width: number; height: number };
        small?: { url: string; width: number; height: number };
        medium?: { url: string; width: number; height: number };
        large?: { url: string; width: number; height: number };
    };
}

// ============================================================
// PRODUCT
// ============================================================
export interface Product {
    id: number;
    documentId: string;
    name: string;
    slug: string;
    description: BlockContent[] | null;
    price: number;
    originalPrice: number | null;
    image: StrapiMedia;
    images: StrapiMedia[] | null;
    inStock: boolean;
    isFeatured: boolean;
    variants: ProductVariant[] | null;
    specifications: BlockContent[] | null;
    features: BlockContent[] | null;
    category: Category | null;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    locale: string;
}

export interface ProductVariant {
    color?: string;
    colorHex?: string;
    size?: string;
    sku?: string;
    priceModifier?: number;
    inStock?: boolean;
    image?: string;
}

// ============================================================
// CATEGORY
// ============================================================
export interface Category {
    id: number;
    documentId: string;
    name: string;
    slug: string;
    description: string | null;
    image: StrapiMedia | null;
    parent: Category | null;
    children: Category[] | null;
    products: Product[] | null;
    locale: string;
}

// ============================================================
// PAGE & DYNAMIC ZONE
// ============================================================
export interface Page {
    id: number;
    documentId: string;
    title: string;
    slug: string;
    sections: DynamicZoneComponent[];
    seo: SEOComponent | null;
    locale: string;
}

export type DynamicZoneComponent =
    | HeroSectionComponent
    | FeatureGridComponent
    | ContentBlockComponent
    | ProductCarouselComponent;

export interface HeroSectionComponent {
    __component: 'dynamic-zone.hero-section';
    id: number;
    title: string;
    subtitle: string | null;
    backgroundImage: StrapiMedia | null;
    ctaText: string | null;
    ctaUrl: string | null;
}

export interface FeatureGridComponent {
    __component: 'dynamic-zone.feature-grid';
    id: number;
    title: string | null;
    features: FeatureItem[];
}

export interface FeatureItem {
    id: number;
    icon: string;
    title: string;
    description: string | null;
}

export interface ContentBlockComponent {
    __component: 'dynamic-zone.content-block';
    id: number;
    title: string | null;
    content: BlockContent[] | null;
    backgroundColor: 'white' | 'gray' | 'primary';
}

export interface ProductCarouselComponent {
    __component: 'dynamic-zone.product-carousel';
    id: number;
    title: string | null;
    displayCount: number;
    showFeaturedOnly: boolean;
    category: Category | null;
}

// ============================================================
// GLOBAL SETTINGS
// ============================================================
export interface GlobalSettings {
    id: number;
    siteName: string;
    header: HeaderComponent;
    footer: FooterComponent;
    defaultSEO: SEOComponent | null;
}

export interface HeaderComponent {
    id: number;
    brandName: string;
    logo: StrapiMedia | null;
    navigationLinks: LinkItem[];
    searchPlaceholder: string;
}

export interface FooterComponent {
    id: number;
    companyDescription: string | null;
    quickLinks: LinkItem[];
    legalLinks: LinkItem[];
    socialLinks: LinkItem[];
    newsletterTitle: string | null;
    copyrightText: string | null;
}

export interface LinkItem {
    id: number;
    label: string;
    url: string;
    isExternal: boolean;
}

export interface SEOComponent {
    id: number;
    metaTitle: string | null;
    metaDescription: string | null;
    keywords: string | null;
    canonicalUrl: string | null;
}

// ============================================================
// USER & COMMERCE
// ============================================================
export interface User {
    id: number;
    username: string;
    email: string;
    provider: string;
    confirmed: boolean;
    blocked: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Cart {
    id: number;
    documentId: string;
    user?: User;
    items: CartItem[];
    total: number;
}

export interface CartItem {
    id: number;
    documentId: string;
    product: Product;
    quantity: number;
}

export interface Order {
    id: number;
    documentId: string;
    user?: User;
    items: any[]; // JSON or relation depending on implementation
    total: number;
    status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
    stripeSessionId?: string;
    createdAt: string;
}

// ============================================================
// BLOCKS (Rich Text)
// ============================================================
export interface BlockContent {
    type: 'paragraph' | 'heading' | 'list' | 'quote' | 'code' | 'image';
    children?: BlockChild[];
    level?: number; // for headings
    format?: 'ordered' | 'unordered'; // for lists
    image?: StrapiMedia; // for image blocks
}

export interface BlockChild {
    type: 'text' | 'link';
    text?: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    url?: string; // for links
    children?: BlockChild[]; // for nested links
}

// ============================================================
// STRAPI API RESPONSE WRAPPERS
// ============================================================
export interface StrapiResponse<T> {
    data: T;
    meta: {
        pagination?: {
            page: number;
            pageSize: number;
            pageCount: number;
            total: number;
        };
    };
}

export interface StrapiCollectionResponse<T> {
    data: T[];
    meta: {
        pagination: {
            page: number;
            pageSize: number;
            pageCount: number;
            total: number;
        };
    };
}

export interface StrapiSingleResponse<T> {
    data: T;
    meta: {};
}
