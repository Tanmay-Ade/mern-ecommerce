const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../controllers/auth/auth-controller');
const Order = require('../../models/Order');

router.get('/dashboard-stats', authMiddleware, async (req, res) => {
  try {
    // Get total orders count
    const totalOrders = await Order.countDocuments();
    
    // Get total revenue
    const revenueResult = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' }
        }
      }
    ]);
    
    // Get unique active customers count
    const activeCustomers = await Order.distinct('userId');
    
    // Get recent orders for additional stats
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'userName email')
      .populate('items.productId', 'productName');

    const stats = {
      totalOrders,
      revenue: revenueResult[0]?.totalRevenue || 0,
      activeCustomers: activeCustomers.length,
      recentOrders
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard stats',
      error: error.message
    });
  }
});

module.exports = router;
