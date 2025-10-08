import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Home } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { fetchProductById } from '@/store/shop/product-slice'; // Import function to get a single product
import { useEffect } from 'react';

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const orderDetails = location.state?.orderDetails;

  useEffect(() => {
    console.log('Initial Order Details:', orderDetails);
    
    if (orderDetails?.items?.length) {
      orderDetails.items.forEach(async (item) => {
        try {
          const response = await dispatch(fetchProductById(item.productId)); 
          console.log(`Updated Stock for ${item.productId}:`, response.payload.stock);
        } catch (error) {
          console.error(`Failed to update stock for ${item.productId}`, error);
        }
      });
    }
  }, [dispatch, orderDetails]);

  const handleReturnHome = () => {
    navigate('/shop/home'); // Navigate without unnecessary refetch
  };

  return (
    <div className="max-w-3xl mx-auto p-6 mt-8">
      <div className="text-center mb-8">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold">Order Placed Successfully!</h1>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Order Details</h2>
        <div className="grid gap-4">
          <div className="flex justify-between">
            <span>Order ID:</span>
            <span>{orderDetails?.orderId}</span>
          </div>
          <div className="flex justify-between">
            <span>Amount Paid:</span>
            <span>₹{orderDetails?.amount}</span>
          </div>
        </div>
      </div>

      <div className="text-center mt-8">
        <button 
          onClick={handleReturnHome}
          className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Home className="w-5 h-5 mr-2" />
          Return to Home
        </button>
      </div>
    </div>
  );
};

export default OrderSuccess;
// client/src/pages/order/OrderSuccess.jsx