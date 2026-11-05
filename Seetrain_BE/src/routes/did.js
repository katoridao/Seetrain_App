const express = require("express");
const { testDidConnection } = require("../services/didService");
const { getPresenters } = require("../services/didService");

const router = express.Router();

// testing
router.get("/test", async (req, res) => {
  try {
    const result = await testDidConnection();

    res.status(200).json({
      status: "connected",
      message: "D-ID API connection successful",
    });
  } catch (error) {
    console.error("D-ID connection error:", error.message);

    res.status(error.status || 500).json({
      status: "error",
      message: error.message,
    });
  }
});

// get avt
router.get("/avatars", async (req, res) => {
  try {
    const presenters = await getPresenters(20);

    res.status(200).json({
      status: "success",
      presenters,
    });
  } catch (error) {
    console.error("Get D-ID avatars error:", error.message);

    res.status(error.status || 500).json({
      status: "error",
      message: error.message,
    });
  }
});

module.exports = router;
