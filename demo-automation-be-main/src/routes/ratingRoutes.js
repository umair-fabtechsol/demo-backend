const express = require("express");
const { submitRating, getRating } = require("../controllers/ratingController");

const requireAuth = require("../middlewares/requireAuth");

const router = express.Router();

router.post("/submitRating", submitRating);

router.get("/getDemoRating/:id", getRating);

module.exports = router;
