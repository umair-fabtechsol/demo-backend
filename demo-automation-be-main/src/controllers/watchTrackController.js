const WatchTrack = require("../models/watchTrack");
const catchAsync = require("../utils/catchAsync");
// const Demo = require("../models/Demo");
const PlayList = require("../models/PlayList");

const createWatchTrack = catchAsync(async (req, res, next) => {
  // const userId = req.user.id;
  const playList = req.params.id;
  const { email, username, timeSpent, completion } = req.body;

  const videoData = await PlayList.findById(playList);

  if (!videoData) {
    return res.status(404).json({ error: true, message: "PlayList not found" });
  }

  const watchTrack = await WatchTrack.findOne({
    email: email,
    playList: playList,
  });

  if (!watchTrack) {
    videoData.views += 1;
    await videoData.save();
    const watchTrack = new WatchTrack({
      email,
      username,
      playList,
      demoId: videoData.demoId,
      demoCreator: videoData.demoCreator,
      timeSpent,
      completion,
      firstView: new Date(),
    });
    await watchTrack.save();
    return res.status(200).json({
      error: false,
      message: "view updated, and watchTrack created",
      data: {
        watchTrack,
      },
    });
  }

  // Update only if the new values are greater
  if (parseFloat(timeSpent) > parseFloat(watchTrack.timeSpent)) {
    watchTrack.timeSpent = timeSpent;
  }
  if (parseFloat(completion) > parseFloat(watchTrack.completion)) {
    watchTrack.completion = completion;
  }
  await watchTrack.save();
  res.status(201).json({
    error: false,
    message: "watchtrack updated",
    data: {
      watchTrack,
    },
  });
});

const getAnalytics = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const watchTracks = await WatchTrack.find({ demoCreator: userId }).populate(
    "demoId",
    (Select = "demoTitle")
  );
  if (!watchTracks) {
    return res
      .status(404)
      .json({ error: true, message: "Analytics not found" });
  }
  res.status(200).json({
    error: false,
    message: "watchAnalytics founded",
    data: watchTracks,
  });
});

module.exports = {
  createWatchTrack,
  getAnalytics,
};
