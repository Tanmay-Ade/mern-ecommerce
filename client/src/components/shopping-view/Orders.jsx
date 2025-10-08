import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getOrderDetails } from "@/store/shop/order-slice";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Dialog } from "../ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import ShoppingOrderDetails from "./OrderDetails";
import { formatDate } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const ShoppingOrders = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { orders, error, authError, isLoading } = useSelector((state) => state.shopOrder);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (user?._id) {
      dispatch(getOrderDetails(user._id));
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (authError) {
      navigate('/login');
    }
  }, [authError, navigate]);

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setOpenDetailsDialog(true);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Order Date</TableHead>
              <TableHead>Order Status</TableHead>
              <TableHead>Order Price</TableHead>
              <TableHead>
                <span className="sr-only">Details</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders?.map((order) => (
              <TableRow key={order._id}>
                <TableCell>{order._id}</TableCell>
                <TableCell>{formatDate(order.createdAt)}</TableCell>
                <TableCell>{order.status}</TableCell>
                <TableCell>₹{order.totalAmount}</TableCell>
                <TableCell>
                  <Button onClick={() => handleViewDetails(order)}>
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Dialog open={openDetailsDialog} onOpenChange={setOpenDetailsDialog}>
          {selectedOrder && (
            <ShoppingOrderDetails 
              order={selectedOrder} 
              onClose={() => setOpenDetailsDialog(false)} 
            />
          )}
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default ShoppingOrders;
// This is client/src/components/shopping-view/Orders.jsx
