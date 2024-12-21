const mongoose = require("mongoose");
const validator = require("validator");

const randomUserSchema = new mongoose.Schema(
  {
    demoId: { type: mongoose.Schema.Types.ObjectId, ref: "Demo" },
    username: { type: String },
    email: {
      type: String,
      required: [true, "Email is required"],
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    phone: { type: String },
    answer: { type: String,default:"" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RandomUser", randomUserSchema);
