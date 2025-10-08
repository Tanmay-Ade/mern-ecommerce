const express = require('express');
const router = express.Router();
const stripe = require('../../config/stripe');
const {authMiddleware} = require('../../controllers/auth/auth-controller');
const Order = require('../../models/Order');
const Cart = require('../../models/Cart');

// Create payment intent
router.post('/create-payment-intent', authMiddleware, async (req, res) => {
  try {
    const { amount, orderId } = req.body;
    
    console.log('=== PAYMENT INTENT DEBUG ===');
    console.log('Raw request body:', req.body);
    console.log('Amount received:', amount, typeof amount);
    console.log('OrderId received:', orderId, typeof orderId);
    console.log('User from auth:', req.user);
    console.log('============================');

    if (!amount || !orderId) {
      return res.status(400).json({
        success: false,
        message: 'Amount and orderId are required'
      });
    }

    // Validate amount is a positive number
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount provided'
      });
    }

    // Check if order exists
    const existingOrder = await Order.findById(orderId);
    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    console.log('Order found:', existingOrder._id);
    console.log('Creating payment intent with amount:', numAmount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(numAmount * 100), // Convert to paise and ensure integer
      currency: 'inr',
      metadata: {
        userId: req.user.id.toString(),
        orderId: orderId.toString()
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log('Payment intent created successfully:', paymentIntent.id);

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        paymentIntentId: paymentIntent.id,
        paymentStatus: 'pending',
        orderUpdateDate: new Date()
      },
      { new: true }
    );

    console.log('Order updated with payment intent ID');

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      orderId: updatedOrder._id,
      paymentIntentId: paymentIntent.id
    });

  } catch (error) {
    console.error('=== PAYMENT INTENT ERROR ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Stripe error type:', error.type);
    console.error('Stripe error code:', error.code);
    console.error('============================');
    
    res.status(500).json({
      success: false,
      message: 'Error creating payment intent',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Payment webhook
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('STRIPE_WEBHOOK_SECRET not configured');
      return res.status(400).json({
        success: false,
        message: 'Webhook secret not configured'
      });
    }

    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    console.log('Webhook event received:', event.type);

    const paymentIntent = event.data.object;
    const orderId = paymentIntent.metadata.orderId;
    const userId = paymentIntent.metadata.userId;

    console.log('Processing webhook for order:', orderId);

    switch (event.type) {
      case 'payment_intent.succeeded':
        console.log('Payment succeeded, updating order and clearing cart');
        await Promise.all([
          Order.findByIdAndUpdate(
            orderId,
            {
              paymentStatus: 'paid',
              orderStatus: 'confirmed',
              paymentId: paymentIntent.id,
              paidAt: new Date(),
              orderUpdateDate: new Date()
            }
          ),
          Cart.findOneAndUpdate(
            { userId },
            { $set: { items: [] } }
          )
        ]);
        console.log('Order and cart updated successfully');
        break;

      case 'payment_intent.payment_failed':
        console.log('Payment failed, updating order status');
        await Order.findByIdAndUpdate(
          orderId,
          {
            paymentStatus: 'failed',
            orderStatus: 'payment_failed',
            orderUpdateDate: new Date()
          }
        );
        console.log('Order status updated to failed');
        break;

      default:
        console.log('Unhandled webhook event type:', event.type);
    }

    res.json({
      success: true,
      received: true,
      type: event.type
    });

  } catch (error) {
    console.error('=== WEBHOOK ERROR ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('====================');
    
    res.status(400).json({
      success: false,
      message: 'Webhook error',
      error: error.message
    });
  }
});

// Manual payment status update (for frontend use)
router.put('/update-payment-status', authMiddleware, async (req, res) => {
  try {
    const { orderId, paymentId, paymentStatus, orderStatus } = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        paymentId: paymentId,
        paymentStatus: paymentStatus,
        orderStatus: orderStatus,
        orderUpdateDate: new Date()
      },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: 'Payment status updated successfully',
      order: updatedOrder
    });

  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating payment status',
      error: error.message
    });
  }
});

module.exports = router;

// This is server/routes/payment/payment-routes.js