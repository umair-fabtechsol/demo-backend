const mongoose = require("mongoose");

const playListSchema = new mongoose.Schema({
  demoId: { type: mongoose.Schema.Types.ObjectId, ref: "Demo" },
  demoCreator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  title: { type: String, required: true },
  description: { type: String },
  tags: [{ type: String }],
  views: { type: Number, default: 0 },
  url: { type: String },
  mediaKey: { type: String },
  firstView: { type: Date },
  status: { type: String, default: "active" },
});

module.exports = mongoose.model("PlayList", playListSchema);
