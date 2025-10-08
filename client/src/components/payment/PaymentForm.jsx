import { useState, useEffect } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { useSelector, useDispatch } from "react-redux";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { clearCart } from "../../store/shop/cart-slice";

const PaymentForm = ({ amount }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isReady, setIsReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const selectedAddress = useSelector((state) => state.shopAddress.selectedAddress);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (stripe && elements) {
      setIsReady(true);
    }
  }, [stripe, elements]);

  const createOrder = async (orderPayload) => {
    if (!user || !token) {
      navigate('/login');
      throw new Error('Please login to continue');
    }

    const response = await fetch(
      "http://localhost:5000/api/shop/orders/create",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(orderPayload),
      }
    );

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  };

  const createPaymentIntent = async (amount, orderId) => {
    const response = await fetch(
      "http://localhost:5000/api/payment/create-payment-intent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: amount,
          orderId: orderId,
        }),
      }
    );

    const data = await response.json();
    if (!data.success) throw new Error(data.message || 'Error creating payment intent');
    return data;
  };

  const clearUserCart = async (userId) => {
    try {
      console.log('Clearing cart for user:', userId);
      
      const response = await fetch(`http://localhost:5000/api/shop/cart/clear/${userId}`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await response.json();
      console.log('Cart clear response:', data);
      
      if (!response.ok || !data.success) {
        console.warn('Failed to clear cart on backend:', data.message);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error clearing cart on backend:', error);
      return false;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    if (!stripe || !elements || !selectedAddress || !cartItems?.items?.length) {
      toast({
        title: "Missing Information",
        description: "Please ensure all required information is provided",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      // Format cart items
      const formattedItems = cartItems.items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        image: item.image,
        quantity: item.quantity,
        price: item.salePrice > 0 ? item.salePrice : item.price,
      }));

      // Create order payload
      const orderPayload = {
        userId: user.id,
        items: formattedItems,
        totalAmount: amount,
        shippingAddress: selectedAddress,
        status: 'pending',
        paymentStatus: 'pending'
      };

      console.log('Creating order...');
      // Create order (this updates stock automatically)
      const orderData = await createOrder(orderPayload);
      
      // Extract order ID
      const orderId = orderData.data?._id || orderData.data?.id || orderData.orderId || orderData._id;
      if (!orderId) {
        throw new Error('Order created but ID not found in response');
      }

      console.log('Creating payment intent...');
      // Create payment intent
      const paymentData = await createPaymentIntent(amount, orderId);

      console.log('Processing payment...');
      // Confirm payment with Stripe
      const paymentResult = await stripe.confirmCardPayment(paymentData.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: { 
            name: user.userName || user.email, 
            email: user.email 
          },
        },
      });

      if (paymentResult.error) {
        throw new Error(paymentResult.error.message);
      }

      console.log('Payment successful! Clearing cart...');

      // Clear cart from backend first
      const cartCleared = await clearUserCart(user.id);
      
      // Clear cart from Redux store
      dispatch(clearCart(user.id));

      console.log('Cart cleared:', cartCleared ? 'successfully' : 'with issues');

      // Navigate to success page
      navigate('/order/success', {
        state: {
          orderDetails: {
            orderId: orderId,
            amount: amount,
            items: formattedItems,
            paymentId: paymentResult.paymentIntent.id,
            status: 'confirmed'
          }
        }
      });

      toast({
        title: "Payment Successful",
        description: "Your order has been placed successfully and cart has been cleared!",
      });

    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: error.message || "An error occurred during payment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isReady) {
    return (
      <div className="w-full max-w-md mx-auto p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading payment form...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-8">
      <div className="p-4 border rounded-lg bg-white shadow-sm">
        <h3 className="text-lg font-medium mb-4">Card Details</h3>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#424770",
                "::placeholder": {
                  color: "#aab7c4",
                },
              },
              invalid: {
                color: "#9e2146",
              },
            },
          }}
        />
      </div>

      <div className="p-4 border rounded-lg bg-gray-50">
        <h4 className="font-medium mb-2">Order Summary</h4>
        <div className="space-y-1 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Items ({cartItems?.items?.length || 0})</span>
            <span>₹{amount}</span>
          </div>
          <div className="flex justify-between font-medium text-gray-900 pt-2 border-t">
            <span>Total</span>
            <span>₹{amount}</span>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full px-6 py-3 text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        onClick={handleSubmit}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Processing...
          </div>
        ) : (
          `Pay ₹${amount}`
        )}
      </button>

      <p className="text-xs text-gray-500 text-center">
        Your payment is secured by Stripe. Cart will be cleared after successful payment.
      </p>
    </div>
  );
};

export default PaymentForm;

// This is client/src/components/payment/PaymentForm.jsx