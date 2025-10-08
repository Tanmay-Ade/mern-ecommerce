const Cart = require("../../models/Cart");
const Product = require("../../models/Product");

// Helper Function: Populate Cart Items
const populateCartItems = async (cart) => {
  const items = await Promise.all(cart.items.map(async (item) => {
    const product = await Product.findById(item.productId);
    if (!product) return null;
    
    return {
      productId: product._id,
      image: product.image,
      productName: product.productName,
      price: product.price,
      salePrice: product.salePrice,
      quantity: item.quantity,
      availableStock: product.stock
    };
  }));
  return items.filter(item => item !== null);
};

// Fetch Cart Items
const fetchCartItems = async (req, res) => {
  try {
    const { userId } = req.params;
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(200).json({ success: true, data: { items: [] } });
    }
    const populatedItems = await populateCartItems(cart);
    return res.status(200).json({ 
      success: true, 
      data: { ...cart._doc, items: populatedItems } 
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: "Failed to fetch cart items" 
    });
  }
};

// Add to Cart (Simple - No Stock Deduction)
const addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;
    // Check if product exists and has enough stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found" 
      });
    }
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }
    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );
    if (itemIndex === -1) {
      // Check if we can add this quantity
      if (quantity > product.stock) {
        return res.status(400).json({ 
          success: false, 
          message: `Only ${product.stock} items available` 
        });
      }
      cart.items.push({ productId, quantity });
    } else {
      // Check if we can add more quantity
      const newQuantity = cart.items[itemIndex].quantity + quantity;
      if (newQuantity > product.stock) {
        return res.status(400).json({ 
          success: false, 
          message: `Only ${product.stock} items available` 
        });
      }
      cart.items[itemIndex].quantity = newQuantity;
    }
    await cart.save();
    const populatedItems = await populateCartItems(cart);
    
    res.status(200).json({ 
      success: true, 
      data: { ...cart._doc, items: populatedItems } 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Failed to add item to cart" 
    });
  }
};

// Update Cart Item Quantity
const updateCartItemQty = async (req, res) => {
  try {
    const { userId } = req.params;
    const { productId, quantity } = req.body;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found" 
      });
    }
    if (quantity > product.stock) {
      return res.status(400).json({ 
        success: false, 
        message: `Only ${product.stock} items available` 
      });
    }
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ 
        success: false, 
        message: "Cart not found" 
      });
    }
    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = quantity;
      await cart.save(); 
      const populatedItems = await populateCartItems(cart);
      return res.status(200).json({ 
        success: true, 
        data: { ...cart._doc, items: populatedItems } 
      });
    }
    return res.status(404).json({ 
      success: false, 
      message: "Item not found in cart" 
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Delete from Cart
const deleteCartItem = async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ 
        success: false, 
        message: "Cart not found" 
      });
    }
    cart.items = cart.items.filter(
      item => item.productId.toString() !== productId
    );
    await cart.save();
    const populatedItems = await populateCartItems(cart);
    res.status(200).json({ 
      success: true, 
      data: { ...cart._doc, items: populatedItems } 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Failed to remove item from cart" 
    });
  }
};

// Clear Cart - NEW FUNCTION
const clearCart = async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log('Clearing cart for user:', userId);
    
    const cart = await Cart.findOneAndUpdate(
      { userId },
      { $set: { items: [] } },
      { new: true }
    );

    if (!cart) {
      // If no cart exists, create an empty one
      const newCart = new Cart({ userId, items: [] });
      await newCart.save();
      return res.status(200).json({
        success: true,
        message: "Cart cleared successfully",
        data: { items: [] }
      });
    }

    console.log('Cart cleared successfully for user:', userId);
    
    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      data: { ...cart._doc, items: [] }
    });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clear cart",
      error: error.message
    });
  }
};

module.exports = {
  fetchCartItems,
  addToCart,
  updateCartItemQty,
  deleteCartItem,
  clearCart
};

// This is server/controllers/shop/cartControllers.js