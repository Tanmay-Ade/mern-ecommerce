const { imageUploadUtil } = require("../../helpers/cloudinary");
const Product = require("../../models/Product");

const handleImageUpload = async (req, res) => {
  try {
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const url = "data:" + req.file.mimetype + ";base64," + b64;
    const result = await imageUploadUtil(url);

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Error occurred",
    });
  }
};

const handleMultipleImageUpload = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files uploaded",
      });
    }

    const uploadPromises = req.files.map((file) => {
      const b64 = Buffer.from(file.buffer).toString("base64");
      const url = "data:" + file.mimetype + ";base64," + b64;
      return imageUploadUtil(url);
    });

    const results = await Promise.all(uploadPromises);

    res.status(200).json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("Error in handleMultipleImageUpload:", error);
    res.status(500).json({
      success: false,
      message: "Error occurred while uploading images",
    });
  }
};

const updateProductStock = async (req, res) => {
  const { items } = req.body;
  
  try {
    const stockUpdates = await Promise.all(items.map(async item => {
      const product = await Product.findById(item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);
      
      const newStock = Math.max(0, product.stock - item.quantity);
      const stockStatus = newStock === 0 ? 'out_of_stock' : 
                         newStock <= product.lowStockThreshold ? 'low_stock' : 
                         'in_stock';

      return Product.findByIdAndUpdate(
        item.productId,
        { 
          $set: { stock: newStock, stockStatus },
          $push: { 
            stockHistory: {
              quantity: item.quantity,
              type: 'decrease',
              reason: 'Sale'
            }
          }
        },
        { new: true }
      );
    }));

    res.status(200).json({
      success: true,
      message: "Stock updated successfully",
      updates: stockUpdates
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error occurred while updating stock"
    });
  }
};

const addProduct = async (req, res) => {
  try {
    const {
      productName,
      productDescription,
      recipient,
      category,
      jewellery,
      price,
      salePrice,
      stock,
      image,
      additionalImages,
      lowStockThreshold
    } = req.body;

    const stockStatus = stock <= 0 ? 'out_of_stock' : 
                       stock <= (lowStockThreshold || 5) ? 'low_stock' : 
                       'in_stock';

    const productData = {
      image: image || "",
      additionalImages: additionalImages || [],
      productName,
      productDescription,
      recipient,
      category,
      jewellery,
      price,
      salePrice,
      stock,
      lowStockThreshold,
      stockStatus,
      stockHistory: [{
        quantity: stock,
        type: 'increase',
        reason: 'Initial stock'
      }]
    };

    const newlyCreatedProduct = new Product(productData);
    await newlyCreatedProduct.save();

    res.status(201).json({
      success: true,
      data: newlyCreatedProduct,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occurred",
    });
  }
};

const fetchAllProducts = async (req, res) => {
  try {
    const listOfProducts = await Product.find({})
      .select('+stockHistory')
      .sort({ createdAt: -1 });

    const productsWithStats = listOfProducts.map(product => ({
      ...product._doc,
      stockValue: product.stock * product.price,
      isLowStock: product.stock <= product.lowStockThreshold,
      needsRestock: product.stock === 0
    }));

    res.status(200).json({
      success: true,
      data: productsWithStats,
      stats: {
        totalProducts: productsWithStats.length,
        lowStockProducts: productsWithStats.filter(p => p.isLowStock).length,
        outOfStockProducts: productsWithStats.filter(p => p.needsRestock).length
      }
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occurred",
    });
  }
};

const editProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.stock !== undefined) {
      const currentProduct = await Product.findById(id);
      const stockDiff = updateData.stock - currentProduct.stock;
      
      updateData.stockHistory = {
        quantity: Math.abs(stockDiff),
        type: stockDiff > 0 ? 'increase' : 'decrease',
        reason: 'Admin adjustment'
      };
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { 
        $set: updateData,
        $push: updateData.stockHistory ? { stockHistory: updateData.stockHistory } : {}
      },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedProduct,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occurred",
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occurred",
    });
  }
};

module.exports = {
  handleImageUpload,
  handleMultipleImageUpload,
  addProduct,
  fetchAllProducts,
  editProduct,
  deleteProduct,
  updateProductStock
};

// This is server/controllers/admin/productController.js