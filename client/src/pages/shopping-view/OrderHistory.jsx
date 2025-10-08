import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserOrders } from "../../store/shop/order-slice";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

const OrderHistory = () => {
  const dispatch = useDispatch();
  const { orders, isLoading } = useSelector((state) => state.shopOrder);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      dispatch(fetchUserOrders(user.id));
    }
  }, [dispatch, user]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Order History</h1>
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
                  </div>
                  <div>
                    <p className="font-semibold">₹{order.totalAmount}</p>
                    <p className="text-sm capitalize text-gray-500">
                      Status: {order.status}
                    </p>
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

export default OrderHistory;
// client/src/pages/shopping-view/OrderHistory.jsx