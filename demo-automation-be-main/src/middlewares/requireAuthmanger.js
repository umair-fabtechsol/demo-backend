const jwt = require("jsonwebtoken")
const mongoose = require("mongoose")
const catchAsync = require("../utils/catchAsync")
const AppError = require("../utils/appError")
const User = mongoose.model("User")
const { promisify } = require("util")
const Manager = require("../models/Manger")
module.exports = catchAsync(async (req, res, next) => {
  const { manager_identifier } = req.headers
  console.log(manager_identifier, "hhjhjh")
  if (!manager_identifier) {
    return res.status(401).send({ error: "You must be logged in" })
  }
  if (!manager_identifier) {
    return next(new AppError("You are not logged in! Please log in to get access.", 401))
  }
  const currentUser = await Manager.findById(manager_identifier)
  console.log("currentUser", currentUser)
  if (!currentUser) {
    return next(new AppError("The user belonging to this token does no longer exist.", 401))
  }
  req.manager = currentUser
  next()
})
