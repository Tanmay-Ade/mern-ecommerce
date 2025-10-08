import { useState } from "react";
import { useSelector } from "react-redux";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Dialog } from "../ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import AdminOrderDetails from "./OrderDetails";
import { formatDate } from "@/lib/utils";

const AdminOrders = () => {
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { orders } = useSelector((state) => state.shopOrder);

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setOpenDetailsDialog(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Orders</CardTitle>
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
                  <Button onClick={() => handleViewDetails(order)}>View Details</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={openDetailsDialog} onOpenChange={setOpenDetailsDialog}>
        {selectedOrder && (
          <AdminOrderDetails 
            order={selectedOrder} 
            onClose={() => setOpenDetailsDialog(false)} 
          />
        )}
      </Dialog>
    </Card>
  );
};


export default AdminOrders;
// This is client/src/components/admin-view/Orders.jsx