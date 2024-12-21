const mongoose = require("mongoose");
const validator = require("validator");

const watchTrackSchema = new mongoose.Schema(
  {
    // userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    email: {
      type: String,
      required: [true, "Email is required"],
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    username:{type:String},
    playList: { type: mongoose.Schema.Types.ObjectId, ref: "PlayList" },
    demoId: { type: mongoose.Schema.Types.ObjectId, ref: "Demo" },
    demoCreator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    timeSpent: { type: String },
    completion: { type: String },
    firstView: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WatchTrack", watchTrackSchema);
