'use strict';

module.exports = {
    routes: [
        {
            method: 'GET',
            path: '/carts/me',
            handler: 'cart.me',
            config: { auth: { scope: [] } }
        },
        {
            method: 'POST',
            path: '/carts/me',
            handler: 'cart.createForMe',
            config: { auth: { scope: [] } }
        },
        {
            method: 'POST',
            path: '/carts/me/items',
            handler: 'cart.addItem',
            config: { auth: { scope: [] } }
        },
        {
            method: 'PUT',
            path: '/carts/me/items/:id',
            handler: 'cart.updateItem',
            config: { auth: { scope: [] } }
        },
        {
            method: 'DELETE',
            path: '/carts/me/items/:id',
            handler: 'cart.removeItem',
            config: { auth: { scope: [] } }
        }
    ]
};
