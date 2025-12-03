export default {
    async beforeCreate(event) {
        const { data, locale } = event.params;
        const slug = data?.slug;
        if (!slug) return;

        const targetLocale = locale || data?.locale || 'en';
        if (targetLocale !== 'en') return; // enforce uniqueness only on canonical locale

        const uid = 'api::page.page';

        // If any entry exists with same slug in EN, ensure it's the same document
        const existing = await strapi.entityService.findMany(uid, {
            filters: { slug, locale: targetLocale },
            limit: 1,
        });

        if (!existing || existing.length === 0) return;

        const existingEntry = existing[0];

        // Try to populate documentId if missing
        if (!data?.documentId && !Array.isArray(data?.localizations) && data?.id) {
            try {
                const incoming = await strapi.entityService.findOne(uid, data.id, { populate: ['localizations'] });
                if (incoming?.documentId) data.documentId = incoming.documentId;
            } catch (e) { /* ignore */ }
        }

        const isSameDocument =
            (data?.documentId && existingEntry.documentId && String(data.documentId) === String(existingEntry.documentId)) ||
            (Array.isArray(data?.localizations) && data.localizations.some(l => {
                const id = typeof l === 'object' ? (l.id || l.documentId) : l;
                return id === existingEntry.id || id === existingEntry.documentId;
            })) ||
            (data?.id && existingEntry.id && Number(data.id) === Number(existingEntry.id));

        if (isSameDocument) return;

        throw new Error(`Slug "${slug}" is already used in locale "${targetLocale}". Choose a different slug.`);
    },

    async beforeUpdate(event) {
        const { data, where, locale } = event.params;

        // Skip slug check if this is just a publish operation (not changing slug)
        if (!data?.slug) return;

        // Skip if this is a publish/unpublish operation (publishedAt is being changed)
        const isPublishOperation = data.publishedAt !== undefined && Object.keys(data).length <= 3;
        if (isPublishOperation) return;

        const slug = data.slug;
        const targetLocale = locale || data?.locale || 'en';
        if (targetLocale !== 'en') return;

        const uid = 'api::page.page';
        let currentId = where?.id;

        if (!currentId && data?.documentId) {
            try {
                const current = await strapi.entityService.findMany(uid, {
                    filters: { documentId: data.documentId, locale: targetLocale },
                    limit: 1,
                });
                currentId = current?.[0]?.id;
            } catch (e) { /* ignore */ }
        }

        const existing = await strapi.entityService.findMany(uid, {
            filters: { slug, locale: targetLocale },
            limit: 2,
        });

        if (!existing || existing.length === 0) return;

        const others = existing.filter(e => e.id !== currentId);
        if (others.length === 0) return;

        if (!data?.documentId && !Array.isArray(data?.localizations) && currentId) {
            try {
                const current = await strapi.entityService.findOne(uid, currentId, { populate: ['localizations'] });
                if (current?.documentId) data.documentId = current.documentId;
            } catch (e) { /* ignore */ }
        }

        const isSameDocument = others.some(e =>
            (data?.documentId && e.documentId && String(data.documentId) === String(e.documentId)) ||
            (Array.isArray(data?.localizations) && data.localizations.some(l => {
                const id = typeof l === 'object' ? (l.id || l.documentId) : l;
                return id === e.id || id === e.documentId;
            }))
        );

        if (isSameDocument) return;

        // Strict mode: block update if slug collides with another document
        throw new Error(`Slug "${slug}" is already used in locale "${targetLocale}". Choose a different slug.`);
    }
};
