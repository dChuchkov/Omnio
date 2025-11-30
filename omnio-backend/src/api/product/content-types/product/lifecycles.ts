export default {
    async beforeCreate(event) {
        const { data, locale } = event.params;
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

        const existing = await strapi.documents('api::product.product').findFirst({
            filters: filters,
        });

        if (existing) {
            throw new Error(`Slug "${slug}" is already used in locale "${targetLocale}". Choose a different slug.`);
        }
    },

    async beforeUpdate(event) {
        const { data, documentId, locale } = event.params;

        if (!data?.slug) return;

        const slug = data.slug;
        const targetLocale = locale || data.locale || 'en';
        const currentDocumentId = documentId || event.params.where?.documentId || data.documentId;

        const filters: any = {
            slug: slug,
            locale: targetLocale,
        };

        if (currentDocumentId) {
            filters.documentId = { $ne: currentDocumentId };
        }

        const existing = await strapi.documents('api::product.product').findFirst({
            filters: filters,
        });

        if (existing) {
            throw new Error(`Slug "${slug}" is already used in locale "${targetLocale}". Choose a different slug.`);
        }
    },
};
