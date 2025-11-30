export default {
    async beforeCreate(event) {
        const { data, locale } = event.params;
        // console.log(`[Page:beforeCreate] Params:`, JSON.stringify(event.params, null, 2));

        const slug = data.slug;
        if (!slug) return;

        const targetLocale = locale || data.locale || 'en';
        const documentId = data.documentId;

        const filters: any = {
            slug: slug,
            locale: targetLocale,
        };

        if (documentId) {
            filters.documentId = { $ne: documentId };
        }

        const existing = await strapi.documents('api::page.page').findFirst({
            filters: filters,
        });

        if (existing) {
            // console.error(`[Page:beforeCreate] Duplicate found! Slug: ${slug}, Locale: ${targetLocale}`);
            throw new Error(`Slug "${slug}" is already used in locale "${targetLocale}". Choose a different slug.`);
        }
    },

    async beforeUpdate(event) {
        const { data, documentId, locale } = event.params;
        // console.log(`[Page:beforeUpdate] Params:`, JSON.stringify(event.params, null, 2));

        if (!data?.slug) return;

        const slug = data.slug;
        const targetLocale = locale || data.locale || 'en';

        // CRITICAL FIX: Check data.documentId as well
        const currentDocumentId = documentId || event.params.where?.documentId || data.documentId;

        const filters: any = {
            slug: slug,
            locale: targetLocale,
        };

        if (currentDocumentId) {
            filters.documentId = { $ne: currentDocumentId };
        } else {
            // console.warn(`[Page:beforeUpdate] WARNING: No currentDocumentId found!`);
        }

        const existing = await strapi.documents('api::page.page').findFirst({
            filters: filters,
        });

        if (existing) {
            // console.error(`[Page:beforeUpdate] Duplicate found! Existing ID: ${existing.documentId}`);
            throw new Error(`Slug "${slug}" is already used in locale "${targetLocale}". Choose a different slug.`);
        }
    },
};
