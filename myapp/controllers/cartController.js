// controllers/cartController.js

const Cart = require('../models/cartModel');

const addItemToCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { itemId, quantity } = req.body;

        if (!itemId || !quantity) {
            return res.status(400).json({ error: 'Item ID and quantity are required.' });
        }

        await Cart.addItem(userId, itemId, quantity);

        res.status(201).json({ message: 'Item added to cart successfully.' });
    } catch (error) {
        console.error('Error adding item to cart:', error);
        res.status(500).json({ error: 'An error occurred while adding item to cart.' });
    }
};

const getUserCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const items = await Cart.getItemsByUser(userId);

        res.status(200).json({ items });
    } catch (error) {
        console.error('Error fetching cart items:', error);
        res.status(500).json({ error: 'An error occurred while fetching cart items.' });
    }
};

const updateCartItemQuantity = async (req, res) => {
    try {
        const userId = req.user.id;
        const { itemId } = req.params;
        const { quantity } = req.body;

        if (quantity === undefined) {
            return res.status(400).json({ error: 'Quantity is required.' });
        }

        await Cart.updateItemQuantity(userId, itemId, quantity);

        res.status(200).json({ message: 'Cart item quantity updated successfully.' });
    } catch (error) {
        console.error('Error updating cart item quantity:', error);
        res.status(500).json({ error: 'An error occurred while updating cart item quantity.' });
    }
};

const removeItemFromCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { itemId } = req.params;

        await Cart.removeItem(userId, itemId);

        res.status(200).json({ message: 'Item removed from cart successfully.' });
    } catch (error) {
        console.error('Error removing item from cart:', error);
        res.status(500).json({ error: 'An error occurred while removing item from cart.' });
    }
};

const clearUserCart = async (req, res) => {
    try {
        const userId = req.user.id;

        await Cart.clearCart(userId);

        res.status(200).json({ message: 'Cart cleared successfully.' });
    } catch (error) {
        console.error('Error clearing cart:', error);
        res.status(500).json({ error: 'An error occurred while clearing cart.' });
    }
};

module.exports = {
    addItemToCart,
    getUserCart,
    updateCartItemQuantity,
    removeItemFromCart,
    clearUserCart
};
