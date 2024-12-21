const Demo = require("..//models/Demo");
const RandomUser = require("../models/RandomUser");
const catchAsync = require("../utils/catchAsync");

const createRandomUser = catchAsync(async (req, res, next) => {
  const demoId = req.params.id;

  const { username, email, phone } = req.body;

  if (!username || !email || !phone) {
    return res
      .status(400)
      .json({ error: true, message: "All fields are required" });
  }

  console.log(demoId, email);
  const demo = await Demo.findById(demoId);
  if (!demo) {
    return res.status(404).json({ error: true, message: "Demo not found" });
  }

  const userExist = await RandomUser.findOne({ email, demoId });

  if (userExist) {
    return res
      .status(409)
      .json({ error: true, message: "No need to display question screen" });
  }

  const randomUser = new RandomUser({
    demoId,
    username,
    email,
    phone,
  });

  const history = await randomUser.save();
  res.status(200).json({ error: false, data: history });
});

const getQuestion = catchAsync(async (req, res, next) => {
  const demoId = req.params.id;
  const demo = await Demo.findById(demoId);
  if (!demo || !demo.questions || !demo.questions.length === 0) {
    return res.status(404).json({ error: true, message: "Demo not found" });
  }
  const questions = demo.questions;
  res.status(200).json({ error: false, data: questions });
});

const saveAnswer = catchAsync(async (req, res, next) => {
  const demoId = req.params.id;
  const { answer, email } = req.body;

  if (!answer) {
    return res.status(400).json({ error: true, message: "select an answer" });
  }
  if (!email) {
    return res
      .status(400)
      .json({ error: true, message: "Provide user's email" });
  }
  const userData = await RandomUser.findOne({ email, demoId });
  if (!userData) {
    return res.status(404).json({ error: true, message: "UserData not found" });
  }

  userData.answer = answer;
  await userData.save();

  return res
    .status(200)
    .json({ error: false, message: "Answer saved", data: userData });
});

module.exports = { createRandomUser, getQuestion, saveAnswer };
