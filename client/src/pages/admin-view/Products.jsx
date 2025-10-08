import ImageUpload from "@/components/admin-view/ImageUpload";
import MultipleImageUpload from "@/components/admin-view/MultipleImageUpload";
import CommonForm from "@/components/common/Form";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { addProductFormControls } from "@/config";
import { useToast } from "@/hooks/use-toast";
import {
  addNewProduct,
  deleteProduct,
  editProduct,
  fetchAllProducts,
} from "@/store/admin/products-slice";
import { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AdminProductTile from "@/components/admin-view/ProductTile";
import ProductDetailsPage from "@/components/shopping-view/ProductDetailsPage";

const initialFormData = {
  image: null,
  productName: "",
  productDescription: "",
  recipient: "",
  category: "",
  jewellery: "",
  price: "",
  salePrice: "",
  stock: "",
};

const Products = () => {
  const [openCreateProductDialog, setOpenCreateProductDialog] = useState(false);
  const [openProductDialog, setOpenProductDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const [currentEditedId, setCurrentEditedId] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState([]);

  const { productList } = useSelector((state) => state.adminProducts);
  const dispatch = useDispatch();
  const { toast } = useToast();

  // Added console log useEffect for debugging
  useEffect(() => {
    dispatch(fetchAllProducts());
    console.log("Current Product List:", productList);
  }, [dispatch]);

  function onSubmit(event) {
    event.preventDefault();

    const productData = {
      ...formData,
      image: uploadedImageUrl || "",
      additionalImages: uploadedImageUrls || [],
      price: Number(formData.price),
      salePrice: Number(formData.salePrice),
      stock: Number(formData.stock),
    };

    const action = currentEditedId !== null ? editProduct : addNewProduct;
    const actionData =
      currentEditedId !== null
        ? { id: currentEditedId, formData: productData }
        : productData;

    dispatch(action(actionData)).then((data) => {
      if (data?.payload.success) {
        dispatch(fetchAllProducts());
        setFormData(initialFormData);
        setOpenCreateProductDialog(false);
        setCurrentEditedId(null);
        setImageFile(null);
        setImageFiles([]);
        setUploadedImageUrl("");
        setUploadedImageUrls([]);
        toast({
          title:
            currentEditedId !== null
              ? "Product updated successfully"
              : "Product added successfully",
        });
      }
    });
  }

  function handleDelete(getCurrentProductId) {
    dispatch(deleteProduct(getCurrentProductId)).then((data) => {
      if (data?.payload.success) {
        dispatch(fetchAllProducts());
      }
    });
  }

  function isFormValid() {
    return Object.keys(formData)
      .map((key) => formData[key] !== "")
      .every((item) => item);
  }

  function handleProductClick(product) {
    setSelectedProduct(product);
    setOpenProductDialog(true);
  }

  return (
    <Fragment>
      <div className="mb-5 w-full flex justify-end">
        <Button onClick={() => setOpenCreateProductDialog(true)}>
          Add New Product
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {Array.isArray(productList) && productList.length > 0 ? (
          productList.map((productItem) => (
            <AdminProductTile
              key={productItem._id}
              setFormData={setFormData}
              setOpenCreateProductDialog={setOpenCreateProductDialog}
              setCurrentEditedId={setCurrentEditedId}
              product={productItem}
              handleDelete={handleDelete}
              setUploadedImageUrl={setUploadedImageUrl}
              setUploadedImageUrls={setUploadedImageUrls}
              handleProductClick={handleProductClick}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-4">
            No products available
          </div>
        )}
      </div>
      <Sheet
        open={openCreateProductDialog}
        onOpenChange={() => {
          setOpenCreateProductDialog(false);
          setCurrentEditedId(null);
          setFormData(initialFormData);
          setImageFile(null);
          setImageFiles([]);
          setUploadedImageUrl("");
          setUploadedImageUrls([]);
        }}
      >
        <SheetContent side="right" className="overflow-auto">
          <SheetHeader>
            <SheetTitle>
              {currentEditedId !== null ? "Edit Product" : "Add New Product"}
            </SheetTitle>
          </SheetHeader>
          <ImageUpload
            imageFile={imageFile}
            setImageFile={setImageFile}
            uploadedImageUrl={uploadedImageUrl}
            setUploadedImageUrl={setUploadedImageUrl}
            setImageLoadingState={setImageLoadingState}
            imageLoadingState={imageLoadingState}
            isEditMode={currentEditedId !== null}
          />
          <MultipleImageUpload
            imageFiles={imageFiles}
            setImageFiles={setImageFiles}
            uploadedImageUrls={uploadedImageUrls}
            setUploadedImageUrls={setUploadedImageUrls}
            isEditMode={currentEditedId !== null}
          />
          <div className="py-6">
            <CommonForm
              onSubmit={onSubmit}
              formData={formData}
              setFormData={setFormData}
              buttonText={currentEditedId !== null ? "Edit" : "Add"}
              formControls={addProductFormControls}
              isBtnDisabled={!isFormValid()}
            />
          </div>
        </SheetContent>
      </Sheet>
      <ProductDetailsPage
        open={openProductDialog}
        setOpen={setOpenProductDialog}
        productDetails={selectedProduct}
        isAdminView={true}
      />
    </Fragment>
  );
};

export default Products;
// client/src/pages/admin-view/Products.jsx