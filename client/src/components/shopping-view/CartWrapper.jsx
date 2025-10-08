import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "../ui/button";
import { SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import CartContent from "./CartContent";
import { useDispatch } from "react-redux";
import { fetchAllFilteredProducts } from "@/store/shop/product-slice";

const CartWrapper = ({ cartItems, setOpenCartSheet }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchAllFilteredProducts({ 
      filterParams: { timestamp: Date.now() }, 
      sortParams: "price-lowtohigh" 
    }));
  }, [cartItems, dispatch]);

  const totalCartAmount = cartItems && cartItems.length > 0 ?
    cartItems.reduce((sum, currentItem) => sum + (
      currentItem?.salePrice > 0 ? currentItem?.salePrice : currentItem?.price
    ) * currentItem?.quantity, 0)
    : 0;
  
  return (
    <SheetContent className="sm:max-w-md">
      <SheetHeader>
        <SheetTitle>Your Cart ({cartItems?.length || 0} items)</SheetTitle>
      </SheetHeader>
      <div className="mt-8 space-y-4 max-h-[60vh] overflow-y-auto">
        {cartItems && cartItems.length > 0 ? (
          cartItems.map((item) => (
            <CartContent 
              key={item?.productId} 
              cartItems={item} 
            />
          ))
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500">Your cart is empty</p>
          </div>
        )}
      </div>

      <div className="mt-8 space-y-4 border-t pt-4">
        <div className="flex justify-between">
          <span className="font-bold">Total</span>
          <span className="font-bold">₹{totalCartAmount.toFixed(2)}</span>
        </div>
      </div>
      <Button 
        onClick={() => {
          navigate('/shop/checkout');
          setOpenCartSheet(false);
        }} 
        className="w-full mt-5"
        disabled={!cartItems || cartItems.length === 0}
      >
        Proceed to Checkout
      </Button>
    </SheetContent>
  );
};

export default CartWrapper;
// This is client/src/components/shopping-view/CartWrapper.jsx