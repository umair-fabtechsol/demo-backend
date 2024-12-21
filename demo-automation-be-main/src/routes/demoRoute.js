const express = require("express");
const {
  uploadDemo,
  getUserDemos,
  getSingleDemoWithPlayList,
  getDemosPlaylist,
  deleteVideo
} = require("../controllers/demoController");
const { uploadMulter, uploadHandler } = require("./../utils/uploadHelper");
const requireAuth = require("../middlewares/requireAuth");

const router = express.Router();

router.post(
  "/uploadDemo",
  requireAuth(["AD", "US"]),
  // uploadMulter.single("Media"),
  // uploadHandler,
  uploadDemo
);

router.get("/getUserDemos", requireAuth(["AD", "US"]), getUserDemos);
router.get(
  "/getSingleDemo/:id",
  requireAuth(["AD", "US"]),
  getSingleDemoWithPlayList
);

router.get("/getDemoPlaylist/:id", getDemosPlaylist);
router.post("/deleteMedia", deleteVideo);

module.exports = router;
