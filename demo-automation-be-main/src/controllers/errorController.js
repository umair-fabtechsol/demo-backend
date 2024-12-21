const mongoose = require("mongoose")
const sendEmail = require("../utils/email")
require("dotenv").config()

// Handle casting errors for MongoDB
const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}.`
  console.log("Cast Error", message)
  return [message, 400]
}

const handleRefernceError = err => {
  const message = `${err}`
  return [message, 500]
}

// Handle duplicate field errors for MongoDB
const handleDuplicateFieldsDB = err => {
  const keyPattern = err.keyPattern
  const field = Object.keys(keyPattern)[0]
  const message = {
    [field]: [`Duplicate field value.`]
  }
  return [message, 400]
}

// Handle validation errors for MongoDB
const handleValidationErrorDB = err => {
  const fieldErrors = {}

  for (const field in err.errors) {
    const error = err.errors[field]

    if (error instanceof mongoose.Error.CastError) {
      // Handle cast error specifically
      let lowerCaseMessage = error.message.toLowerCase()
      if (["embedded", "array", "object"].some(x => lowerCaseMessage.includes(x))) {
        fieldErrors[field] = error.message.includes("Cast to")
          ? [`This field is of JSON type`]
          : [error.message]
      } else fieldErrors[field] = [`This field is of ${error.kind} type`]
    } else {
      // Handle other validation errors
      fieldErrors[field] = [error.message]
    }
  }

  return [fieldErrors, 400]
}

// Handle JWT errors
const handleJWTError = () => ["Invalid token. Please log in again!", 401]
const handleJWTExpiredError = () => ["Your token has expired! Please log in again.", 401]

// Send error response in production environment
const sendError = (err, error, req, res) => {
  if (err.isOperational && err.message) {
    return res.status(err.statusCode).send({
      status: err.status,
      message: err.message
    })
  }
  return res.status(err.statusCode).json({
    status: err.status,
    message: error
  })
}

module.exports = (err, req, res, next) => {
 
  console.log(err)
 
  let error = {}
  let errorResult
  err.status = err.status || "error"
  const isDebug = process.env.NODE_ENV !== "production"

  if (err.name === "CastError") errorResult = handleCastErrorDB(err)
  if (err.name === "ReferenceError") errorResult = handleRefernceError(err)
  if (err.code === 11000) errorResult = handleDuplicateFieldsDB(err)
  if (err.name === "ValidationError") errorResult = handleValidationErrorDB(err)
  if (err.name === "JsonWebTokenError") errorResult = handleJWTError()
  if (err.name === "TokenExpiredError") errorResult = handleJWTExpiredError()
  let resArrValid = Array.isArray(errorResult)
  if (isDebug) {
    if (!resArrValid) error = err
    else error = errorResult[0]
  } else {
    if (!resArrValid) error = "Internal Server Error"
    else error = errorResult[0]
    // process.env.ERROR_SEND_EMAI && sendEmail(process.env.ERROR_SEND_EMAIL, "Backend", err)
  }
  err.statusCode = err.statusCode || (resArrValid && errorResult[1]) || 500
  sendError(err, error, req, res)
}
