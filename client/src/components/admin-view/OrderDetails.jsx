import { useState } from "react";
import { useDispatch } from "react-redux";
import CommonForm from "../common/Form";
import { DialogContent } from "../ui/dialog";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { updateOrderStatus } from "@/store/shop/order-slice";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const AdminOrderDetails = ({ order, onClose }) => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    status: order?.status || ''
  });

  async function handleSubmitStatus(event) {
    event.preventDefault();
    
    dispatch(updateOrderStatus({
      orderId: order._id,
      status: formData.status,
      note: `Status updated to ${formData.status}`
    })).then((result) => {
      if (result.payload?.success) {
        toast({
          title: "Order status updated successfully"
        });
        onClose();
      }
    });
  }

  return (
    <DialogContent className="sm:maxw-[600px]">
      <div className="grid gap-4">
        <div className="grid gap-2">
          <div className="flex mt-5 items-center justify-between">
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
              {order?.items?.map((item) => (
                <li
                  key={item._id}
                  className="flex items-center justify-between"
                >
                  <span>{item.productId?.productName}</span>
                  <span>₹{item.productId?.salePrice}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="grid gap-1">
            <div className="font-medium">Shipping Info</div>
            <div className="grid gap-0.5 text-muted-foreground">
              <span>{order?.shippingAddress?.address}</span>
              <span>{order?.shippingAddress?.city}</span>
              <span>{order?.shippingAddress?.pincode}</span>
              <span>{order?.shippingAddress?.phone}</span>
              <span>{order?.shippingAddress?.notes}</span>
            </div>
          </div>
        </div>

        <div>
          <CommonForm
            formControls={[
              {
                name: "status",
                label: "Order Status",
                componentType: "select",
                options: [
                  { id: "pending", label: "Pending" },
                  { id: "processing", label: "Processing" },
                  { id: "shipped", label: "Shipped" },
                  { id: "delivered", label: "Delivered" },
                  { id: "cancelled", label: "Cancelled" },
                  { id: "payment_failed", label: "Payment Failed" }
                ],
              }
            ]}
            formData={formData}
            setFormData={setFormData}
            buttonText={'Update Order Status'}
            onSubmit={handleSubmitStatus}
          />
        </div>
      </div>
    </DialogContent>
  );
};

export default AdminOrderDetails;
// This is client/src/components/admin-view/OrderDetails.jsx