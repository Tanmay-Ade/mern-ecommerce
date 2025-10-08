const express = require("express");
const router = express.Router();
const { addBanner, fetchAllBanners, deleteBanner } = require("../../controllers/admin/bannerController");

router.post("/add", addBanner);
router.get("/get", fetchAllBanners);
router.delete("/delete/:id", deleteBanner);

module.exports = router;
// This is server/routes/admin/bannerRoutes.js
