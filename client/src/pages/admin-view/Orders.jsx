import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllOrders, updateOrderStatus } from "../../store/shop/order-slice";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

const Orders = () => {
  const dispatch = useDispatch();
  const { orders, isLoading } = useSelector((state) => state.shopOrder);

  useEffect(() => {
    dispatch(fetchAllOrders());
  }, [dispatch]);

  const handleStatusUpdate = (orderId, newStatus) => {
    dispatch(updateOrderStatus({
      orderId,
      status: newStatus,
      note: `Status updated to ${newStatus}`
    }));
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Order Management</h1>
      {isLoading ? (
        <div>Loading orders...</div>
      ) : (
        <div className="grid gap-4">
          {orders?.map((order) => (
            <Card key={order._id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">Order #{order._id}</p>
                    <p className="text-sm text-gray-500">
                      Placed on {formatDate(order.createdAt)}
                    </p>
                    <p className="text-sm">Customer Email: {order.userId?.email}</p>
                  </div>
                  <div>
                    <p className="font-semibold">₹{order.totalAmount}</p>
                    <select
                      className="mt-2 border rounded p-1"
                      value={order.status}
                      onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="payment_failed">Payment Failed</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
// This is client/src/pages/admin-view/Orders.jsx, In this the order has been placed but In dashboard component it is not getting updated and showing total orders - 0 and active status - 0