const mongoose = require("mongoose");

const optionSchema = new mongoose.Schema({
  title: { type: String, required: true }, // Each option must have a title
});

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true }, // Question text is required
  options: [optionSchema], // Array of embedded optionSchema
});

const demoSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    demoTitle: { type: String, required: true },
    demoDescription: { type: String, required: true },
    demoTags: [{ type: String }],
    questions: [questionSchema], // Single question object
    status: { type: String, default: "active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Demo", demoSchema);
