const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const { promisify } = require("util");
const AppError = require("../utils/appError");
const User = require("../models/User");

module.exports = requireAuth = (roles) => {
  return catchAsync(async (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization) {
      return res.status(401).send({ error: "You must be logged in" });
    }
    const token = authorization.split(" ")[1];
    if (!token) {
      return next(
        new AppError("You are not logged in! Please log in to get access.", 401)
      );
    }
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    let currentUser;
    // if (role === "admin") {
    //   currentUser = await Admin.findById(decoded.id);
    // } else {
    //   currentUser = await User.findById(decoded.id);
    // }
    if (decoded.role === "AD") {
      //   currentUser = await Admin.findById(decoded.id)
    } else {
      currentUser = await User.findById(decoded.id);
      console.log(`ROLE IS: ${currentUser.role}`);
    }
    if (!currentUser) {
      return next(
        new AppError(
          "The user belonging to this token does no longer exist.",
          401
        )
      );
    }
    if (!roles.includes(currentUser.role)) {
      return next(
        new AppError("You do not have permission to perform this action.", 403)
      );
    }
    // if (currentUser.role === "US" && req.params.id !== decoded.id) {
    //   return next(new AppError("You do not have permission to access this resource.", 403))
    // }
    if (
      currentUser.role !== "AD" &&
      currentUser.changedPasswordAfter(decoded.iat)
    ) {
      return next(
        new AppError(
          "User recently changed password! Please log in again.",
          401
        )
      );
    }

    req.user = currentUser;
    next();
  });
};
