'use strict';

/**
 * cart controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::cart.cart', ({ strapi }) => ({
    async me(ctx) {
        try {
            const user = ctx.state.user;
            if (!user) return ctx.unauthorized('You must be logged in');

            const results = await strapi.entityService.findMany('api::cart.cart', {
                filters: { users_permissions_user: { id: { $eq: user.id } } },
                populate: {
                    cart_items: { populate: { product: { populate: ['image', 'category'] } } },
                    users_permissions_user: true
                },
                limit: 1
            });

            const cart = results?.[0] ?? null;

            // Filter out invalid items (where product is null)
            if (cart && Array.isArray(cart.cart_items)) {
                cart.cart_items = cart.cart_items.filter((ci) => ci && ci.product);
            }

            return { data: cart };
        } catch (err) {
            strapi.log.error('cart.me error', err);
            return ctx.internalServerError('Unable to fetch cart');
        }
    },

    async createForMe(ctx) {
        try {
            const user = ctx.state.user;
            if (!user) return ctx.unauthorized('You must be logged in');

            // Check if exists
            const existing = await strapi.entityService.findMany('api::cart.cart', {
                filters: { users_permissions_user: { id: { $eq: user.id } } },
                limit: 1
            });

            if (existing && existing.length > 0) {
                return { data: existing[0] };
            }

            const newCart = await strapi.entityService.create('api::cart.cart', {
                data: { users_permissions_user: user.id }
            });

            return { data: newCart };
        } catch (err) {
            strapi.log.error('cart.createForMe error', err);
            return ctx.internalServerError('Unable to create cart');
        }
    },

    async addItem(ctx) {
        try {
            const user = ctx.state.user;
            if (!user) return ctx.unauthorized('You must be logged in');

            // Accept either numeric product id or documentId string
            const { product, productDocumentId, quantity = 1 } = ctx.request.body;
            const identifier = productDocumentId ?? product;
            if (!identifier) return ctx.badRequest('product is required');

            const quantityNum = Number(quantity);
            if (isNaN(quantityNum) || quantityNum < 1) {
                return ctx.badRequest('quantity must be a positive integer');
            }

            // Resolve product entity by documentId (string) or numeric id
            let productEntity = null;
            if (typeof identifier === 'string') {
                // find by documentId
                const found = await strapi.entityService.findMany('api::product.product', {
                    filters: { documentId: { $eq: identifier } },
                    limit: 1
                }).catch(() => []);
                productEntity = found?.[0] ?? null;
            } else {
                // numeric id
                productEntity = await strapi.entityService.findOne('api::product.product', identifier).catch(() => null);
            }

            if (!productEntity) return ctx.badRequest('product not found');

            const productId = productEntity.id;

            // find or create cart
            let cart;
            const carts = await strapi.entityService.findMany('api::cart.cart', {
                filters: { users_permissions_user: { id: { $eq: user.id } } },
                limit: 1
            });

            if (carts && carts.length > 0) {
                cart = carts[0];
            } else {
                cart = await strapi.entityService.create('api::cart.cart', { data: { users_permissions_user: user.id } });
            }

            // find existing cart-item for this product in this cart (use resolved productId)
            const existingItems = await strapi.entityService.findMany('api::cart-item.cart-item', {
                filters: { cart: cart.id, product: productId },
                limit: 1
            });

            let cartItem;
            if (existingItems && existingItems.length > 0) {
                const existingItem = existingItems[0];
                cartItem = await strapi.entityService.update('api::cart-item.cart-item', existingItem.documentId, {
                    data: { quantity: Number(existingItem.quantity || 0) + quantityNum }
                });
            } else {
                cartItem = await strapi.entityService.create('api::cart-item.cart-item', {
                    data: {
                        cart: cart.documentId,
                        product: productEntity.documentId, // Use documentId for relation
                        quantity: quantityNum
                    }
                });
            }

            // return the full updated cart (populated)
            const updatedCart = await strapi.entityService.findOne('api::cart.cart', cart.documentId, {
                populate: {
                    cart_items: { populate: { product: { populate: ['image', 'category'] } } },
                    users_permissions_user: true
                }
            });

            if (updatedCart && Array.isArray(updatedCart.cart_items)) {
                updatedCart.cart_items = updatedCart.cart_items.filter((ci) => ci && ci.product);
            }

            return { data: updatedCart };
        } catch (err) {
            strapi.log.error('cart.addItem error', err);
            return ctx.internalServerError('Unable to add item to cart');
        }
    },


    async updateItem(ctx) {
        try {
            const user = ctx.state.user;
            if (!user) return ctx.unauthorized('You must be logged in');

            const { id } = ctx.params; // This is cart-item ID (integer)
            const { quantity } = ctx.request.body;
            const quantityNum = Number(quantity);

            if (isNaN(quantityNum) || quantityNum < 0) {
                return ctx.badRequest('quantity must be a positive integer');
            }

            // Find cart item by ID and verify owner
            const cartItems = await strapi.entityService.findMany('api::cart-item.cart-item', {
                filters: { id: id },
                populate: { cart: { populate: { users_permissions_user: true } } },
                limit: 1
            });

            const itemToUpdate = cartItems?.[0];
            if (!itemToUpdate) return ctx.notFound('Cart item not found');

            const ownerId = itemToUpdate.cart?.users_permissions_user?.id ?? itemToUpdate.cart?.users_permissions_user?.data?.id;
            if (ownerId !== user.id) return ctx.forbidden('Not allowed');

            if (quantityNum === 0) {
                await strapi.entityService.delete('api::cart-item.cart-item', itemToUpdate.documentId);
            } else {
                await strapi.entityService.update('api::cart-item.cart-item', itemToUpdate.documentId, {
                    data: { quantity: quantityNum }
                });
            }

            // return full updated cart (populated)
            const updatedCart = await strapi.entityService.findOne('api::cart.cart', itemToUpdate.cart.documentId, {
                populate: {
                    cart_items: { populate: { product: { populate: ['image', 'category'] } } },
                    users_permissions_user: true
                }
            });

            if (updatedCart && Array.isArray(updatedCart.cart_items)) {
                updatedCart.cart_items = updatedCart.cart_items.filter((ci) => ci && ci.product);
            }

            return { data: updatedCart };
        } catch (err) {
            strapi.log.error('cart.updateItem error', err);
            return ctx.internalServerError('Unable to update cart item');
        }
    },

    async removeItem(ctx) {
        try {
            const user = ctx.state.user;
            if (!user) return ctx.unauthorized('You must be logged in');

            const { id } = ctx.params; // cart-item ID (integer)

            // Find cart item by ID and verify owner
            const cartItems = await strapi.entityService.findMany('api::cart-item.cart-item', {
                filters: { id: id },
                populate: { cart: { populate: { users_permissions_user: true } } },
                limit: 1
            });

            const itemToDelete = cartItems?.[0];
            if (!itemToDelete) return ctx.notFound('Cart item not found');

            const ownerId = itemToDelete.cart?.users_permissions_user?.id ?? itemToDelete.cart?.users_permissions_user?.data?.id;
            if (ownerId !== user.id) return ctx.forbidden('Not allowed');

            await strapi.entityService.delete('api::cart-item.cart-item', itemToDelete.documentId);

            // return full updated cart (populated)
            const updatedCart = await strapi.entityService.findOne('api::cart.cart', itemToDelete.cart.documentId, {
                populate: {
                    cart_items: { populate: { product: { populate: ['image', 'category'] } } },
                    users_permissions_user: true
                }
            });

            if (updatedCart && Array.isArray(updatedCart.cart_items)) {
                updatedCart.cart_items = updatedCart.cart_items.filter((ci) => ci && ci.product);
            }

            return { data: updatedCart };
        } catch (err) {
            strapi.log.error('cart.removeItem error', err);
            return ctx.internalServerError('Unable to remove cart item');
        }
    }
}));
