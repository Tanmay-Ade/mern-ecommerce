const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    }
  }],
  metadata: {
    lastUpdated: {
      type: Date,
      default: Date.now
    },
    totalItems: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Update metadata before saving
CartSchema.pre('save', function(next) {
  this.metadata.lastUpdated = new Date();
  this.metadata.totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
  next();
});

module.exports = mongoose.model("Cart", CartSchema);
// This is server/models/Cart.js