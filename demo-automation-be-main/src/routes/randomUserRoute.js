const express = require("express");
const {
  createRandomUser,
  getQuestion,
  saveAnswer,
} = require("../controllers/randomUserController");

const router = express.Router();

router.post("/createRandomUser/:id", createRandomUser);

router.get("/getQuestion/:id", getQuestion);
router.post("/saveAnswer/:id", saveAnswer);

module.exports = router;
