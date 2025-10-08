const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../../controllers/auth/auth-controller");
const Order = require("../../models/Order");
const User = require("../../models/User");
const transporter = require("../../config/nodemailer");
const createOrderConfirmationEmail = require("../../helpers/emailTemplates/orderConfirmation");
const Product = require('../../models/Product')

const sendOrderConfirmationEmail = async (order, user) => {
  const emailContent = createOrderConfirmationEmail(order, user);
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: emailContent.subject,
    html: emailContent.html,
  };
  return await transporter.sendMail(mailOptions);
};

const updateStock = async (items) => {
  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product || product.stock < item.quantity) {
      throw new Error(`Product ${product?.productName || "Unknown"} is out of stock`);
    }
    
    // Deduct stock
    product.stock -= item.quantity;

    // Update stock status
    if (product.stock <= 0) {
      product.stockStatus = 'out_of_stock';
    } else if (product.stock <= product.lowStockThreshold) {
      product.stockStatus = 'low_stock';
    } else {
      product.stockStatus = 'in_stock';
    }

    await product.save();
  }
};

const sendAdminOrderNotification = async (order, user) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: `New Order Received - #${order._id}`,
    html: `
 <h2>New Order Notification</h2>
 <p><strong>Order ID:</strong> #${order._id}</p>
 <p><strong>Customer Name:</strong> ${user.userName}</p>
 <p><strong>Email:</strong> ${user.email}</p>
 <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
 
 <h3>Order Items</h3>
 <table style="width: 100%; border-collapse: collapse;">
  <tr style="background-color: #f8f9fa;">
  <th style="padding: 10px; border: 1px solid #dee2e6;">Product</th>
  <th style="padding: 10px; border: 1px solid #dee2e6;">Quantity</th>
  <th style="padding: 10px; border: 1px solid #dee2e6;">Price/Unit</th>
  <th style="padding: 10px; border: 1px solid #dee2e6;">Subtotal</th>
  </tr>
  ${order.items
    .map(
      (item) => `
  <tr>
   <td style="padding: 10px; border: 1px solid #dee2e6;">${
     item.productId.productName
   }</td>
   <td style="padding: 10px; border: 1px solid #dee2e6; text-align: center;">${
     item.quantity
   }</td>
   <td style="padding: 10px; border: 1px solid #dee2e6; text-align: right;">₹${
     item.productId.salePrice
   }</td>
   <td style="padding: 10px; border: 1px solid #dee2e6; text-align: right;">₹${
     item.quantity * item.productId.salePrice
   }</td>
  </tr>
  `
    )
    .join("")}
  <tr style="background-color: #f8f9fa;">
  <td colspan="3" style="padding: 10px; border: 1px solid #dee2e6; text-align: right;"><strong>Total Amount:</strong></td>
  <td style="padding: 10px; border: 1px solid #dee2e6; text-align: right;"><strong>₹${
    order.totalAmount
  }</strong></td>
  </tr>
 </table>
 
 <h3>Shipping Address</h3>
 <p>${order.shippingAddress.address}</p>
 <p>${order.shippingAddress.city}, ${order.shippingAddress.pincode}</p>
 <p>Phone: ${order.shippingAddress.phone}</p>
 `,
  };
  return await transporter.sendMail(mailOptions);
};

router.post("/create", authMiddleware, async (req, res) => {
  try {
    console.log("Order Routes - Creating new order for user:", req.user.id);
    const { items, totalAmount, shippingAddress } = req.body;

    // Step 1: Check and update stock
    await updateStock(items);

    // Step 2: Create the order
    const order = new Order({
      userId: req.user.id,
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount,
      shippingAddress,
      statusHistory: [
        {
          status: "pending",
          timestamp: new Date(),
          note: "Order created",
        },
      ],
    });

    const savedOrder = await order.save();
    console.log("Order Routes - Order saved successfully:", savedOrder._id);

    const populatedOrder = await Order.findById(savedOrder._id)
      .populate("shippingAddress")
      .populate("items.productId");

    const user = await User.findById(req.user.id);

    // Step 3: Send email notifications
    await Promise.all([
      sendOrderConfirmationEmail(populatedOrder, user),
      sendAdminOrderNotification(populatedOrder, user),
    ]);

    res.status(201).json({
      success: true,
      _id: savedOrder._id,
      message: "Order created successfully",
    });
  } catch (error) {
    console.log("Order Routes - Error details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message,
    });
  }
});

router.get("/user/:userId", authMiddleware, async (req, res) => {
  try {
    console.log("Order Routes - Fetching orders for user:", req.params.userId);
    const orders = await Order.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .populate("userId")
      .populate("items.productId")
      .populate("shippingAddress");

    console.log("Order Routes - Orders fetched successfully");
    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.log("Order Routes - Error fetching orders:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
      error: error.message,
    });
  }
});

router.post("/test-email", authMiddleware, async (req, res) => {
  try {
    const testMailOptions = {
      from: process.env.EMAIL_USER,
      to: req.user.email,
      subject: "Test Email from Jewellery Store",
      text: "This is a test email from your jewelry store",
    };

    const result = await transporter.sendMail(testMailOptions);
    console.log("Test email result:", result);
    res.json({ success: true, message: "Test email sent", result });
  } catch (error) {
    console.log("Test email error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
// This is server/routes/shop/orderRoutes.js