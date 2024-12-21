const Demo = require("../models/Demo");
const User = require("../models/User");
const PlayList = require("../models/PlayList");
const catchAsync = require("../utils/catchAsync");
const { mediaDeleteS3 } = require("../middlewares/aws-v3");
// const { uploadJson } = require("../utils/uploadHelper");
// const { uploadMulter, uploadHandler } = require("./../utils/uploadHelper");

const uploadDemo = catchAsync(async (req, res, next) => {
  const { demoTitle, demoDescription, demoTags, viedoData, questions } =
    req.body;

  // Create a new Demo document
  const demo = new Demo({
    userId: req.user.id,
    demoTitle,
    demoDescription,
    demoTags,
    // viedoData,
    questions,
  });

  const playListPromises = viedoData?.map((data) => {
    return {
      title: data.title,
      description: data.description,
      tags: data.tags,
      mediaKey: data.mediaKey,
      demoCreator: req.user.id,
      url: data.url,
      demoId: demo._id,
    };
  });

  await demo.save();

  if (playListPromises.length > 0) {
    await PlayList.insertMany(playListPromises);
  }

  console.log("DEMO DATA", demo._id);

  // Save the Demo document (pre-save hook will handle tag creation)

  res.status(200).send({
    error: false,
    data: demo,
  });
});

// const uploadDemo = catchAsync(async (req, res, next) => {
//   const { title, description } = req.body;

//   console.log(`MEDIA: ${req.body?.Media}`);

//   const demo = new Demo({
//     userId: req.user.id,
//     title: title,
//     description: description,
//     Media: req.body?.Media.url,
//     mediaKey: req.body?.Media.mediaKey,
//   });
//   await demo.save();

//   //   console.log(`Checking my RESOPONSE ${locationResult}`);
//   res.status(200).send({
//     status: "success",
//     result: demo,
//   });
// });

const getUserDemos = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  const query = req.query.search; // Optional search query

  const searchCondition = query
    ? { userId, title: { $regex: query, $options: "i" } } // Search demos by name
    : { userId };

  const demos = await Demo.find(searchCondition).populate(
    "userId",
    (select = "username -_id")
  );

  console.log(demos);

  if (!demos || demos.length === 0) {
    return res.status(404).json({ error: false, message: "No demos found" });
  }

  res.status(200).json({ error: false, message: "Data founded", data: demos });
});

const getSingleDemoWithPlayList = catchAsync(async (req, res, next) => {
  const demoId = req.params.id;

  const demoData = await Demo.findById(demoId).select(
    "demoTitle demoDescription questions demoTags -_id"
  );

  if (!demoData) {
    return res.status(404).json({ error: true, message: "Demo not found" });
  }

  const playList = await PlayList.find({ demoId }).select("-demoId");

  if (!playList || playList.length === 0) {
    return res.status(404).json({ error: true, message: "No Playlist found" });
  }

  res.status(200).json({
    error: false,
    message: "Data found",
    data: {
      demo: demoData,
      playlists: playList,
    },
  });
});

const getDemosPlaylist = catchAsync(async (req, res, next) => {
  const demoId = req.params.id;

  const playList = await PlayList.find({ demoId }).populate(
    "demoId",
    (select = "demoTitle demoDescription questions demoTags -_id")
  );

  if (!playList) {
    return res.status(404).json({ error: false, message: "No PlayList found" });
  }

  console.log(playList);

  res
    .status(200)
    .json({ error: false, message: "Data founded", data: playList });
});

const deleteVideo = catchAsync(async (req, res, next) => {
  const { fileKey } = req.body;

  if (!fileKey) {
    return res
      .status(400)
      .json({ error: true, message: "File key is required" });
  }

  const deleteMedia = await mediaDeleteS3(fileKey);
  console.log(deleteMedia);

  console.log(deleteMedia.$metadata.httpStatusCode);
  if (!deleteMedia.$metadata.httpStatusCode === 500) {
    return res
      .status(404)
      .json({ error: true, message: "Error occured during deletion" });
  }
  if (deleteMedia.$metadata.httpStatusCode == 204)
    return res.status(200).json({ error: false, message: "Video deleted" });
});

module.exports = {
  uploadDemo,
  getUserDemos,
  getSingleDemoWithPlayList,
  getDemosPlaylist,
  deleteVideo,
};
