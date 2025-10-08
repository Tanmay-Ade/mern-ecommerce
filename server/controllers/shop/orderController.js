const Order = require('../../models/Order');
const Product = require('../../models/Product');

// Create an Order & Reduce Stock
const createOrder = async (req, res) => {
    try {
        const { userId, items, totalAmount, address } = req.body;
        
        if (!userId || !items || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Invalid order data' });
        }

        // Check stock availability and update stock
        for (let item of items) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(404).json({ success: false, message: `Product not found: ${item.productId}` });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({ success: false, message: `Not enough stock for ${product.productName}` });
            }

            // Reduce stock
            product.stock -= item.quantity;
            await product.save();
        }

        // Create order after stock update
        const newOrder = new Order({
            userId,
            items,
            totalAmount,
            address,
            status: 'pending',
            paymentStatus: 'pending'
        });

        await newOrder.save();
        res.status(201).json({ success: true, data: newOrder });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error creating order', error: error.message });
    }
};

// Update Order Status
const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status, note } = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found!" });
        }

        order.status = status;
        order.statusHistory.push({ status, note });
        order.lastModified = new Date();

        await order.save();

        res.status(200).json({ success: true, message: "Order status updated!", data: order });
    } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({ success: false, message: "Error updating order" });
    }
};

// Fetch User Orders
const getUserOrders = async (req, res) => {
    try {
        const { userId } = req.params;

        const orders = await Order.find({ userId })
            .populate("items.productId", "productName image price")
            .populate("shippingAddress");

        res.status(200).json({ success: true, data: orders });
    } catch (error) {
        console.error("Error fetching user orders:", error);
        res.status(500).json({ success: false, message: "Error fetching orders" });
    }
};

// Fetch Order Details
const getOrderDetails = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findById(orderId)
            .populate("items.productId", "productName image price")
            .populate("userId", "name email")
            .populate("shippingAddress");

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found!" });
        }

        res.status(200).json({ success: true, data: order });
    } catch (error) {
        console.error("Error fetching order details:", error);
        res.status(500).json({ success: false, message: "Error fetching order" });
    }
};

module.exports = { createOrder, updateOrderStatus, getUserOrders, getOrderDetails };
// This is server/controllers/shop/orderController.js