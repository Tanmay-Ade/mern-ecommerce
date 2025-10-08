const cloudinary = require("cloudinary").v2;
const multer = require("multer");

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer to use memory storage
const storage = multer.memoryStorage();

// Enhanced image upload utility that handles base64 strings
const imageUploadUtil = async (base64Image) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      base64Image,
      {
        resource_type: "auto",
        folder: "products"
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
  });
};

const upload = multer({ storage });

module.exports = { upload, imageUploadUtil };

// This is server/helpers/cloudinary.js