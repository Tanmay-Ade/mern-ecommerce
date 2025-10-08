import { useSelector } from "react-redux";
import { DialogContent } from "../ui/dialog";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { formatDate } from "@/lib/utils";


const ShoppingOrderDetails = ({ order }) => {
  const { error, isLoading } = useSelector((state) => state.shopOrder);

  const getUserDisplayName = () => {
    if (order?.userId?.userName) {
      return order.userId.userName;
    }
    if (order?.userId?.email) {
      return order.userId.email;
    }
    return "Guest";
  };

  if (isLoading) {
    return (
      <DialogContent>
        <div className="flex items-center justify-center p-4">
          Loading order details...
        </div>
      </DialogContent>
    );
  }

  if (error) {
    return (
      <DialogContent>
        <div className="text-red-500 p-4">
          {error}
        </div>
      </DialogContent>
    );
  }

  return (
    <DialogContent className="sm:maxw-[600px]">
      <div className="grid gap-6">
        <div className="grid gap-2">
          <div className="flex mt-6 items-center justify-between">
            <p className="font-medium">Order ID</p>
            <Label>{order?._id}</Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Order Date</p>
            <Label>{formatDate(order?.createdAt)}</Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Order Price</p>
            <Label>₹{order?.totalAmount}</Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Order Status</p>
            <Label>{order?.status}</Label>
          </div>
        </div>
        <Separator />
        <div className="grid gap-4">
          <div className="grid gap-2">
            <div className="font-medium">Order Details</div>
            <ul className="grid gap-3">
              {order?.items?.map((item, index) => (
                <li key={index} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span>{item.productId?.productName || "Product"}</span>
                    <div className="flex gap-4">
                      <span>Qty: {item.quantity}</span>
                      <span>₹{item.productId?.salePrice}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <div className="font-medium">Shipping Info</div>
            <div className="grid gap-0.5 text-muted-foreground">
              <span className="font-medium">{getUserDisplayName()}</span>
              <span>{order?.shippingAddress?.address}</span>
              <span>{order?.shippingAddress?.city}</span>
              <span>{order?.shippingAddress?.pincode}</span>
              <span>{order?.shippingAddress?.phone}</span>
              <span>{order?.shippingAddress?.notes}</span>
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  );
};

export default ShoppingOrderDetails;
// This is client/src/components/shopping-view/OrderDetails.jsx