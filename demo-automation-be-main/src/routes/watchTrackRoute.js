const express = require("express");
const {
  createWatchTrack,
  getAnalytics,
} = require("../controllers/watchTrackController");

const requireAuth = require("../middlewares/requireAuth");

const router = express.Router();

router.post(
  "/createWatchTrack/:id",

  createWatchTrack
);
// test commment
router.get("/getAnalytics", getAnalytics);

module.exports = router;
