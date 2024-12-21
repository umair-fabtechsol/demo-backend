const Demo = require("../models/Demo");
const Rating = require("../models/Rating");
const catchAsync = require("../utils/catchAsync");

const submitRating = catchAsync(async (req, res, next) => {
  // const userId = req.user.id;
  const { email, demoId, rating } = req.body;
  const demo = await Demo.findById(demoId);

  if (!demoId || !rating || !email) {
    return res
      .status(400)
      .json({ error: true, message: "All fields are required" });
  }

  if (!demo) {
    return res.status(404).json({ error: true, message: "Demo not found" });
  }

  const aleadyRated = await Rating.findOne({ demoId, email });
  if (aleadyRated) {
    return res
      .status(409)
      .json({ error: true, message: "You have already rated this demo" });
  }

  const createRating = new Rating({
    demoId,
    email,
    rating,
  });

  await createRating.save();

  res.status(200).json({
    error: false,
    message: "Rating submitted successfully",
    data: createRating,
  });
});

const getRating = catchAsync(async (req, res, next) => {
  const demoId = req.params.id;

  // Fetch all ratings for the given demoId
  const ratings = await Rating.find({ demoId });

  // If no ratings are found
  if (!ratings || ratings.length === 0) {
    return res.status(400).json({ error: true, message: "Ratings not found" });
  }

  // Calculate the average rating and count manually
  const totalRatings = ratings.length;
  const totalSum = ratings.reduce((sum, rating) => sum + rating.rating, 0);
  const averageRating = totalSum / totalRatings;

  // Return the result
  res.status(200).json({
    error: false,
    message: "Ratings found",
    data: {
      averageRating: averageRating || 0,
      count: totalRatings,
    },
  });
});

module.exports = {
  submitRating,
  getRating,
};
