export default {
    async beforeCreate(event) {
        const { data, locale } = event.params;
        const slug = data?.slug;
        if (!slug) return;

        // Get locale from params first (entityService passes it here), then data, then default
        const targetLocale = locale || data?.locale || 'en';
        const uid = 'api::product.product';

        // Performance: limit to 1 since we only need to know if ANY exists
        const existing = await strapi.entityService.findMany(uid, {
            filters: { slug, locale: targetLocale },
            limit: 1
        });

        if (!existing || existing.length === 0) return;

        const existingEntry = existing[0];

        // Defensive fetch: if payload lacks documentId/localizations but has id, fetch it
        if (!data?.documentId && !Array.isArray(data?.localizations) && data?.id) {
            try {
                const incoming = await strapi.entityService.findOne(uid, data.id, {
                    populate: ['localizations']
                });
                if (incoming?.documentId) {
                    data.documentId = incoming.documentId;
                }
            } catch (e) {
                // If fetch fails, continue with existing checks
            }
        }

        // Check if existing entry is the same logical document
        const isSameDocument =
            // 1) documentId match
            (data?.documentId && existingEntry.documentId &&
                String(data.documentId) === String(existingEntry.documentId)) ||

            // 2) localizations array contains existing entry
            (Array.isArray(data?.localizations) && data.localizations.length > 0 &&
                (() => {
                    const locIds = data.localizations.map(l =>
                        typeof l === 'object' ? (l.id || l.documentId) : l
                    );
                    return locIds.includes(existingEntry.id) ||
                        locIds.includes(existingEntry.documentId);
                })()) ||

            // 3) id match (rare on create)
            (data?.id && existingEntry.id && Number(data.id) === Number(existingEntry.id));

        if (isSameDocument) return;

        throw new Error(`Slug "${slug}" is already used in locale "${targetLocale}". Choose a different slug.`);
    },

    async beforeUpdate(event) {
        const { data, where, locale } = event.params;
        if (!data?.slug) return;

        const slug = data.slug;
        // Get locale from params first (entityService passes it here), then data, then default
        const targetLocale = locale || data?.locale || 'en';
        const uid = 'api::product.product';
        let currentId = where?.id;

        // Defensive fetch: if where.id is missing but documentId present, find current entry
        if (!currentId && data?.documentId) {
            try {
                const current = await strapi.entityService.findMany(uid, {
                    filters: { documentId: data.documentId, locale: targetLocale },
                    limit: 1
                });
                currentId = current?.[0]?.id;
            } catch (e) {
                // Continue without currentId
            }
        }

        // Performance: limit to 2 (current + potential duplicate)
        const existing = await strapi.entityService.findMany(uid, {
            filters: { slug, locale: targetLocale },
            limit: 2
        });

        if (!existing || existing.length === 0) return;

        // Filter out the current entry
        const others = existing.filter(e => e.id !== currentId);

        if (others.length === 0) return;

        // Defensive fetch: if payload lacks documentId/localizations, fetch current entry
        if (!data?.documentId && !Array.isArray(data?.localizations) && currentId) {
            try {
                const current = await strapi.entityService.findOne(uid, currentId, {
                    populate: ['localizations']
                });
                if (current?.documentId) {
                    data.documentId = current.documentId;
                }
            } catch (e) {
                // Continue with existing checks
            }
        }

        // Check if any other entry is the same logical document
        const isSameDocument = others.some(e =>
            // 1) documentId match
            (data?.documentId && e.documentId &&
                String(data.documentId) === String(e.documentId)) ||

            // 2) localizations array contains other entry
            (Array.isArray(data?.localizations) && data.localizations.length > 0 &&
                (() => {
                    const locIds = data.localizations.map(l =>
                        typeof l === 'object' ? (l.id || l.documentId) : l
                    );
                    return locIds.includes(e.id) || locIds.includes(e.documentId);
                })())
        );

        if (isSameDocument) return;

        // throw new Error(`Slug "${slug}" is already used in locale "${targetLocale}". Choose a different slug.`);
    }
};
