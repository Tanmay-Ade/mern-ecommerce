const Product = require("../../models/Product");

// Get filtered products with stock status
const getFilteredProducts = async (req, res) => {
  try {
    const {
      recipient = '',
      category = '',
      jewellery = '',
      sortBy = "price-lowtohigh",
      stockStatus = ''
    } = req.query;

    let filters = {};
    if (recipient) {
      filters.recipient = { $in: typeof recipient === 'string' ? recipient.split(',') : recipient };
    }
    if (category) {
      filters.category = { $in: typeof category === 'string' ? category.split(',') : category };
    }
    if (jewellery) {
      filters.jewellery = { $in: typeof jewellery === 'string' ? jewellery.split(',') : jewellery };
    }
    if (stockStatus) {
      filters.stockStatus = stockStatus;
    }

    let sort = {
      "price-lowtohigh": { price: 1 },
      "price-hightolow": { price: -1 },
      "title-atoz": { productName: 1 },
      "title-ztoa": { productName: -1 },
      "stock-lowtohigh": { stock: 1 },
      "stock-hightolow": { stock: -1 }
    }[sortBy] || { price: 1 };

    const products = await Product.find(filters).sort(sort);

    const updatedProducts = products.map(product => ({
      ...product._doc,
      stockMessage: product.stock <= 0 
        ? "Out of stock"
        : product.stock <= product.lowStockThreshold 
        ? `Only ${product.stock} left!`
        : "In stock",
      stockStatus: product.stockStatus,
      isAvailable: product.stock > 0
    }));

    res.status(200).json({
      success: true,
      data: updatedProducts,
      totalProducts: updatedProducts.length,
      lowStockCount: updatedProducts.filter(p => p.stockStatus === 'low_stock').length,
      outOfStockCount: updatedProducts.filter(p => p.stockStatus === 'out_of_stock').length
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Error occurred while fetching products"
    });
  }
};

// Get product details with stock information
const getProductDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found!"
      });
    }

    const productData = {
      ...product._doc,
      stockMessage: product.stock <= 0 
        ? "Out of stock"
        : product.stock <= product.lowStockThreshold 
        ? `Only ${product.stock} left!`
        : "In stock",
      stockStatus: product.stockStatus,
      isAvailable: product.stock > 0,
      stockValue: product.stockValue
    };

    res.status(200).json({
      success: true,
      data: productData
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Error occurred while fetching product details"
    });
  }
};

// Check stock availability
const checkStockAvailability = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.query;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.status(200).json({
      success: true,
      data: {
        isAvailable: product.stock >= quantity,
        currentStock: product.stock,
        stockMessage: product.stock <= 0 
          ? "Out of stock"
          : product.stock <= product.lowStockThreshold 
          ? `Only ${product.stock} left!`
          : "In stock",
        stockStatus: product.stockStatus
      }
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Error checking stock availability"
    });
  }
};

// Add stock update and reservation handlers
const updateStock = async (req, res) => {
  try {
    const { items, action } = req.body;
    await Promise.all(items.map(async (item) => {
      const product = await Product.findById(item.productId);
      if (!product) throw new Error(`Product not found: ${item.productId}`);
      await product.updateStock(item.quantity, action);
    }));
    res.json({ success: true, message: "Stock updated successfully" });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

const reserveStock = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const product = await Product.findById(productId);
    if (!product) throw new Error("Product not found");
    
    const reservationId = await product.reserveStock(quantity);
    res.json({ 
      success: true, 
      reservationId,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

module.exports = {
  getFilteredProducts,
  getProductDetails,
  checkStockAvailability,
  updateStock,
  reserveStock
};
// This is server/controllers/shop/productController.js