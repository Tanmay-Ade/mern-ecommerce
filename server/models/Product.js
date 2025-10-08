const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  image: { 
    type: String, 
    required: true 
  },
  additionalImages: [String],
  productName: { 
    type: String, 
    required: true 
  },
  productDescription: { 
    type: String, 
    required: true 
  },
  recipient: { 
    type: String, 
    required: true 
  },
  category: { 
    type: String, 
    required: true 
  },
  jewellery: { 
    type: String, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true 
  },
  salePrice: { 
    type: Number, 
    default: 0 
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: Number.isInteger,
      message: "Stock must be a whole number"
    }
  },
  stockSettings: {
    lowStockThreshold: {
      type: Number,
      default: 5
    },
    notifyOnLow: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual properties
ProductSchema.virtual('stockStatus').get(function() {
  if (this.stock <= 0) return 'out_of_stock';
  if (this.stock <= this.stockSettings.lowStockThreshold) return 'low_stock';
  return 'in_stock';
});

ProductSchema.virtual('stockValue').get(function() {
  return this.stock * this.price;
});

// Stock management methods
ProductSchema.methods.updateStock = async function(quantity, action) {
  if (action === 'decrease' && quantity > this.stock) {
    throw new Error(`Insufficient stock available. Current: ${this.stock}, Requested: ${quantity}`);
  }

  this.stock += action === 'increase' ? quantity : -quantity;
  await this.save();
  return this;
};

module.exports = mongoose.model("Product", ProductSchema);
// This is server/models/Product.js