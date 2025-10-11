import { useCallback, useState, useEffect } from "react";
import { StarIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { addToCart, fetchCartItems } from "../../store/shop/cart-slice";
import { useDispatch, useSelector } from "react-redux";
import { useToast } from "@/hooks/use-toast";
import { setProductDetails } from "@/store/shop/product-slice";
import ReviewForm from "../shopping-view/ReviewForm";
import ReviewList from "../shopping-view/ReviewList";
import API_BASE_URL from "@/config/api";

const ProductDetailsPage = ({
  open,
  setOpen,
  productDetails,
  isAdminView = false,
}) => {
  const [reviews, setReviews] = useState([]);
  const [mainImage, setMainImage] = useState(productDetails?.image);
  const [quantity, setQuantity] = useState(1);
  const [stockStatus, setStockStatus] = useState({
    message: "",
    color: "",
    isAvailable: true,
  });

  const allImages = [
    productDetails?.image,
    ...(productDetails?.additionalImages || []),
  ];

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { toast } = useToast();

  useEffect(() => {
    if (productDetails?.stock <= 0) {
      setStockStatus({
        message: "Out of Stock",
        color: "bg-red-500",
        isAvailable: false,
      });
    } else if (productDetails?.stock <= 10) {
      setStockStatus({
        message: `Only ${productDetails.stock} left in stock!`,
        color: "bg-amber-500",
        isAvailable: true,
      });
    } else {
      setStockStatus({
        message: "In Stock",
        color: "bg-green-500",
        isAvailable: true,
      });
    }
  }, [productDetails?.stock]);

  const handleReviewSubmit = async (reviewData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/shop/reviews/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        credentials: "include",
        body: JSON.stringify({
          ...reviewData,
          userId: user.id,
        }),
      });

      const data = await response.json();
      if (data.success) {
        fetchReviews();
        toast({
          title: "Review submitted successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error submitting review",
        variant: "destructive",
      });
    }
  };

  const fetchReviews = useCallback(async () => {
    if (!productDetails?._id) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/shop/reviews/product/${productDetails._id}`
      );
      const data = await response.json();
      if (data.success) {
        setReviews(data.data);
      }
    } catch (error) {
      toast({
        title: "Error fetching reviews",
        variant: "destructive",
      });
    }
  }, [productDetails?._id]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleThumbnailClick = (image) => {
    setMainImage(image);
  };

  const handleQuantityChange = (value) => {
    const newQuantity = Math.max(
      1,
      Math.min(value, productDetails?.stock || 1)
    );
    setQuantity(newQuantity);
  };

  const handleAddToCart = async () => {
    if (!stockStatus.isAvailable) {
      toast({
        title: "Product is out of stock",
        variant: "destructive",
      });
      return;
    }

    if (quantity > productDetails?.stock) {
      toast({
        title: "Not enough stock",
        description: `Only ${productDetails.stock} items available`,
        variant: "destructive",
      });
      return;
    }

    dispatch(
      addToCart({
        userId: user?.id,
        productId: productDetails?._id,
        quantity: quantity,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        toast({
          title: `${quantity} item(s) added to cart`,
        });
      }
    });
  };

  function handleDialogClose() {
    setOpen(false);
    dispatch(setProductDetails());
    setQuantity(1);
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="grid grid-cols-2 gap-6 p-6 max-w-[80vw] sm:max-w-[70vw] lg:max-w-[60vw]">
        <DialogTitle className="sr-only">Product Details</DialogTitle>
        <div className="relative overflow-hidden rounded-lg">
          <img
            src={mainImage || productDetails?.image}
            alt={productDetails?.productName}
            width={400}
            height={400}
            className="aspect-square w-full object-cover"
          />
          {allImages.length > 1 && (
            <div className="mt-4 flex gap-2 overflow-x-auto">
              {allImages.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${productDetails?.productName} - ${index + 1}`}
                  className={`w-20 h-20 object-cover cursor-pointer border-2 ${
                    image === mainImage ? "border-primary" : "border-gray-300"
                  }`}
                  onClick={() => handleThumbnailClick(image)}
                />
              ))}
            </div>
          )}
        </div>
        <div>
          <div>
            <h1 className="text-2xl font-bold">
              {productDetails?.productName}
            </h1>
            <p className="text-muted-foreground text-2xl mb-4 mt-3">
              {productDetails?.productDescription}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p
              className={`text-2xl font-bold ${
                productDetails?.salePrice > 0
                  ? "line-through text-muted-foreground"
                  : ""
              }`}
            >
              ${productDetails?.price}
            </p>
            {productDetails?.salePrice > 0 && (
              <p className="text-xl font-bold text-primary">
                ${productDetails?.salePrice}
              </p>
            )}
          </div>

          <Badge className={`mt-4 ${stockStatus.color}`}>
            {stockStatus.message}
          </Badge>

          {stockStatus.isAvailable && (
            <div className="flex items-center gap-4 mt-4">
              <label>Quantity:</label>
              <input
                type="number"
                min="1"
                max={productDetails?.stock}
                value={quantity}
                onChange={(e) => handleQuantityChange(parseInt(e.target.value))}
                className="w-20 p-2 border rounded"
              />
            </div>
          )}

          <Button
            className="w-full mt-6"
            onClick={handleAddToCart}
            disabled={!stockStatus.isAvailable}
          >
            {stockStatus.isAvailable ? "Add to Cart" : "Out of Stock"}
          </Button>

          <Separator className="my-6" />

          <div className="max-h-[250px] overflow-auto">
            <h2 className="text-xl font-bold mb-4">Reviews</h2>
            <ReviewList reviews={reviews} />
            {user && (
              <div className="mt-6">
                <ReviewForm
                  productId={productDetails?._id}
                  onSubmit={handleReviewSubmit}
                />
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailsPage;
// This is client/src/components/shopping-view/ProductDetailsPage.jsx
