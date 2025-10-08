const stripe = require('../../config/stripe');
const Order = require('../../models/Order');

const createPaymentIntent = async (req, res) => {
  try {
    const { amount, orderId } = req.body;
    
    console.log('Payment Intent Request:', { amount, orderId }); // Debug log

    // Validate inputs
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount provided'
      });
    }

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    // Verify order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to paise and ensure integer
      currency: 'inr',
      metadata: {
        userId: order.userId.toString(), // Get userId from order
        orderId: orderId.toString()
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Update order with payment intent id
    await Order.findByIdAndUpdate(orderId, {
      paymentIntentId: paymentIntent.id,
      paymentStatus: 'pending'
    });

    console.log('Payment Intent Created:', paymentIntent.id); // Debug log

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (error) {
    console.error('Payment Intent Error:', error); // Debug log
    res.status(500).json({
      success: false,
      message: 'Error creating payment intent',
      error: error.message
    });
  }
};

const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        await updateOrderStatus(paymentIntent.metadata.orderId, 'paid');
        console.log('Payment succeeded for order:', paymentIntent.metadata.orderId);
        break;
      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        await updateOrderStatus(failedPayment.metadata.orderId, 'failed');
        console.log('Payment failed for order:', failedPayment.metadata.orderId);
        break;
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({
      success: false,
      message: 'Webhook error',
      error: error.message
    });
  }
};

const updateOrderStatus = async (orderId, status) => {
  try {
    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: status,
      orderStatus: status === 'paid' ? 'confirmed' : 'payment_failed',
      orderUpdateDate: new Date()
    });
    console.log(`Order ${orderId} status updated to ${status}`);
  } catch (error) {
    console.error('Error updating order status:', error);
  }
};

// Add this new function for manual payment status update
const updatePaymentStatus = async (req, res) => {
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
};

module.exports = {
  createPaymentIntent,
  handleWebhook,
  updatePaymentStatus
};


// This is server/controllers/payment/payment-controller.js