const express = require("express");
const router = express.Router();
const Product = require("../../models/Product");
const { 
  getFilteredProducts, 
  getProductDetails,
  checkStockAvailability,
  updateStock,
  reserveStock 
} = require("../../controllers/shop/productController");

// Get all products
router.get("/get-all", async (req, res) => {
  try {
    const products = await Product.find().select('-reservations -stockHistory');
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch products" });
  }
});

// NEW: Add this route that matches your frontend call
router.get("/get", getFilteredProducts);

// Get filtered products (keep existing for backward compatibility)
router.get("/get-filtered", async (req, res) => {
  try {
    const { filterParams, sortParams } = req.query;
    let query = {};
    let sort = {};

    if (filterParams) {
      const filters = JSON.parse(filterParams);
      if (filters.category) query.category = filters.category;
      if (filters.recipient) query.recipient = filters.recipient;
      if (filters.jewellery) query.jewellery = filters.jewellery;
      if (filters.priceRange) {
        query.price = {
          $gte: filters.priceRange[0],
          $lte: filters.priceRange[1],
        };
      }
      if (filters.timestamp) {
        query.createdAt = { $lte: new Date(Number(filters.timestamp)) };
      }
    }

    if (sortParams) {
      sort = {
        'price-lowtohigh': { price: 1 },
        'price-hightolow': { price: -1 },
        'newest': { createdAt: -1 }
      }[sortParams] || { createdAt: -1 };
    }

    const products = await Product.find(query)
      .sort(sort)
      .select('-reservations -stockHistory');
       
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch filtered products" });
  }
});

// Get single product with real-time stock
router.get("/get/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const availableStock = product.availableStock;
    res.json({
      success: true,
      data: {
        ...product.toObject(),
        availableStock,
        stockStatus: availableStock <= product.stockSettings.lowStockThreshold ? 'low' : 'normal'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch product" });
  }
});

// Update product stock
router.post("/update-stock", async (req, res) => {
  try {
    const { items, action } = req.body;
    const updates = await Promise.all(items.map(async (item) => {
      const product = await Product.findById(item.productId);
      if (!product) {
        throw new Error(`Product with ID ${item.productId} not found`);
      }
      const isIncrease = action === "restore" || action === "increase";
      await product.updateStock(
        item.quantity,
        isIncrease ? "increase" : "decrease",
        `Stock ${action} from cart operation`
      );
      return product;
    }));
    res.json({ success: true, message: "Stock updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Reserve product
router.post('/reserve', async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    console.log("Received reserve request:", { productId, quantity });
    if (!productId || !quantity || quantity <= 0) {
      console.log("Invalid request data:", { productId, quantity });
      return res.status(400).json({
         success: false,
         message: 'Invalid product ID or quantity'
       });
    }

    const product = await Product.findById(productId);
    if (!product) {
      console.log("Product not found for ID:", productId);
      return res.status(404).json({
         success: false,
         message: 'Product not found'
       });
    }

    // Cleanup expired reservations before checking stock
    await product.cleanupExpiredReservations();
    console.log('Stock Check:', {
      productId,
      requestedQuantity: quantity,
      currentStock: product?.stock,
      reservedStock: product?.reservedStock
    });

    const reservation = await product.reserveStock(quantity);
    console.log("Reservation successful:", reservation);
    res.json({
      success: true,
      data: {
        productId,
        reservationId: reservation.reservationId,
        expiresAt: reservation.expiresAt,
        quantity: reservation.quantity,
        availableStock: reservation.availableStock
      }
    });
  } catch (error) {
    if (error.message.includes('Insufficient stock')) {
      console.log("Insufficient stock error:", error.message);
      return res.status(400).json({
         success: false,
         message: error.message
       });
    } 
    console.error('Reservation error:', error);
    res.status(500).json({
       success: false,
       message: 'Failed to reserve product'
     });
  }
});

module.exports = router;

// This is server/routes/shop/productsRoutes.js