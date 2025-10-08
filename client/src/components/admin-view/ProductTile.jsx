import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import { useState } from "react";


const AdminProductTile = ({
 product,
 setFormData,
 setOpenCreateProductDialog,
 setCurrentEditedId,
 handleDelete,
 setUploadedImageUrl,
 setUploadedImageUrls,
}) => {
 const [currentImage, setCurrentImage] = useState(product?.image || "");
 const allImages = [
  product?.image,
  ...(product?.additionalImages || []),
 ].filter(Boolean);


 return (
  <Card className="w-full max-w-sm mx-auto overflow-hidden">
   <div className="relative">
    <div className="w-full h-[200px] overflow-hidden">
     <img
      src={currentImage || product?.image}
      alt={product?.productName}
      className="w-full h-full object-cover"
      onError={(e) => {
       console.log("Image load error:", e);
       e.target.src = "/fallback-image.jpg";
      }}
     />
    </div>


    {/* Clickable thumbnails */}
    <div className="grid grid-cols-4 gap-2 p-2 bg-background/80">
     {allImages.map((img, index) => (
      <div 
       key={index} 
       className="aspect-square overflow-hidden rounded cursor-pointer"
       onClick={() => setCurrentImage(img)}
      >
       <img
        src={img}
        alt={`Product view ${index + 1}`}
        className={`w-full h-full object-cover ${
         currentImage === img ? "ring-2 ring-primary" : ""
        }`}
        onError={(e) => console.log("Thumbnail load error:", e)}
       />
      </div>
     ))}
    </div>
   </div>


   {/* Rest of the component remains the same */}
   <CardContent>
    <div className="flex items-center justify-between my-1">
        <span className="font-bold text-xl">{product.productName}</span>
        <span className="font-semibold text-xl text-muted-foreground">{product.recipient}</span>
    </div>
    <div>
     <h3 className="text-md font-semibold mb-2 text-muted-foreground line-clamp-2">
      {product?.productDescription}
     </h3>
    </div>
    <div className="flex justify-between items-center">
     <span
      className={`${
       product?.salePrice > 0 ? "line-through" : ""
      } text-lg font-semibold text-primary`}
     >
      ${product?.price}
     </span>
     {product?.salePrice > 0 && (
      <span className="text-lg font-bold text-green-600">
       ${product?.salePrice}
      </span>
     )}
    </div>
   </CardContent>


   <CardFooter className="flex justify-between items-center">
    <Button onClick={() => {
     setOpenCreateProductDialog(true);
     setCurrentEditedId(product?._id);
     setFormData({
      ...product,
      image: product.image,
      additionalImages: product.additionalImages || [],
     });
     setUploadedImageUrl(product.image);
     setUploadedImageUrls(product.additionalImages || []);
    }}>Edit</Button>
    <Button
     variant="destructive"
     onClick={() => handleDelete(product?._id)}
    >
     Delete
    </Button>
   </CardFooter>
  </Card>
 );
};

export default AdminProductTile;
// This is client/src/components/admin-view/ProductTile.jsx