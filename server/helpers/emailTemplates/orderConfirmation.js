const createOrderConfirmationEmail = (order, user) => {
  // Format shipping address with line breaks and styling
  const address = order.shippingAddress;
  const formattedAddress = address ? `
    <div style="border: 1px solid #ddd; padding: 15px; border-radius: 5px;">
      <p style="margin: 5px 0"><strong>Street:</strong> ${address.address}</p>
      <p style="margin: 5px 0"><strong>City:</strong> ${address.city}</p>
      <p style="margin: 5px 0"><strong>Pincode:</strong> ${address.pincode}</p>
      <p style="margin: 5px 0"><strong>Phone:</strong> ${address.phone}</p>
      ${address.notes ? `<p style="margin: 5px 0"><strong>Notes:</strong> ${address.notes}</p>` : ''}
    </div>
  ` : 'Address not provided';

  // Format order items with better styling
  const itemsList = order.items.map(item => `
    <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
      <p style="margin: 5px 0"><strong>${item.productId.productName || 'Product Name'}</strong></p>
      <p style="margin: 5px 0">Quantity: ${item.quantity}</p>
      <p style="margin: 5px 0">Price: ₹${item.productId.salePrice}</p>
      <p style="margin: 5px 0">Subtotal: ₹${order.totalAmount}</p>
    </div>
    
    `).join('');
    
  return {
    subject: `Order Confirmed - #${order._id}`,
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h1 style="color: #333; text-align: center;">Thank You for Your Order!</h1>
        <div style="background-color: #f8f8f8; padding: 20px; border-radius: 5px;">
          <h2>Order Details</h2>
          <p><strong>Order Number:</strong> #${order._id}</p>
          <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
          <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
          
          <h3>Items Ordered:</h3>
          ${itemsList}
          
          <div style="margin-top: 20px;">
            <h3>Shipping Address:</h3>
            ${formattedAddress}
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
          <p>We'll notify you when your order ships.</p>
          <p>Thank you for shopping with us!</p>
        </div>
      </div>
    `
  };
};
module.exports = createOrderConfirmationEmail;
// This is server/helpers/emailTemplates/orderConfirmation.js