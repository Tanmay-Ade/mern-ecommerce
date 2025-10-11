import { Minus, Plus, Trash } from "lucide-react";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import { 
  deleteCartItem, 
  updateCartItemQty,
  fetchCartItems 
} from "@/store/shop/cart-slice";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import axios from 'axios';
import API_BASE_URL from '@/config/api';

const CartContent = ({ cartItems }) => {
  const [currentStock, setCurrentStock] = useState(0);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { toast } = useToast();

  async function handleUpdateQuantity(getCartItem, typeOfAction) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/shop/products/get/${getCartItem.productId}`
      );
      const availableStock = response.data.data.stock;
      
      const newQuantity = typeOfAction === "plus" 
        ? getCartItem.quantity + 1 
        : getCartItem.quantity - 1;

      // Validate quantity
      if (typeOfAction === "plus" && newQuantity > availableStock) {
        toast({
          title: "Maximum quantity reached",
          description: `Only ${availableStock} items available`,
          variant: "destructive"
        });
        return;
      }

      if (newQuantity < 1) {
        toast({
          title: "Minimum quantity is 1",
          variant: "destructive"
        });
        return;
      }

      const result = await dispatch(
        updateCartItemQty({
          userId: user?.id,
          productId: getCartItem?.productId,
          quantity: newQuantity,
        })
      ).unwrap();

      if (result.success) {
        // Refresh cart data
        dispatch(fetchCartItems(user?.id));
        
        setCurrentStock(availableStock);

        toast({
          title: "Cart updated successfully",
          variant: "success"
        });
      }
    } catch (error) {
      toast({
        title: "Failed to update cart",
        description: error.message,
        variant: "destructive"
      });
    }
  }

  async function handleCartItemDelete(getCartItem) {
    try {
      const result = await dispatch(
        deleteCartItem({ 
          userId: user?.id, 
          productId: getCartItem?.productId 
        })
      ).unwrap();

      if (result.success) {
        // Refresh cart data after deletion
        dispatch(fetchCartItems(user?.id));

        toast({
          title: "Item removed from cart",
          variant: "success"
        });
      }
    } catch (error) {
      toast({
        title: "Failed to remove item",
        description: error.message,
        variant: "destructive"
      });
    }
  }

  return (
    <div className="flex items-center space-x-4 relative">
      <img
        src={cartItems?.image}
        alt={cartItems?.productName}
        className="w-20 h-20 rounded object-cover"
      />
      <div className="flex-1">
        <h3 className="font-extrabold">{cartItems?.productName}</h3>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 mt-1">
            <Button
              variant="outline"
              className="w-8 h-8 rounded-full"
              size="icon"
              disabled={cartItems?.quantity <= 1}
              onClick={() => handleUpdateQuantity(cartItems, "minus")}
            >
              <Minus className="w-4 h-4" />
              <span className="sr-only">Decrease</span>
            </Button>
            <span className="font-semibold">{cartItems?.quantity}</span>
            <Button
              variant="outline"
              className="w-8 h-8 rounded-full"
              size="icon"
              onClick={() => handleUpdateQuantity(cartItems, "plus")}
            >
              <Plus className="w-4 h-4" />
              <span className="sr-only">Increase</span>
            </Button>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <p className="font-semibold">
          $
          {(
            (cartItems?.salePrice > 0
              ? cartItems?.salePrice
              : cartItems?.price) * cartItems?.quantity
          ).toFixed(2)}
        </p>
        <Trash
          onClick={() => handleCartItemDelete(cartItems)}
          className="cursor-pointer mt-1 hover:text-red-500 transition-colors"
          size={20}
        />
      </div>
    </div>
  );
};

export default CartContent;
// This is client/src/components/shopping-view/CartContent.jsx