import Address from "@/components/shopping-view/Address";
import img from "../../assets/AccImage.webp";
import { useSelector } from "react-redux";
import CartContent from "@/components/shopping-view/CartContent";
import { Button } from "@/components/ui/button";
import StripeWrapper from "@/components/payment/StripeWrapper";
import PaymentForm from "@/components/payment/PaymentForm";

const Checkout = () => {
  const { cartItems } = useSelector((state) => state.shopCart);

  const totalCartAmount =
    cartItems && cartItems.items && cartItems.items.length > 0
      ? cartItems.items.reduce(
          (sum, currentItem) =>
            sum +
            (currentItem?.salePrice > 0
              ? currentItem?.salePrice
              : currentItem?.price) *
              currentItem?.quantity,
          0
        )
      : 0;

  return (
    <div className="flex flex-col">
      <div className="relative h-[300px] w-full overflow-hidden">
        <img src={img} className="h-full w-full object-cover object-center" alt="Checkout banner" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5 p-5">
        <Address />
        <div className="flex flex-col gap-4">
          {cartItems && cartItems.items && cartItems.items.length > 0
            ? cartItems.items.map((item) => <CartContent key={item.productId} cartItems={item} />)
            : null}
          <div className="mt-8 space-y-4">
            <div className="flex justify-between">
              <span className="font-bold">Total</span>
              <span className="font-bold">₹{totalCartAmount}</span>
            </div>
          </div>
          <div className="mt-4 w-full">
            <StripeWrapper>
              <PaymentForm 
                amount={totalCartAmount} 
                orderId={cartItems?.orderId} 
              />
            </StripeWrapper>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
// client/src/pages/shopping-view/Checkout.jsx