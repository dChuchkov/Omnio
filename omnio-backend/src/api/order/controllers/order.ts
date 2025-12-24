import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::order.order', ({ strapi }) => ({
    async place(ctx) {
        try {
            const user = ctx.state.user;
            if (!user) return ctx.unauthorized('You must be logged in');

            // 1. Fetch User's Cart with Items
            const carts = await strapi.entityService.findMany('api::cart.cart', {
                filters: { users_permissions_user: { id: { $eq: user.id } } },
                populate: {
                    cart_items: {
                        populate: {
                            product: true
                        }
                    }
                },
                limit: 1
            });

            const cart = carts?.[0] as any;

            if (!cart || !cart.cart_items || cart.cart_items.length === 0) {
                return ctx.badRequest('Cart is empty');
            }

            // 2. Calculate Total and Prepare Items Snapshot
            let total = 0;
            const itemsSnapshot = [];

            for (const item of cart.cart_items) {
                if (!item.product) continue;

                const itemTotal = Number(item.product.price) * item.quantity;
                total += itemTotal;

                itemsSnapshot.push({
                    productId: item.product.id,
                    documentId: item.product.documentId,
                    name: item.product.name,
                    price: Number(item.product.price),
                    quantity: item.quantity,
                    image: item.product.image // Assuming image is an ID or object, might need more population if full object needed
                });
            }

            if (itemsSnapshot.length === 0) {
                return ctx.badRequest('No valid items in cart');
            }

            // 3. Create Order
            const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

            const newOrder = await strapi.entityService.create('api::order.order', {
                data: {
                    orderNumber,
                    user: user.id,
                    users_permissions_user: user.id, // Link to user (both fields might be used depending on schema setup, usually one is enough but safe to set both if unsure of exact relation name)
                    items: itemsSnapshot,
                    total,
                    state: 'paid', // Simulating immediate payment success
                    paymentMethod: 'Credit Card',
                    publishedAt: new Date(), // Publish immediately
                }
            });

            // 4. Clear Cart Items
            // We delete the cart items associated with this cart
            const itemIds = cart.cart_items.map((item: any) => item.id);

            // Delete items in parallel or loop
            await Promise.all(itemIds.map(id => strapi.entityService.delete('api::cart-item.cart-item', id)));

            // Return the new order
            return { data: newOrder };

        } catch (err: any) {
            strapi.log.error('order.place error', err);
            return ctx.internalServerError('Unable to place order', { message: err.message, details: err.details, stack: err.stack });
        }
    }
}));
