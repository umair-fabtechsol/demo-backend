const express = require("express");
const {
  scheduleMeeting,
  getScheduleMeeting,
} = require("../controllers/calendlyController");

const router = express.Router();

router.get("/scheduleMeeting", scheduleMeeting);
router.get("/getEvents", getScheduleMeeting);

module.exports = router;
