// src/bootstrap/localize-bootstrap.ts
import type { Core } from '@strapi/strapi';
import fs from 'fs';
import path from 'path';

type StrapiID = number | string;

type StrapiBlock = {
  type: string;
  children?: any[];
  format?: string;
};

type StrapiBlocks = StrapiBlock[];

function createBlocksContent(text: string): StrapiBlocks {
  return [
    {
      type: "paragraph",
      children: [{ type: "text", text }],
    },
  ];
}

function createFeaturesBlocks(features: string[]): StrapiBlocks {
  return [
    {
      type: "list",
      format: "unordered",
      children: features.map((feature) => ({
        type: "list-item",
        children: [{ type: "text", text: feature }],
      })),
    },
  ];
}

function createSpecificationsBlocks(specs: Record<string, string>): StrapiBlocks {
  const rows = Object.entries(specs).map(([key, value]) => `${key}: ${value}`);
  return [
    {
      type: "list",
      format: "unordered",
      children: rows.map((row) => ({
        type: "list-item",
        children: [{ type: "text", text: row }],
      })),
    },
  ];
}

const CONFIG = {
  DRY_RUN: true,
  STRICT_SLUGS: true,
  ALLOW_SUFFIX: false,
  ABORT_ON_EN_FAILURE: true,
  SOURCE_LOCALE: 'en',
  TARGET_LOCALE: 'de',
  MEDIA_MAP_FILE: path.resolve(process.cwd(), 'media_map.json'),
  BATCH_SIZE: 50,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 500,
  PUBLISH_AFTER_CREATE: true,
  CONTENT_TYPES: {
    page: 'api::page.page',
    category: 'api::category.category',
    product: 'api::product.product',
  },
};

// Utilities
function delay(ms: number) { return new Promise(res => setTimeout(res, ms)); }

async function withRetry<T>(fn: () => Promise<T>, retries = CONFIG.RETRY_ATTEMPTS, delayMs = CONFIG.RETRY_DELAY_MS): Promise<T> {
  try {
    return await fn();
  } catch (err: any) {
    if (retries <= 0) throw err;
    console.warn(`[Retry] ${err.message}. Retries left: ${retries}. Waiting ${delayMs}ms`);
    await delay(delayMs);
    return withRetry(fn, retries - 1, delayMs * 2);
  }
}

// Media map loader
let MEDIA_MAP: Record<string, any> = {};
function loadMediaMap() {
  try {
    if (!fs.existsSync(CONFIG.MEDIA_MAP_FILE)) {
      console.warn('[Bootstrap] media_map.json not found; media linking will be best-effort.');
      return;
    }
    const raw = fs.readFileSync(CONFIG.MEDIA_MAP_FILE, 'utf8').trim();
    MEDIA_MAP = JSON.parse(raw);
    console.info(`[Bootstrap] Loaded media_map.json (${Object.keys(MEDIA_MAP).length} entries)`);
  } catch (e: any) {
    console.warn('[Bootstrap] Failed to load media_map.json:', e.message);
    MEDIA_MAP = {};
  }
}
function normalizeName(name?: string) {
  if (!name) return '';
  return name.toString().toLowerCase().replace(/\s+/g, '-').replace(/\.(png|jpg|jpeg)$/i, '');
}
function findMediaByName(nameOrFilename?: string) {
  if (!nameOrFilename) return null;
  const key = normalizeName(nameOrFilename);
  return MEDIA_MAP[key] || null;
}

// i18n helpers
async function ensureBidirectionalLinkAndSync(strapi: Core.Strapi, UID: string, createdEntry: any, createdLocale: string) {
  try {
    const createdAttrs = createdEntry?.attributes ?? createdEntry;
    const locs = createdAttrs?.localizations ?? createdEntry?.localizations ?? [];
    const locIds = Array.isArray(locs) ? locs.map((l: any) => (typeof l === 'object' ? (l.id || l.documentId) : l)) : [];

    let enEntry: any = null;
    if (createdLocale === CONFIG.TARGET_LOCALE) {
      if (locIds.length > 0) {
        enEntry = await strapi.entityService.findOne(UID as any, locIds[0], { populate: ['localizations'] });
      } else if (createdAttrs.documentId) {
        const found = await strapi.entityService.findMany(UID as any, {
          filters: { documentId: createdAttrs.documentId, locale: CONFIG.SOURCE_LOCALE },
          limit: 1,
          populate: ['localizations'],
        });
        enEntry = found?.[0] ?? null;
      }
    }

    if (!enEntry) return;

    const canonicalDocumentId = enEntry.documentId || enEntry.id;
    if (!createdAttrs.documentId || String(createdAttrs.documentId) !== String(canonicalDocumentId)) {
      await withRetry(() => strapi.entityService.update(UID as any, createdEntry.id, {
        data: { documentId: canonicalDocumentId },
        locale: createdLocale,
      }));
    }

    const enLocalizations = (enEntry.localizations || enEntry.attributes?.localizations || []).map((l: any) => (typeof l === 'object' ? l.id : l));
    const createdLocalizations = (createdAttrs.localizations || []).map((l: any) => (typeof l === 'object' ? l.id : l));

    const enSet = new Set(enLocalizations);
    const createdSet = new Set(createdLocalizations);

    enSet.add(createdEntry.id);
    createdSet.add(enEntry.id);

    await withRetry(() => strapi.entityService.update(UID as any, enEntry.id, {
      data: { localizations: Array.from(enSet) as any },
      locale: enEntry.locale || CONFIG.SOURCE_LOCALE,
    }));

    await withRetry(() => strapi.entityService.update(UID as any, createdEntry.id, {
      data: { localizations: Array.from(createdSet) as any },
      locale: createdLocale,
    }));

    try {
      const model = strapi.getModel(UID as any);
      const attrs = model?.attributes ?? {};
      const nonLocalizedData: any = {};
      for (const [attrName, attrDef] of Object.entries(attrs)) {
        const isLocalized = (attrDef as any)?.pluginOptions?.i18n?.localized === true;
        const isRelation = !!(attrDef as any)?.type && ['relation', 'component', 'dynamiczone'].includes(String((attrDef as any).type));
        if (isLocalized || isRelation) continue;
        const enVal = enEntry[attrName] ?? enEntry.attributes?.[attrName];
        if (typeof enVal !== 'undefined') nonLocalizedData[attrName] = enVal;
      }
      if (Object.keys(nonLocalizedData).length > 0) {
        await withRetry(() => strapi.entityService.update(UID as any, createdEntry.id, {
          data: nonLocalizedData,
          locale: createdLocale,
        }));
      }
    } catch (e: any) {
      console.warn('[i18n] Non-localized copy failed:', e.message);
    }
  } catch (e: any) {
    console.warn('[i18n] ensureBidirectionalLinkAndSync error:', e.message);
  }
}

// slug helpers
async function isSlugAvailable(strapi: Core.Strapi, uid: string, slug: string, locale: string, incomingDocumentId?: string | number) {
  if (!slug) return true;
  const found = await strapi.entityService.findMany(uid as any, {
    filters: { slug, locale },
    limit: 2,
  });
  if (!found || found.length === 0) return true;
  for (const f of found) {
    const fDoc = f.documentId ?? f.id;
    if (incomingDocumentId && String(fDoc) === String(incomingDocumentId)) return true;
  }
  if (CONFIG.STRICT_SLUGS && !CONFIG.ALLOW_SUFFIX) return false;
  return false;
}

// localized create helper
async function createLocalizedEntry(strapi: Core.Strapi, UID: string, params: any) {
  const incoming = { ...(params.data || {}) };
  const localeToUse = incoming.locale || params.locale || CONFIG.TARGET_LOCALE;
  const slug = incoming.slug;

  const existingByDoc = incoming.documentId ? await strapi.entityService.findMany(UID as any, {
    filters: { documentId: String(incoming.documentId), locale: localeToUse },
    limit: 1,
  }) : [];
  if (existingByDoc && existingByDoc.length) return existingByDoc[0];

  if (slug) {
    const existingBySlug = await strapi.entityService.findMany(UID as any, {
      filters: { slug, locale: localeToUse },
      limit: 1,
    });
    if (existingBySlug && existingBySlug.length) {
      const existing = existingBySlug[0];
      if (incoming.documentId && String(existing.documentId || existing.id) !== String(incoming.documentId)) {
        try {
          await withRetry(() => strapi.entityService.update(UID as any, existing.id, {
            data: { documentId: incoming.documentId },
            locale: localeToUse,
          }));
        } catch (err: any) {
          console.warn(`Failed to set documentId on existing entry ${existing.id}: ${err.message}`);
        }
      }
      await ensureBidirectionalLinkAndSync(strapi, UID, { id: existing.id, attributes: existing }, localeToUse);
      return existing;
    }
  }

  const createOptions: any = {
    data: incoming,
    populate: params.populate || { localizations: true },
    locale: localeToUse,
  };

  const created = await withRetry(() => strapi.entityService.create(UID as any, createOptions as any));

  const i18nService = strapi.plugin?.('i18n')?.service?.('localizations');
  if (i18nService && typeof i18nService.syncNonLocalizedAttributes === 'function') {
    try {
      i18nService.syncNonLocalizedAttributes(created, { model: strapi.getModel(UID as any) });
    } catch (err) {
      // ignore
    }
  }

  await ensureBidirectionalLinkAndSync(strapi, UID, created, localeToUse);
  return created;
}

// Inlined content data
const CATEGORIES_DATA = [
  {
    en: { name: "Electronics", slug: "electronics", description: "Discover the latest gadgets and cutting-edge technology for your digital lifestyle." },
    de: { name: "Elektronik", slug: "elektronik", description: "Entdecken Sie die neuesten Gadgets und modernste Technologie für Ihren digitalen Lebensstil." },
    imagePrompt: "Modern electronics display with smartphones, laptops, and gadgets",
    subcategories: [
      { en: { name: "Smartphones", slug: "smartphones", description: "Latest smartphones from top brands" }, de: { name: "Smartphones", slug: "smartphones", description: "Neueste Smartphones von Top-Marken" }, imagePrompt: "Collection of modern smartphones", productCount: 10, isFeatured: true },
      { en: { name: "Laptops", slug: "laptops", description: "Powerful laptops for work and play" }, de: { name: "Laptops", slug: "laptops", description: "Leistungsstarke Laptops für Arbeit und Freizeit" }, imagePrompt: "Modern laptop computer on desk", productCount: 6, isFeatured: false },
      { en: { name: "Headphones", slug: "headphones", description: "Premium audio experience" }, de: { name: "Kopfhörer", slug: "kopfhoerer", description: "Premium-Audioerlebnis" }, imagePrompt: "Premium wireless headphones", productCount: 6, isFeatured: false },
      { en: { name: "Tablets", slug: "tablets", description: "Versatile tablets for every need" }, de: { name: "Tablets", slug: "tablets", description: "Vielseitige Tablets für jeden Bedarf" }, imagePrompt: "Modern tablet device", productCount: 6, isFeatured: false },
      { en: { name: "Cameras", slug: "cameras", description: "Capture life in stunning detail" }, de: { name: "Kameras", slug: "kameras", description: "Erfassen Sie das Leben in beeindruckender Detailtreue" }, imagePrompt: "Professional DSLR camera", productCount: 6, isFeatured: false },
    ],
  },
  {
    en: { name: "Fashion", slug: "fashion", description: "Stay stylish with our curated fashion collection for every occasion." },
    de: { name: "Mode", slug: "mode", description: "Bleiben Sie stilvoll mit unserer kuratierten Modekollektion für jeden Anlass." },
    imagePrompt: "Elegant fashion clothing display",
    subcategories: [
      { en: { name: "Men's Clothing", slug: "mens-clothing", description: "Stylish men's apparel" }, de: { name: "Herrenmode", slug: "herrenmode", description: "Stilvolle Herrenbekleidung" }, imagePrompt: "Men's fashion clothing", productCount: 10, isFeatured: true },
      { en: { name: "Women's Clothing", slug: "womens-clothing", description: "Elegant women's fashion" }, de: { name: "Damenmode", slug: "damenmode", description: "Elegante Damenmode" }, imagePrompt: "Women's fashion dress", productCount: 10, isFeatured: true },
      { en: { name: "Shoes", slug: "shoes", description: "Footwear for every style" }, de: { name: "Schuhe", slug: "schuhe", description: "Schuhe für jeden Stil" }, imagePrompt: "Stylish shoes collection", productCount: 6, isFeatured: false },
      { en: { name: "Accessories", slug: "accessories", description: "Complete your look" }, de: { name: "Accessoires", slug: "accessoires", description: "Vervollständigen Sie Ihren Look" }, imagePrompt: "Fashion accessories watch and bag", productCount: 6, isFeatured: false },
      { en: { name: "Jewelry", slug: "jewelry", description: "Elegant jewelry pieces" }, de: { name: "Schmuck", slug: "schmuck", description: "Elegante Schmuckstücke" }, imagePrompt: "Elegant jewelry necklace", productCount: 6, isFeatured: false },
    ],
  },
  {
    en: { name: "Home & Garden", slug: "home-garden", description: "Transform your living space with our home and garden essentials." },
    de: { name: "Haus & Garten", slug: "haus-garten", description: "Verwandeln Sie Ihren Wohnraum mit unseren Haus- und Gartenprodukten." },
    imagePrompt: "Beautiful home interior",
    subcategories: [
      { en: { name: "Furniture", slug: "furniture", description: "Quality furniture for every room" }, de: { name: "Möbel", slug: "moebel", description: "Qualitätsmöbel für jeden Raum" }, imagePrompt: "Modern furniture sofa", productCount: 6, isFeatured: false },
      { en: { name: "Kitchen", slug: "kitchen", description: "Essential kitchen items" }, de: { name: "Küche", slug: "kueche", description: "Wichtige Küchenartikel" }, imagePrompt: "Kitchen cookware set", productCount: 6, isFeatured: false },
      { en: { name: "Bedding", slug: "bedding", description: "Comfortable bedding sets" }, de: { name: "Bettwaren", slug: "bettwaren", description: "Bequeme Bettwäsche-Sets" }, imagePrompt: "Luxury bedding set", productCount: 6, isFeatured: false },
      { en: { name: "Decor", slug: "decor", description: "Beautiful home decorations" }, de: { name: "Dekoration", slug: "dekoration", description: "Schöne Wohndekoration" }, imagePrompt: "Home decor items", productCount: 6, isFeatured: false },
      { en: { name: "Garden", slug: "garden", description: "Garden tools and plants" }, de: { name: "Garten", slug: "garten", description: "Gartenwerkzeuge und Pflanzen" }, imagePrompt: "Garden tools set", productCount: 6, isFeatured: false },
    ],
  },
  {
    en: { name: "Sports & Outdoors", slug: "sports-outdoors", description: "Gear up for adventure with our sports and outdoor equipment." },
    de: { name: "Sport & Outdoor", slug: "sport-outdoor", description: "Rüsten Sie sich für Abenteuer mit unserer Sport- und Outdoor-Ausrüstung." },
    imagePrompt: "Sports equipment collection",
    subcategories: [
      { en: { name: "Fitness Equipment", slug: "fitness-equipment", description: "Home gym essentials" }, de: { name: "Fitnessgeräte", slug: "fitnessgeraete", description: "Essentials für das Heim-Fitnessstudio" }, imagePrompt: "Fitness dumbbells and equipment", productCount: 6, isFeatured: false },
      { en: { name: "Outdoor Gear", slug: "outdoor-gear", description: "Adventure-ready equipment" }, de: { name: "Outdoor-Ausrüstung", slug: "outdoor-ausruestung", description: "Ausrüstung für Abenteuer" }, imagePrompt: "Camping tent outdoor", productCount: 6, isFeatured: false },
      { en: { name: "Sports Apparel", slug: "sports-apparel", description: "Performance sportswear" }, de: { name: "Sportbekleidung", slug: "sportbekleidung", description: "Leistungssportbekleidung" }, imagePrompt: "Athletic sportswear", productCount: 6, isFeatured: false },
      { en: { name: "Cycling", slug: "cycling", description: "Bikes and cycling accessories" }, de: { name: "Radfahren", slug: "radfahren", description: "Fahrräder und Fahrradzubehör" }, imagePrompt: "Cycling helmet and gear", productCount: 6, isFeatured: false },
      { en: { name: "Water Sports", slug: "water-sports", description: "Water sports equipment" }, de: { name: "Wassersport", slug: "wassersport", description: "Wassersportausrüstung" }, imagePrompt: "Swimming goggles", productCount: 6, isFeatured: false },
    ],
  },
  {
    en: { name: "Beauty & Health", slug: "beauty-health", description: "Look and feel your best with our beauty and wellness products." },
    de: { name: "Beauty & Gesundheit", slug: "beauty-gesundheit", description: "Sehen und fühlen Sie sich mit unseren Beauty- und Wellnessprodukten bestens." },
    imagePrompt: "Beauty skincare products",
    subcategories: [
      { en: { name: "Skincare", slug: "skincare", description: "Premium skincare products" }, de: { name: "Hautpflege", slug: "hautpflege", description: "Premium-Hautpflegeprodukte" }, imagePrompt: "Skincare moisturizer cream", productCount: 6, isFeatured: false },
      { en: { name: "Makeup", slug: "makeup", description: "Professional makeup products" }, de: { name: "Make-up", slug: "make-up", description: "Professionelle Make-up-Produkte" }, imagePrompt: "Makeup lipstick cosmetics", productCount: 6, isFeatured: false },
      { en: { name: "Haircare", slug: "haircare", description: "Hair care essentials" }, de: { name: "Haarpflege", slug: "haarpflege", description: "Haarpflege-Essentials" }, imagePrompt: "Haircare shampoo bottles", productCount: 6, isFeatured: false },
      { en: { name: "Fragrances", slug: "fragrances", description: "Signature scents" }, de: { name: "Düfte", slug: "duefte", description: "Charakteristische Düfte" }, imagePrompt: "Perfume bottle elegant", productCount: 6, isFeatured: false },
      { en: { name: "Wellness", slug: "wellness", description: "Health and wellness products" }, de: { name: "Wellness", slug: "wellness", description: "Gesundheits- und Wellnessprodukte" }, imagePrompt: "Yoga mat wellness", productCount: 6, isFeatured: false },
    ],
  },
  {
    en: { name: "Books & Media", slug: "books-media", description: "Expand your mind with our collection of books and media." },
    de: { name: "Bücher & Medien", slug: "buecher-medien", description: "Erweitern Sie Ihren Horizont mit unserer Sammlung von Büchern und Medien." },
    imagePrompt: "Book collection library",
    subcategories: [
      { en: { name: "Fiction", slug: "fiction", description: "Bestselling fiction books" }, de: { name: "Belletristik", slug: "belletristik", description: "Bestseller-Belletristik" }, imagePrompt: "Fiction novel book", productCount: 6, isFeatured: false },
      { en: { name: "Non-Fiction", slug: "non-fiction", description: "Informative non-fiction" }, de: { name: "Sachbücher", slug: "sachbuecher", description: "Informative Sachbücher" }, imagePrompt: "Non-fiction guide book", productCount: 6, isFeatured: false },
      { en: { name: "E-Books", slug: "e-books", description: "Digital reading options" }, de: { name: "E-Books", slug: "e-books", description: "Digitale Lesemöglichkeiten" }, imagePrompt: "E-reader device", productCount: 6, isFeatured: false },
      { en: { name: "Audiobooks", slug: "audiobooks", description: "Listen on the go" }, de: { name: "Hörbücher", slug: "hoerbuecher", description: "Hören Sie unterwegs" }, imagePrompt: "Audiobook headphones", productCount: 6, isFeatured: false },
      { en: { name: "Magazines", slug: "magazines", description: "Popular magazines" }, de: { name: "Zeitschriften", slug: "zeitschriften", description: "Beliebte Zeitschriften" }, imagePrompt: "Magazine stack", productCount: 6, isFeatured: false },
    ],
  },
];

const PRODUCT_TEMPLATES: Record<string, any> = {
  smartphones: {
    en: { name: "Smartphone", description: "High-performance smartphone with advanced features and stunning display.", features: ["5G connectivity", "OLED display", "Fast charging", "Water resistant"], specifications: { Display: '6.5" OLED', Battery: "5000mAh", Camera: "108MP" } },
    de: { name: "Smartphone", description: "Hochleistungs-Smartphone mit erweiterten Funktionen und atemberaubendem Display.", features: ["5G-Konnektivität", "OLED-Display", "Schnellladung", "Wasserdicht"], specifications: { Display: '6,5" OLED', Akku: "5000mAh", Kamera: "108MP" } },
    imagePrompt: "Modern smartphone with sleek design",
    priceRange: [299, 1299],
    brands: ["TechPro", "NovaMobile", "QuantumPhone", "EliteX", "ZenithMobile"],
    hasVariants: true,
    variantColors: [{ name: "Midnight Black", hex: "#1a1a1a" }, { name: "Pearl White", hex: "#f5f5f5" }, { name: "Ocean Blue", hex: "#1e40af" }, { name: "Rose Gold", hex: "#b76e79" }],
    variantSizes: ["128GB", "256GB", "512GB"],
  },
  laptops: {
    en: { name: "Laptop", description: "Powerful laptop for productivity and entertainment.", features: ["Fast processor", "Long battery life", "Slim design", "HD webcam"], specifications: { Processor: "Intel i7", RAM: "16GB", Storage: "512GB SSD" } },
    de: { name: "Laptop", description: "Leistungsstarker Laptop für Produktivität und Unterhaltung.", features: ["Schneller Prozessor", "Lange Akkulaufzeit", "Schlankes Design", "HD-Webcam"], specifications: { Prozessor: "Intel i7", RAM: "16GB", Speicher: "512GB SSD" } },
    imagePrompt: "Modern laptop computer silver",
    priceRange: [499, 2499],
    brands: ["ProBook", "TechMaster", "EliteCompute", "NovaBook"],
    hasVariants: false,
  },
  headphones: {
    en: { name: "Headphones", description: "Premium audio experience with noise cancellation.", features: ["Active noise cancellation", "Wireless", "30-hour battery", "Premium drivers"], specifications: { Driver: "40mm", Battery: "30 hours", Weight: "250g" } },
    de: { name: "Kopfhörer", description: "Premium-Audioerlebnis mit Geräuschunterdrückung.", features: ["Aktive Geräuschunterdrückung", "Kabellos", "30 Stunden Akku", "Premium-Treiber"], specifications: { Treiber: "40mm", Akku: "30 Stunden", Gewicht: "250g" } },
    imagePrompt: "Premium wireless over-ear headphones",
    priceRange: [79, 449],
    brands: ["AudioPro", "SoundMax", "HiFiElite", "BassKing"],
    hasVariants: false,
  },
  tablets: {
    en: { name: "Tablet", description: "Versatile tablet for work and entertainment.", features: ["High-resolution display", "Stylus support", "All-day battery", "Lightweight design"], specifications: { Display: '11" LCD', Battery: "8000mAh", Weight: "450g" } },
    de: { name: "Tablet", description: "Vielseitiges Tablet für Arbeit und Unterhaltung.", features: ["Hochauflösendes Display", "Stylus-Unterstützung", "Ganztägiger Akku", "Leichtes Design"], specifications: { Display: '11" LCD', Akku: "8000mAh", Gewicht: "450g" } },
    imagePrompt: "Modern tablet device with stylus",
    priceRange: [299, 999],
    brands: ["TabPro", "SlateMax", "ViewPad", "TouchElite"],
    hasVariants: false,
  },
  cameras: {
    en: { name: "Camera", description: "Professional-grade camera for stunning photos.", features: ["High megapixel sensor", "4K video", "Image stabilization", "Weather sealed"], specifications: { Sensor: "24.2MP", Video: "4K 60fps", ISO: "100-51200" } },
    de: { name: "Kamera", description: "Professionelle Kamera für atemberaubende Fotos.", features: ["Hochauflösender Sensor", "4K-Video", "Bildstabilisierung", "Wetterfest"], specifications: { Sensor: "24,2MP", Video: "4K 60fps", ISO: "100-51200" } },
    imagePrompt: "Professional DSLR camera with lens",
    priceRange: [399, 2999],
    brands: ["PhotoPro", "LensMaster", "CapturePro", "ImageElite"],
    hasVariants: false,
  },
  "mens-clothing": {
    en: { name: "Shirt", description: "Stylish and comfortable shirt for any occasion.", features: ["Premium cotton", "Breathable fabric", "Modern fit", "Easy care"], specifications: { Material: "100% Cotton", Fit: "Regular", Care: "Machine wash" } },
    de: { name: "Hemd", description: "Stilvolles und bequemes Hemd für jeden Anlass.", features: ["Premium-Baumwolle", "Atmungsaktiver Stoff", "Moderne Passform", "Pflegeleicht"], specifications: { Material: "100% Baumwolle", Passform: "Regular", Pflege: "Maschinenwäsche" } },
    imagePrompt: "Men's formal dress shirt",
    priceRange: [29, 149],
    brands: ["UrbanStyle", "ClassicFit", "ModernMan", "EliteWear"],
    hasVariants: true,
    variantColors: [{ name: "Navy Blue", hex: "#1e3a5f" }, { name: "White", hex: "#ffffff" }, { name: "Black", hex: "#000000" }, { name: "Gray", hex: "#6b7280" }],
    variantSizes: ["S", "M", "L", "XL", "XXL"],
  },
  "womens-clothing": {
    en: { name: "Dress", description: "Elegant dress for special occasions.", features: ["Flattering fit", "Quality fabric", "Timeless design", "Comfortable wear"], specifications: { Material: "Polyester blend", Fit: "A-line", Length: "Midi" } },
    de: { name: "Kleid", description: "Elegantes Kleid für besondere Anlässe.", features: ["Schmeichelhafte Passform", "Hochwertiger Stoff", "Zeitloses Design", "Bequem zu tragen"], specifications: { Material: "Polyester-Mischung", Passform: "A-Linie", Länge: "Midi" } },
    imagePrompt: "Elegant women's dress",
    priceRange: [49, 299],
    brands: ["ChicStyle", "ElegantWear", "FashionElite", "TrendSetters"],
    hasVariants: true,
    variantColors: [{ name: "Black", hex: "#000000" }, { name: "Red", hex: "#dc2626" }, { name: "Navy", hex: "#1e3a5f" }, { name: "Blush", hex: "#fda4af" }],
    variantSizes: ["XS", "S", "M", "L", "XL"],
  },
  shoes: {
    en: { name: "Sneakers", description: "Comfortable sneakers for everyday wear.", features: ["Cushioned sole", "Breathable mesh", "Durable construction", "Stylish design"], specifications: { Upper: "Mesh/Synthetic", Sole: "Rubber", Closure: "Lace-up" } },
    de: { name: "Sneakers", description: "Bequeme Sneakers für den Alltag.", features: ["Gepolsterte Sohle", "Atmungsaktives Mesh", "Langlebige Konstruktion", "Stilvolles Design"], specifications: { Obermaterial: "Mesh/Synthetik", Sohle: "Gummi", Verschluss: "Schnürung" } },
    imagePrompt: "Modern casual sneakers",
    priceRange: [59, 199],
    brands: ["StepPro", "RunElite", "StrideMax", "FootComfort"],
    hasVariants: false,
  },
  accessories: {
    en: { name: "Watch", description: "Elegant timepiece with precision movement.", features: ["Swiss movement", "Sapphire crystal", "Water resistant", "Premium materials"], specifications: { Movement: "Quartz", Case: "Stainless steel", "Water Resistance": "50m" } },
    de: { name: "Uhr", description: "Eleganter Zeitmesser mit Präzisionswerk.", features: ["Schweizer Uhrwerk", "Saphirglas", "Wasserdicht", "Premium-Materialien"], specifications: { Uhrwerk: "Quarz", Gehäuse: "Edelstahl", Wasserdicht: "50m" } },
    imagePrompt: "Elegant wristwatch",
    priceRange: [99, 599],
    brands: ["TimeMaster", "ChronoElite", "WatchPro", "LuxTime"],
    hasVariants: false,
  },
  jewelry: {
    en: { name: "Necklace", description: "Beautiful necklace crafted with care.", features: ["Sterling silver", "Hypoallergenic", "Gift boxed", "Adjustable length"], specifications: { Material: "925 Sterling Silver", "Chain Length": "45cm", Clasp: "Lobster" } },
    de: { name: "Halskette", description: "Schöne, sorgfältig gefertigte Halskette.", features: ["Sterling Silber", "Hypoallergen", "Geschenkverpackung", "Verstellbare Länge"], specifications: { Material: "925 Sterling Silver", Kettenlänge: "45cm", Verschluss: "Karabiner" } },
    imagePrompt: "Elegant silver necklace",
    priceRange: [49, 399],
    brands: ["GemElite", "SparkleJewels", "SilverCraft", "LuxGems"],
    hasVariants: false,
  },
  furniture: {
    en: { name: "Chair", description: "Comfortable and stylish seating solution.", features: ["Ergonomic design", "Premium upholstery", "Sturdy frame", "Easy assembly"], specifications: { Material: "Wood/Fabric", "Weight Capacity": "120kg", Dimensions: "45x50x90cm" } },
    de: { name: "Stuhl", description: "Komfortable und stilvolle Sitzmöglichkeit.", features: ["Ergonomisches Design", "Premium-Polsterung", "Stabiler Rahmen", "Einfache Montage"], specifications: { Material: "Holz/Stoff", Belastbarkeit: "120kg", Maße: "45x50x90cm" } },
    imagePrompt: "Modern comfortable chair",
    priceRange: [99, 799],
    brands: ["HomeComfort", "LivingElite", "FurniturePro", "ComfortZone"],
    hasVariants: false,
  },
  kitchen: {
    en: { name: "Cookware Set", description: "Professional-grade cookware for home chefs.", features: ["Non-stick coating", "Even heat distribution", "Dishwasher safe", "Ergonomic handles"], specifications: { Material: "Aluminum/Ceramic", Pieces: "10", "Oven Safe": "Up to 250°C" } },
    de: { name: "Kochgeschirr-Set", description: "Professionelles Kochgeschirr für Hobbyköche.", features: ["Antihaftbeschichtung", "Gleichmäßige Wärmeverteilung", "Spülmaschinenfest", "Ergonomische Griffe"], specifications: { Material: "Aluminium/Keramik", Teile: "10", Backofenfest: "Bis 250°C" } },
    imagePrompt: "Kitchen cookware set pots and pans",
    priceRange: [49, 399],
    brands: ["ChefPro", "KitchenElite", "CookMaster", "GourmetHome"],
    hasVariants: false,
  },
  bedding: {
    en: { name: "Bedding Set", description: "Luxurious bedding for restful sleep.", features: ["100% cotton", "Thread count 400+", "Wrinkle resistant", "Machine washable"], specifications: { Material: "100% Cotton", "Thread Count": "400", Size: "Queen" } },
    de: { name: "Bettwäsche-Set", description: "Luxuriöse Bettwäsche für erholsamen Schlaf.", features: ["100% Baumwolle", "Fadenzahl 400+", "Knitterfrei", "Maschinenwaschbar"], specifications: { Material: "100% Baumwolle", Fadenzahl: "400", Größe: "Queen" } },
    imagePrompt: "Luxury bedding set white sheets",
    priceRange: [79, 299],
    brands: ["SleepWell", "DreamComfort", "RestEasy", "LuxBedding"],
    hasVariants: false,
  },
  decor: {
    en: { name: "Wall Art", description: "Beautiful wall art to enhance your space.", features: ["Gallery quality", "Ready to hang", "Fade resistant", "Various sizes"], specifications: { Material: "Canvas", Frame: "Wood", Size: "60x80cm" } },
    de: { name: "Wandkunst", description: "Schöne Wandkunst zur Verschönerung Ihres Raumes.", features: ["Galeriequalität", "Sofort aufhängbar", "Lichtbeständig", "Verschiedene Größen"], specifications: { Material: "Leinwand", Rahmen: "Holz", Größe: "60x80cm" } },
    imagePrompt: "Abstract wall art canvas",
    priceRange: [29, 199],
    brands: ["ArtHome", "DecorElite", "WallStyle", "HomeArt"],
    hasVariants: false,
  },
};

const PAGES_DATA = [
  { en: { title: "Home", slug: "home", metaTitle: "Omnio - Your Premium E-commerce Destination", metaDescription: "Discover amazing products across electronics, fashion, home & more at Omnio." }, de: { title: "Startseite", slug: "startseite", metaTitle: "Omnio - Ihr Premium E-Commerce Ziel", metaDescription: "Entdecken Sie erstaunliche Produkte aus Elektronik, Mode, Haushalt und mehr bei Omnio." }, template: "home" },
  { en: { title: "About Us", slug: "about", metaTitle: "About Omnio - Our Story", metaDescription: "Learn about Omnio's mission to bring quality products to customers worldwide." }, de: { title: "Über uns", slug: "ueber-uns", metaTitle: "Über Omnio - Unsere Geschichte", metaDescription: "Erfahren Sie mehr über Omnios Mission, Qualitätsprodukte weltweit anzubieten." }, template: "about" },
  { en: { title: "FAQ", slug: "faq", metaTitle: "Frequently Asked Questions - Omnio", metaDescription: "Find answers to common questions about shopping, shipping, and returns at Omnio." }, de: { title: "FAQ", slug: "faq", metaTitle: "Häufig gestellte Fragen - Omnio", metaDescription: "Finden Sie Antworten auf häufige Fragen zu Einkauf, Versand und Rückgabe bei Omnio." }, template: "faq" },
  { en: { title: "Contact", slug: "contact", metaTitle: "Contact Us - Omnio", metaDescription: "Get in touch with Omnio customer support. We're here to help!" }, de: { title: "Kontakt", slug: "kontakt", metaTitle: "Kontaktieren Sie uns - Omnio", metaDescription: "Nehmen Sie Kontakt mit dem Omnio-Kundensupport auf. Wir helfen Ihnen gerne!" }, template: "contact" },
  { en: { title: "Privacy Policy", slug: "privacy-policy", metaTitle: "Privacy Policy - Omnio", metaDescription: "Read about how Omnio protects and handles your personal information." }, de: { title: "Datenschutzerklärung", slug: "datenschutz", metaTitle: "Datenschutzerklärung - Omnio", metaDescription: "Erfahren Sie, wie Omnio Ihre persönlichen Daten schützt und handhabt." }, template: "legal" },
  { en: { title: "Terms of Service", slug: "terms-of-service", metaTitle: "Terms of Service - Omnio", metaDescription: "Review the terms and conditions for using Omnio's services." }, de: { title: "Nutzungsbedingungen", slug: "nutzungsbedingungen", metaTitle: "Nutzungsbedingungen - Omnio", metaDescription: "Lesen Sie die Allgemeinen Geschäftsbedingungen für die Nutzung der Dienste von Omnio." }, template: "legal" },
  { en: { title: "Careers", slug: "careers", metaTitle: "Careers at Omnio - Join Our Team", metaDescription: "Explore exciting career opportunities at Omnio. We're always looking for talented people." }, de: { title: "Karriere", slug: "karriere", metaTitle: "Karriere bei Omnio - Werden Sie Teil unseres Teams", metaDescription: "Entdecken Sie spannende Karrieremöglichkeiten bei Omnio. Wir suchen immer talentierte Menschen." }, template: "careers" },
];

// Page sections generators
function generateHomePageSections(): any[] {
  return [
    { __component: "dynamic-zone.hero-section", title: "Welcome to Omnio", subtitle: "Your Premium E-commerce Destination", ctaText: "Shop Now", ctaLink: "/products" },
    { __component: "dynamic-zone.feature-grid", title: "Why Choose Omnio", features: [{ icon: "truck", title: "Free Shipping", description: "On orders over $50" }, { icon: "shield", title: "Secure Payment", description: "100% secure checkout" }, { icon: "refresh", title: "Easy Returns", description: "30-day return policy" }, { icon: "headphones", title: "24/7 Support", description: "Always here to help" }] },
    { __component: "dynamic-zone.product-carousel", title: "Featured Products", maxItems: 8 },
  ];
}
function generateAboutPageSections(): any[] {
  return [
    { __component: "dynamic-zone.hero-section", title: "About Omnio", subtitle: "Our Story and Mission" },
    { __component: "dynamic-zone.content-block", title: "Our Mission", content: [{ type: "paragraph", children: [{ type: "text", text: "At Omnio, we believe everyone deserves access to quality products at fair prices. Founded in 2020, we've grown from a small startup to a trusted e-commerce destination serving customers worldwide." }] }], backgroundColor: "white" },
    { __component: "dynamic-zone.feature-grid", title: "Our Values", features: [{ icon: "heart", title: "Customer First", description: "Your satisfaction is our priority" }, { icon: "globe", title: "Sustainability", description: "Committed to eco-friendly practices" }, { icon: "users", title: "Community", description: "Building relationships that last" }, { icon: "award", title: "Quality", description: "Only the best products make it to our store" }] },
  ];
}
function generateContactPageSections(): any[] {
  return [
    { __component: "dynamic-zone.hero-section", title: "Contact Us", subtitle: "We'd love to hear from you" },
    { __component: "dynamic-zone.content-block", title: "Get in Touch", content: [{ type: "paragraph", children: [{ type: "text", text: "Have a question or need assistance? Our customer support team is here to help. Reach out to us through any of the channels below." }] }], backgroundColor: "white" },
  ];
}
function generateFAQPageSections(): any[] {
  return [
    { __component: "dynamic-zone.hero-section", title: "Frequently Asked Questions", subtitle: "Find answers to common questions" },
    { __component: "dynamic-zone.content-block", title: "Shipping & Delivery", content: [{ type: "paragraph", children: [{ type: "text", text: "We offer free shipping on orders over $50. Standard delivery takes 3-5 business days. Express shipping options are available at checkout." }] }], backgroundColor: "white" },
    { __component: "dynamic-zone.content-block", title: "Returns & Refunds", content: [{ type: "paragraph", children: [{ type: "text", text: "We offer a 30-day return policy on most items. Items must be unused and in original packaging. Refunds are processed within 5-7 business days." }] }], backgroundColor: "gray" },
  ];
}
function generateLegalPageSections(isPrivacy: boolean): any[] {
  const title = isPrivacy ? "Privacy Policy" : "Terms of Service";
  const content = isPrivacy ? "This privacy policy describes how Omnio collects, uses, and protects your personal information when you use our services." : "By using Omnio's services, you agree to be bound by these terms of service. Please read them carefully before making a purchase.";
  return [{ __component: "dynamic-zone.hero-section", title, subtitle: "Last updated: November 2025" }, { __component: "dynamic-zone.content-block", title: "Overview", content: [{ type: "paragraph", children: [{ type: "text", text: content }] }], backgroundColor: "white" }];
}
function generateCareersPageSections(): any[] {
  return [
    { __component: "dynamic-zone.hero-section", title: "Join Our Team", subtitle: "Build your career at Omnio" },
    { __component: "dynamic-zone.content-block", title: "Why Work at Omnio?", content: [{ type: "paragraph", children: [{ type: "text", text: "At Omnio, we're building the future of e-commerce. Join a team of passionate individuals who are committed to creating exceptional shopping experiences." }] }], backgroundColor: "white" },
    { __component: "dynamic-zone.feature-grid", title: "Benefits", features: [{ icon: "briefcase", title: "Remote Work", description: "Work from anywhere" }, { icon: "heart", title: "Health Insurance", description: "Comprehensive coverage" }, { icon: "book", title: "Learning Budget", description: "Grow your skills" }, { icon: "calendar", title: "Flexible Hours", description: "Work-life balance" }] },
  ];
}
function getPageSections(template: string): any[] {
  switch (template) {
    case "home": return generateHomePageSections();
    case "about": return generateAboutPageSections();
    case "contact": return generateContactPageSections();
    case "faq": return generateFAQPageSections();
    case "legal": return generateLegalPageSections(template === "legal");
    case "careers": return generateCareersPageSections();
    default: return [];
  }
}

// Main bootstrap
export default {
  register() { },

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    strapi.log.info('='.repeat(60));
    strapi.log.info('[Bootstrap] Localized content generator final version');
    strapi.log.info('='.repeat(60));

    if (CONFIG.DRY_RUN) strapi.log.info('[Bootstrap] DRY_RUN is true — no DB writes will be performed');

    loadMediaMap();

    const stats = { categories: 0, subcategories: 0, products: 0, pages: 0, imagesGenerated: 0, imagesFailed: 0, errors: [] as string[] };
    const startTime = Date.now();

    // Step 1 categories
    strapi.log.info('\n[1/3] Creating categories (two-pass)...');
    const categoryMap = new Map<string, StrapiID>();

    for (const catData of CATEGORIES_DATA) {
      try {
        const existing = await strapi.entityService.findMany(CONFIG.CONTENT_TYPES.category as any, { filters: { slug: catData.en.slug, locale: CONFIG.SOURCE_LOCALE }, limit: 1 });
        let enParent: any = null;
        if (existing && existing.length > 0) {
          enParent = existing[0];
          categoryMap.set(catData.en.slug, enParent.id);
          strapi.log.info(`Skipping existing EN category: ${catData.en.slug}`);
        } else {
          const media = findMediaByName(`category-${catData.en.slug}`) || findMediaByName(catData.en.slug);
          const imageId = media ? media.id : null;
          const enPayload: any = { name: catData.en.name, slug: catData.en.slug, description: catData.en.description, image: imageId ? imageId : null, locale: CONFIG.SOURCE_LOCALE, publishedAt: CONFIG.DRY_RUN ? undefined : new Date().toISOString() };

          try {
            if (CONFIG.DRY_RUN) {
              strapi.log.info(`[DRY RUN] create EN category: ${enPayload.slug}`);
              enParent = { id: `dry-en-cat-${Math.random().toString(36).slice(2, 8)}`, documentId: enPayload.documentId ?? null, attributes: enPayload, slug: enPayload.slug };
            } else {
              const ok = await isSlugAvailable(strapi, CONFIG.CONTENT_TYPES.category, enPayload.slug, CONFIG.SOURCE_LOCALE, enPayload.documentId);
              if (!ok) throw new Error(`Slug conflict for category "${enPayload.slug}"`);
              enParent = await withRetry(() => strapi.entityService.create(CONFIG.CONTENT_TYPES.category as any, { data: enPayload, populate: ['localizations'] }));
            }
            categoryMap.set(catData.en.slug, enParent.id ?? enParent.attributes?.id);
            stats.categories++;
            strapi.log.info(`Created EN category: ${catData.en.name}`);
          } catch (e: any) {
            strapi.log.error(`Failed to create EN category ${catData.en.slug}: ${e.message}`);
            stats.errors.push(`Category EN ${catData.en.slug}: ${e.message}`);
            enParent = null;
          }

          if (enParent) {
            try {
              const dePayload = { name: catData.de.name, slug: enParent.slug || catData.en.slug, description: catData.de.description, locale: CONFIG.TARGET_LOCALE, localizations: [{ id: enParent.id }], documentId: enParent.documentId || enParent.id };
              if (CONFIG.DRY_RUN) {
                strapi.log.info(`[DRY RUN] create DE category: ${dePayload.slug}`);
              } else {
                await createLocalizedEntry(strapi, CONFIG.CONTENT_TYPES.category, { data: dePayload, populate: { localizations: true } });
              }
              strapi.log.info(`  Created DE category for ${catData.en.slug}`);
            } catch (e: any) {
              strapi.log.warn(`  DE creation failed for category ${catData.en.slug}: ${e.message}`);
              stats.errors.push(`Category DE ${catData.en.slug}: ${e.message}`);
            }
          }
        }

        // Subcategories
        for (const sub of catData.subcategories) {
          try {
            const existingSub = await strapi.entityService.findMany(CONFIG.CONTENT_TYPES.category as any, { filters: { slug: sub.en.slug, locale: CONFIG.SOURCE_LOCALE }, limit: 1 });
            if (existingSub && existingSub.length > 0) {
              categoryMap.set(sub.en.slug, existingSub[0].id);
              strapi.log.info(`Skipping existing EN subcategory: ${sub.en.slug}`);
              continue;
            }

            const media = findMediaByName(`subcategory-${sub.en.slug}`) || findMediaByName(sub.en.slug);
            const imageId = media ? media.id : null;
            const parentId = categoryMap.get(catData.en.slug);
            if (!parentId) {
              strapi.log.warn(`Parent category missing for ${sub.en.slug}; skipping subcategory creation`);
              continue;
            }

            const enSubPayload: any = { name: sub.en.name, slug: sub.en.slug, description: sub.en.description, parent: parentId, image: imageId ? imageId : null, locale: CONFIG.SOURCE_LOCALE, publishedAt: CONFIG.DRY_RUN ? undefined : new Date().toISOString() };

            let createdEnSub: any = null;
            if (CONFIG.DRY_RUN) {
              strapi.log.info(`[DRY RUN] create EN subcategory: ${enSubPayload.slug}`);
              createdEnSub = { id: `dry-en-sub-${Math.random().toString(36).slice(2, 8)}`, documentId: enSubPayload.documentId ?? null, attributes: enSubPayload, slug: enSubPayload.slug };
            } else {
              const ok = await isSlugAvailable(strapi, CONFIG.CONTENT_TYPES.category, enSubPayload.slug, CONFIG.SOURCE_LOCALE, enSubPayload.documentId);
              if (!ok) throw new Error(`Slug conflict for subcategory "${enSubPayload.slug}"`);
              createdEnSub = await withRetry(() => strapi.entityService.create(CONFIG.CONTENT_TYPES.category as any, { data: enSubPayload, populate: ['localizations'] }));
            }
            categoryMap.set(sub.en.slug, createdEnSub.id ?? createdEnSub.attributes?.id);
            stats.subcategories++;
            strapi.log.info(`  Created EN subcategory: ${sub.en.name}`);

            try {
              const deSubPayload = { name: sub.de.name, slug: createdEnSub.slug || sub.en.slug, description: sub.de.description, locale: CONFIG.TARGET_LOCALE, localizations: [{ id: createdEnSub.id }], documentId: createdEnSub.documentId || createdEnSub.id };
              if (CONFIG.DRY_RUN) {
                strapi.log.info(`[DRY RUN] create DE subcategory: ${deSubPayload.slug}`);
              } else {
                await createLocalizedEntry(strapi, CONFIG.CONTENT_TYPES.category, { data: deSubPayload, populate: { localizations: true } });
              }
              strapi.log.info(`    Created DE subcategory for ${sub.en.slug}`);
            } catch (e: any) {
              strapi.log.warn(`    DE creation failed for subcategory ${sub.en.slug}: ${e.message}`);
              stats.errors.push(`Subcategory DE ${sub.en.slug}: ${e.message}`);
            }
          } catch (e: any) {
            strapi.log.error(`  Error creating subcategory ${sub.en.slug}: ${e.message}`);
            stats.errors.push(`Subcategory ${sub.en.slug}: ${e.message}`);
          }
        }
      } catch (e: any) {
        strapi.log.error(`Error processing category ${catData.en.slug}: ${e.message}`);
        stats.errors.push(`Category ${catData.en.slug}: ${e.message}`);
      }
    }

    // Patch DE parent relations
    if (!CONFIG.DRY_RUN) {
      strapi.log.info('Patching DE parent relations for categories...');
      for (const catData of CATEGORIES_DATA) {
        for (const sub of catData.subcategories) {
          try {
            const enParent = (await strapi.entityService.findMany(CONFIG.CONTENT_TYPES.category as any, { filters: { slug: catData.en.slug, locale: CONFIG.SOURCE_LOCALE }, limit: 1 }))?.[0];
            const deParent = enParent ? (await strapi.entityService.findMany(CONFIG.CONTENT_TYPES.category as any, { filters: { documentId: enParent.documentId || enParent.id, locale: CONFIG.TARGET_LOCALE }, limit: 1 }))?.[0] : null;
            const deChild = (await strapi.entityService.findMany(CONFIG.CONTENT_TYPES.category as any, { filters: { slug: sub.en.slug, locale: CONFIG.TARGET_LOCALE }, limit: 1 }))?.[0];
            if (deParent && deChild) {
              await withRetry(() => strapi.entityService.update(CONFIG.CONTENT_TYPES.category as any, deChild.id, { data: { parent: deParent.id }, locale: CONFIG.TARGET_LOCALE }));
            }
          } catch (e: any) {
            strapi.log.warn(`Failed to patch DE parent for ${sub.en.slug}: ${e.message}`);
          }
        }
      }
    }

    // Step 2 products
    strapi.log.info('\n[2/3] Creating products (two-pass)...');

    for (const catData of CATEGORIES_DATA) {
      for (const sub of catData.subcategories) {
        const template = PRODUCT_TEMPLATES[sub.en.slug] ?? PRODUCT_TEMPLATES[sub.en.slug.replace(/-/g, '_')];
        if (!template) {
          strapi.log.info(`[Bootstrap] No product template for ${sub.en.slug}, skipping.`);
          continue;
        }

        const categoryId = categoryMap.get(sub.en.slug);
        if (!categoryId && !CONFIG.DRY_RUN) {
          strapi.log.warn(`[Bootstrap] No EN category id for ${sub.en.slug}, skipping products.`);
          continue;
        }

        for (let i = 0; i < sub.productCount; i++) {
          try {
            const brand = template.brands[Math.floor(Math.random() * template.brands.length)];
            const productNumber = i + 1;
            const enName = `${brand} ${template.en.name} ${productNumber}`;
            const deName = `${brand} ${template.de.name} ${productNumber}`;
            const slug = enName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

            const existing = await strapi.entityService.findMany(CONFIG.CONTENT_TYPES.product as any, { filters: { slug, locale: CONFIG.SOURCE_LOCALE }, limit: 1 });
            if (existing && existing.length > 0) continue;

            const mediaMain = findMediaByName(`product-${slug}`) || findMediaByName(slug) || null;
            const mainImageId = mediaMain ? mediaMain.id : null;

            const price = Math.round((Math.random() * (template.priceRange[1] - template.priceRange[0]) + template.priceRange[0]) * 100) / 100;
            const hasDiscount = Math.random() > 0.7;
            const originalPrice = hasDiscount ? Math.round(price * (1 + Math.random() * 0.3) * 100) / 100 : null;

            const productPayload: any = {
              name: enName,
              slug,
              price,
              originalPrice,
              description: createBlocksContent(template.en.description),
              features: createFeaturesBlocks(template.en.features || []),
              specifications: createSpecificationsBlocks(template.en.specifications || {}),
              brand,
              rating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
              reviewsCount: Math.floor(Math.random() * 500) + 10,
              inStock: Math.random() > 0.1,
              isFeatured: sub.isFeatured || false,
              category: categoryId,
              image: mainImageId ? mainImageId : null,
              images: null,
              locale: CONFIG.SOURCE_LOCALE,
              publishedAt: CONFIG.DRY_RUN ? undefined : new Date().toISOString(),
            };

            let createdEnProduct: any = null;
            if (CONFIG.DRY_RUN) {
              strapi.log.info(`[DRY RUN] create EN product: ${productPayload.slug}`);
              createdEnProduct = { id: `dry-en-prod-${Math.random().toString(36).slice(2, 8)}`, documentId: productPayload.documentId ?? null, attributes: productPayload, slug: productPayload.slug };
            } else {
              const ok = await isSlugAvailable(strapi, CONFIG.CONTENT_TYPES.product, productPayload.slug, CONFIG.SOURCE_LOCALE, productPayload.documentId);
              if (!ok) throw new Error(`Slug conflict for product "${productPayload.slug}"`);
              createdEnProduct = await withRetry(() => strapi.entityService.create(CONFIG.CONTENT_TYPES.product as any, { data: productPayload, populate: ['localizations'] }));
            }
            stats.products++;
            strapi.log.info(`Created EN product: ${enName}`);

            try {
              const dePayload: any = {
                name: deName,
                slug: createdEnProduct.slug || slug,
                description: createBlocksContent(template.de.description),
                features: createFeaturesBlocks(template.de.features || []),
                specifications: createSpecificationsBlocks(template.de.specifications || {}),
                locale: CONFIG.TARGET_LOCALE,
                localizations: [{ id: createdEnProduct.id }],
                documentId: createdEnProduct.documentId || createdEnProduct.id,
              };
              if (CONFIG.DRY_RUN) {
                strapi.log.info(`[DRY RUN] create DE product: ${dePayload.slug}`);
              } else {
                await createLocalizedEntry(strapi, CONFIG.CONTENT_TYPES.product, { data: dePayload, populate: { localizations: true } });
              }
              strapi.log.info(`  Created DE product for ${enName}`);
            } catch (e: any) {
              strapi.log.warn(`  DE creation failed for product ${enName}: ${e.message}`);
              stats.errors.push(`Product DE ${enName}: ${e.message}`);
            }
          } catch (e: any) {
            strapi.log.error(`Error creating product in ${sub.en.slug}: ${e.message}`);
            stats.errors.push(`Product ${sub.en.slug}: ${e.message}`);
          }
        }
      }
    }

    // Patch DE product categories
    if (!CONFIG.DRY_RUN) {
      strapi.log.info('Patching DE product categories...');
      const allEnProducts = await strapi.entityService.findMany(CONFIG.CONTENT_TYPES.product as any, { filters: { locale: CONFIG.SOURCE_LOCALE }, populate: ['category', 'localizations'] });
      for (const enP of allEnProducts) {
        try {
          if (!enP.category) continue;
          const enDocId = enP.documentId || enP.id;
          const deProduct = await strapi.entityService.findMany(CONFIG.CONTENT_TYPES.product as any, { filters: { documentId: enDocId, locale: CONFIG.TARGET_LOCALE }, limit: 1 });
          if (!deProduct || deProduct.length === 0) continue;
          const deProdId = deProduct[0].id;
          const enCategoryDocId = enP.category?.documentId;
          if (!enCategoryDocId) continue;
          const deCategory = await strapi.entityService.findMany(CONFIG.CONTENT_TYPES.category as any, { filters: { documentId: enCategoryDocId, locale: CONFIG.TARGET_LOCALE }, limit: 1 });
          if (!deCategory || deCategory.length === 0) continue;
          await withRetry(() => strapi.entityService.update(CONFIG.CONTENT_TYPES.product as any, deProdId, { data: { category: deCategory[0].id }, locale: CONFIG.TARGET_LOCALE }));
        } catch (e: any) {
          strapi.log.warn(`Failed to patch DE product category: ${e.message}`);
        }
      }
    }

    // Step 3 pages
    strapi.log.info('\n[3/3] Creating pages...');

    for (const pageData of PAGES_DATA) {
      try {
        const existing = await strapi.entityService.findMany(CONFIG.CONTENT_TYPES.page as any, { filters: { slug: pageData.en.slug, locale: CONFIG.SOURCE_LOCALE }, limit: 1 });
        if (existing && existing.length > 0) {
          strapi.log.info(`Skipping existing page: ${pageData.en.slug}`);
          continue;
        }

        const sections = getPageSections(pageData.template);
        const enPayload: any = { title: pageData.en.title, slug: pageData.en.slug, sections, seo: { metaTitle: pageData.en.metaTitle, metaDescription: pageData.en.metaDescription }, locale: CONFIG.SOURCE_LOCALE, isHomepage: pageData.en.slug === 'home' ? true : false, publishedAt: CONFIG.DRY_RUN ? undefined : new Date().toISOString() };

        let createdEnPage: any = null;
        if (CONFIG.DRY_RUN) {
          strapi.log.info(`[DRY RUN] create EN page: ${enPayload.slug}`);
          createdEnPage = { id: `dry-en-page-${Math.random().toString(36).slice(2, 8)}`, documentId: enPayload.documentId ?? null, attributes: enPayload, slug: enPayload.slug };
        } else {
          const ok = await isSlugAvailable(strapi, CONFIG.CONTENT_TYPES.page, enPayload.slug, CONFIG.SOURCE_LOCALE, enPayload.documentId);
          if (!ok) throw new Error(`Slug conflict for page "${enPayload.slug}"`);
          createdEnPage = await withRetry(() => strapi.entityService.create(CONFIG.CONTENT_TYPES.page as any, { data: enPayload, populate: ['localizations'] }));
        }
        stats.pages++;
        strapi.log.info(`Created EN page: ${pageData.en.title}`);

        try {
          const dePayload: any = { title: pageData.de.title, slug: createdEnPage.slug || pageData.en.slug, locale: CONFIG.TARGET_LOCALE, sections: getPageSections(pageData.template), localizations: [{ id: createdEnPage.id }], documentId: createdEnPage.documentId || createdEnPage.id };
          if (CONFIG.DRY_RUN) {
            strapi.log.info(`[DRY RUN] create DE page: ${dePayload.slug}`);
          } else {
            await createLocalizedEntry(strapi, CONFIG.CONTENT_TYPES.page, { data: dePayload, populate: { localizations: true } });
          }
          strapi.log.info(`  Created DE page for ${pageData.en.title}`);
        } catch (e: any) {
          strapi.log.warn(`  DE creation failed for page ${pageData.en.title}: ${e.message}`);
          stats.errors.push(`Page DE ${pageData.en.title}: ${e.message}`);
        }
      } catch (e: any) {
        strapi.log.error(`Error creating page ${pageData.en.title}: ${e.message}`);
        stats.errors.push(`Page ${pageData.en.title}: ${e.message}`);
      }
    }

    // Publish EN content
    if (!CONFIG.DRY_RUN && CONFIG.PUBLISH_AFTER_CREATE) {
      strapi.log.info('Ensuring EN content is published...');
      const contentTypes = [CONFIG.CONTENT_TYPES.page, CONFIG.CONTENT_TYPES.category, CONFIG.CONTENT_TYPES.product];
      for (const uid of contentTypes) {
        try {
          const drafts = await strapi.entityService.findMany(uid as any, { filters: { locale: CONFIG.SOURCE_LOCALE, publishedAt: { $null: true } }, limit: 1000 });
          for (const d of drafts) {
            try {
              await withRetry(() => strapi.entityService.update(uid as any, d.id, { data: { publishedAt: new Date().toISOString() }, locale: CONFIG.SOURCE_LOCALE }));
            } catch (e: any) {
              strapi.log.warn(`Failed to publish ${uid} ${d.id}: ${e.message}`);
            }
          }
        } catch (e: any) {
          strapi.log.warn(`Publish check failed for ${uid}: ${e.message}`);
        }
      }
    }

    // Summary
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    strapi.log.info('\n' + '='.repeat(60));
    strapi.log.info('[Bootstrap] LOCALIZATION RUN COMPLETE');
    strapi.log.info(`Duration: ${duration}s`);
    strapi.log.info(`Categories: ${stats.categories}`);
    strapi.log.info(`Subcategories: ${stats.subcategories}`);
    strapi.log.info(`Products: ${stats.products}`);
    strapi.log.info(`Pages: ${stats.pages}`);
    if (stats.errors.length > 0) {
      strapi.log.error(`Errors (${stats.errors.length}):`);
      stats.errors.forEach((e, i) => strapi.log.error(`  ${i + 1}. ${e}`));
    }
    if (CONFIG.DRY_RUN) {
      strapi.log.info('\n*** This was a DRY RUN - No data was actually created ***');
    }
    strapi.log.info('='.repeat(60));
  },
};
