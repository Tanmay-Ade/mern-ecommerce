const mongoose = require('mongoose');


const orderSchema = new mongoose.Schema({
 userId: {

  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
  required: true
 },
 items: [{
  productId: {
   type: mongoose.Schema.Types.ObjectId,
   ref: 'Product',
   required: true
  },
  quantity: {
   type: Number,
   required: true,
   min: 1
  },
  price: {
   type: Number,
   required: true
  }
 }],
 totalAmount: {
  type: Number,
  required: true
 },
 shippingAddress: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Address',
  required: true
 },
 paymentStatus: {
  type: String,
  enum: ['pending', 'paid', 'failed'],
  default: 'pending'
 },
 paymentIntentId: {
  type: String
 },
 status: {
  type: String,
  enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'payment_failed'],
  default: 'pending'
 },
 statusHistory: [{
  status: {
   type: String,
   enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'payment_failed']
  },
  timestamp: {
   type: Date,
   default: Date.now
  },
  note: String
 }],
 paidAt: {
  type: Date
 },
 lastModified: {
  type: Date,
  default: Date.now
 },
 createdAt: {
  type: Date,
  default: Date.now
 }
});


module.exports = mongoose.model('Order', orderSchema);

// This is server/models/Order.js