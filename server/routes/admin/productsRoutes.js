const express = require("express");
const {
 handleImageUpload,
 handleMultipleImageUpload,
 addProduct,
 fetchAllProducts,
 editProduct,
 deleteProduct,
 updateProductStock
} = require("../../controllers/admin/productController");


const { upload } = require("../../helpers/cloudinary");
const router = express.Router();


// Upload multiple images and create a product
router.post("/upload-image", upload.single("my_file"), handleImageUpload);
router.post("/upload-multipleimages", upload.array("my_files", 3), handleMultipleImageUpload);
router.post("/add", addProduct); // Accept multiple images when adding a product
router.get("/get", fetchAllProducts);
router.put("/edit/:id", editProduct); // Allow image uploads during product edit
router.delete("/delete/:id", deleteProduct);

router.post('/update-stock', updateProductStock);

module.exports = router;
// This is server/routes/admin/productsRoutes.js