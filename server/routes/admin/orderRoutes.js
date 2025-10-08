const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../controllers/auth/auth-controller');
const Order = require('../../models/Order');

// Get all orders
router.get('/all', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate('userId', 'name email')
      .populate('items.productId')
      .populate('shippingAddress');
      
    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
});

// Update order status
router.put('/update-status/:orderId', authMiddleware, async (req, res) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.status = status;
    order.statusHistory.push({
      status,
      note,
      timestamp: new Date()
    });
    
    order.lastModified = new Date();
    await order.save();

    // Populate user data before sending response
    const populatedOrder = await Order.findById(order._id)
      .populate('userId', 'name email')
      .populate('items.productId')
      .populate('shippingAddress');

    res.json({
      success: true,
      data: populatedOrder,
      message: 'Order status updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating order status',
      error: error.message
    });
  }
});

module.exports = router;
// This is server/routes/admin/orderRoutes.js