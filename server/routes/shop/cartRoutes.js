const express = require("express");
const {
  addToCart,
  fetchCartItems,
  updateCartItemQty,
  deleteCartItem,
  clearCart,
} = require("../../controllers/shop/cartController");
const router = express.Router();
const { authMiddleware } = require("../../controllers/auth/auth-controller");

// Add item to cart
router.post('/add', authMiddleware, addToCart);

// Get cart items
router.get('/get/:userId', authMiddleware, fetchCartItems);

// Update cart item quantity
router.put('/update/:userId', authMiddleware, updateCartItemQty);

// Delete item from cart
router.delete('/:userId/:productId', authMiddleware, deleteCartItem);

// Clear cart
router.post('/clear/:userId', authMiddleware, clearCart);

module.exports = router;

// This is server/routes/shop/cartRoutes.js