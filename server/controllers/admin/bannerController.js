const Banner = require("../../models/Banner");

const addBanner = async (req, res) => {
  try {
    const { image, title, description } = req.body;
    const newBanner = new Banner({
      image,
      title,
      description
    });
    await newBanner.save();
    res.status(201).json({
      success: true,
      data: newBanner
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error occurred"
    });
  }
};

const fetchAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find({});
    res.status(200).json({
      success: true,
      message: banners
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error occurred"
    });
  }
};

const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    await Banner.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: "Banner deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error occurred"
    });
  }
};

module.exports = {
  addBanner,
  fetchAllBanners,
  deleteBanner
};

// This is server/controllers/admin/bannerController.js