const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../controllers/auth/auth-controller');
const Review = require('../../models/Review');

// Create a review
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const review = new Review({
      userId: req.user.id,
      productId,
      rating,
      comment
    });
    await review.save();
    
    res.status(201).json({
      success: true,
      data: review,
      message: 'Review added successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating review',
      error: error.message
    });
  }
});

// Get reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId })
      .populate('userId', 'userName email')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews',
      error: error.message
    });
  }
});

module.exports = router;
// This is server/routes/shop/reviewRoutes.js