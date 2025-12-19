/**
 * wishlist controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::wishlist.wishlist', ({ strapi }) => ({
    async find(ctx) {
        const { data, meta } = await super.find(ctx);
        if (Array.isArray(data)) {
            data.forEach((wishlist) => {
                if (Array.isArray(wishlist.products)) {
                    wishlist.products = wishlist.products.filter((p: any) => !!p);
                } else if (wishlist.attributes?.products?.data) {
                    wishlist.attributes.products.data = wishlist.attributes.products.data.filter((p: any) => !!p);
                }
            });
        }
        return { data, meta };
    },

    async findOne(ctx) {
        const { data, meta } = await super.findOne(ctx);
        if (data) {
            if (Array.isArray(data.products)) {
                data.products = data.products.filter((p: any) => !!p);
            } else if (data.attributes?.products?.data) {
                data.attributes.products.data = data.attributes.products.data.filter((p: any) => !!p);
            }
        }
        return { data, meta };
    },

    async update(ctx) {
        const { data, meta } = await super.update(ctx);
        if (data) {
            if (Array.isArray(data.products)) {
                data.products = data.products.filter((p: any) => !!p);
            } else if (data.attributes?.products?.data) {
                data.attributes.products.data = data.attributes.products.data.filter((p: any) => !!p);
            }
        }
        return { data, meta };
    }
}));
