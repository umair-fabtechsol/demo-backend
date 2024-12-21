const {
  authRoute,
  // clientRoute,
  calendlyRoute,
  demoRoute,
  mediaRoute,
  watchTrackRoute,
  ratingRoute,
  randonUserRoute
} = require("../routes/index");
const otherRoutes = require("./otherRoutes");
module.exports = function (app) {
  app.use("/api/calendly", calendlyRoute);
  app.use("/api/demo", demoRoute);
  app.use("/api/media", mediaRoute);
  // app.use("/api/admin", adminRoute)
  app.use("/api/auth", authRoute);
  app.use("/api/track", watchTrackRoute);
  app.use("/api/rating", ratingRoute);
  app.use("/api/randomUser", randonUserRoute);

  otherRoutes(app);
};
