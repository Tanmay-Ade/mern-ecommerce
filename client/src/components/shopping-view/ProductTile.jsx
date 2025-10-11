import { useState, useEffect } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import API_BASE_URL from "@/config/api";

const ShoppingProductTile = ({
  product,
  handleGetProductDetails,
  handleAddtoCart,
  cartItems,
}) => {
  const [currentImage, setCurrentImage] = useState(product?.image || "");
  const [stockCount, setStockCount] = useState(product?.stock || 0);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const fetchLatestStock = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/shop/products/get/${product?._id}`
      );
      const latestStock = response.data.data.stock;

      // Calculate available to add to cart
      const existingCartItem = cartItems?.items?.find(
        (item) => item.productId === product?._id
      );
      const cartQuantity = existingCartItem ? existingCartItem.quantity : 0;
      setStockCount(Math.max(0, latestStock - cartQuantity));
    } catch (error) {
      console.error("Failed to fetch stock:", error);
    }
  };

  useEffect(() => {
    if (product?._id) {
      fetchLatestStock();
    }

    const stockUpdateInterval = setInterval(() => {
      if (product?._id && !isUpdating) {
        fetchLatestStock();
      }
    }, 30000);

    return () => clearInterval(stockUpdateInterval);
  }, [product?._id, isUpdating, cartItems]);

  const getStockBadgeProps = (stock) => {
    if (stock <= 0) {
      return {
        className: "absolute top-2 right-2 bg-red-500 hover:bg-red-600",
        children: "Out of Stock",
      };
    }
    if (stock <= 5) {
      return {
        className:
          "absolute top-2 right-2 bg-amber-500 hover:bg-amber-600 animate-pulse",
        children: `Only ${stock} left`,
      };
    }
    if (stock <= 10) {
      return {
        className: "absolute top-2 right-2 bg-yellow-500 hover:bg-yellow-600",
        children: `${stock} items left`,
      };
    }
    return null;
  };

  const handleAddToCartClick = async () => {
    if (stockCount <= 0) {
      toast({ title: "No more stocks", variant: "destructive" });
      return;
    }

    setIsUpdating(true);
    try {
      await handleAddtoCart(product?._id);
      // setStockCount((prevStock) => Math.max(0, prevStock - 1));
    } catch (error) {
      console.error(
        "Failed to update cart:",
        error.response?.data || error.message
      );
      toast({ title: "Failed to add to cart", variant: "destructive" });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="w-full max-w-sm mx-auto">
      <div
        onClick={(e) => {
          e.stopPropagation();
          handleGetProductDetails(product?._id);
        }}
      >
        <div className="relative overflow-hidden">
          <img
            src={currentImage}
            alt={product?.productName}
            className="w-full h-[200px] object-cover rounded-t-lg transition-transform duration-300 hover:scale-[1.02]"
          />
          {product?.salePrice > 0 && (
            <Badge className="absolute top-2 left-2 bg-red-600 hover:bg-red-700">
              Sale
            </Badge>
          )}
          {getStockBadgeProps(stockCount) && (
            <Badge {...getStockBadgeProps(stockCount)} />
          )}
        </div>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold mb-1">{product?.productName}</h2>
            <p className="text-xl font-medium">{product?.recipient}</p>
          </div>
          <p className="text-md font-semibold text-muted-foreground mb-2">
            {product?.productDescription}
          </p>
          <div className="text-lg font-semibold text-primary mt-2">
            {product?.salePrice > 0 ? (
              <div className="flex justify-between">
                <span className="line-through text-muted-foreground mr-2">
                  ${product?.price}
                </span>
                <span className="">${product?.salePrice}</span>
              </div>
            ) : (
              `$${product?.price}`
            )}
          </div>
        </CardContent>
      </div>
      <CardFooter>
        <Button
          onClick={handleAddToCartClick}
          className="w-full"
          disabled={stockCount === 0 || isUpdating}
        >
          {isUpdating
            ? "Updating..."
            : stockCount === 0
            ? "Out of Stock"
            : "Add to Cart"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ShoppingProductTile;
// This is client/src/components/shopping-view/ProductTile.jsx
