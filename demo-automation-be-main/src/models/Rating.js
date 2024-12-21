const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema({
  demoId: { type: mongoose.Schema.Types.ObjectId, ref: "Demo" },
  email: { type: String },
  rating: { type: Number },
});

module.exports = mongoose.model("Rating", ratingSchema);
