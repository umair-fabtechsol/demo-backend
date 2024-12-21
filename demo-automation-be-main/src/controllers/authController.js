const User = require("../models/User");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const crypto = require("crypto");
const sendEmail = require("./../utils/email");
const { getAsBool, removeFields } = require("../utils/helpers");

const signToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res, mgs) => {
  user = removeFields(user.toJSON(), [
    "password",
    // "passwordChangedAt",
    // "active",
    // "createdAt",
    // "updatedAt",
  ]);
  const token = signToken(user._id, user.role);
  res.status(statusCode).json({
    error: false,
    message: mgs,
    token,
    data: user,
  });
};

const registerUser = catchAsync(async (req, res, next) => {
  const { username, email, password } = req.body;

  const oldEmail = await User.findOne({ email }, null);

  if (oldEmail) return next(new AppError("Email already exists", 400));

  const newUser = await User.create({
    username,
    email,
    password,
    sessionExpiration: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  createSendToken(newUser, 201, res, "User Created Successfully");
});

const loginUser = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  console.log(email);
  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new AppError("No user found", 404));
  }

  if (!(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect password", 401));
  }

  user.sessionExpiration = new Date(Date.now() + 24 * 60 * 60 * 1000);

  // 3) If everything ok, send token to user
  createSendToken(user, 200, res, "user Login Successfully");
});

const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError("Please provide an email!", 400));
  }

  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError("There is no user with this email address.", 404));
  }

  // Generate OTP
  const otp = user.createOtp();
  await user.save({ validateBeforeSave: false });

  try {
    await new sendEmail(user.email, "", otp).sendOtp(otp);
    // await new Email(user.email, user.name, null).sendOtp(otp);

    res.status(200).json({
      status: "success",
      message: "OTP sent to email!",
    });
  } catch (err) {
    console.error(err);
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError("There was an error sending the OTP. Try again later!", 500)
    );
  }
});

const verifyOtp = catchAsync(async (req, res, next) => {
  const { email, otp } = req.body;

  // 1) Check if email and OTP exist in the request
  if (!email || !otp) {
    return next(new AppError("Please provide email and OTP!", 400));
  }

  // 2) Find the user by email
  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError("There is no user with this email address.", 404));
  }

  // 3) Check if OTP is correct and not expired
  const hashedOtp = crypto
    .createHash("sha256")
    .update(otp.toString())
    .digest("hex");

  if (hashedOtp !== user.otp || user.otpExpires < Date.now()) {
    return next(new AppError("OTP is invalid or has expired!", 400));
  }

  // 4) OTP is verified, clear the OTP fields for security
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save({ validateBeforeSave: false });

  // 5) Respond to the client
  res.status(200).json({
    status: "success",
    message: "OTP verified successfully! Proceed to change password.",
  });
});

const changePassword = catchAsync(async (req, res, next) => {
  const { email, newPassword } = req.body;

  // 1) Validate input
  if (!email || !newPassword) {
    return next(new AppError("Please provide email and new password!", 400));
  }

  // 2) Find the user
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new AppError("There is no user with this email address.", 404));
  }

  console.log(user);
  console.log(newPassword, user.password);

  if (await user.correctPassword(req.body.newPassword, user.password)) {
    // Password has not changed, do not increment the password version
    return next(
      new AppError(
        "Your new password must be different from the current one.",
        400
      )
    );
  }

  // 3) Update the password
  user.password = newPassword;
  await user.save();

  // 4) Respond to the client
  res.status(200).json({
    status: "success",
    message: "Password changed successfully!",
  });
});

const resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }
  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update changedPasswordAt property for the user
  // 4) Log the user in, send JWT
  createSendToken(user, 200, res);
});
// to reset password from backend form
const resetPasswordBackend = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.render("error", { message: "Token is invalid or has expired" });
  }

  res.render("ResetPassword", { token: req.params.token });
});
//to change password using data received from backend form
const resetPasswordFormSubmit = catchAsync(async (req, res, next) => {
  console.log("reset", req.body);
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.body.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.render("error", { message: "Token is invalid or has expired" });
  }
  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  console.log(user);
  res.render("success", { message: "Password reset successfully" });
});
// const updatePassword = catchAsync(async (req, res, next) => {
//   const { passwordCurrent } = req.body;
//   // 1) Get user from collection
//   const user = await User.findById(req.user.id).select("+password");
//   console.log(user);
//   // 2) Check if POSTed current password is correct
//   if (!(await user.correctPassword(passwordCurrent, user.password))) {
//     return next(new AppError("Your current password is wrong.", 401));
//   }
//   if (await user.correctPassword(req.body.password, user.passwordCurrent)) {
//     // Password has not changed, do not increment the password version
//     return next(
//       new AppError(
//         "Your new password must be different from the current one.",
//         400
//       )
//     );
//   }
//   user.password = req.body.password;
//   await user.save();
//   // User.findByIdAndUpdate will NOT work as intended!

//   // 4) Log user in, send JWT

//   createSendToken(user, 200, res);
// });

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  verifyOtp,
  changePassword,
  resetPassword,
  // updatePassword,
  // resetPasswordBackend,
  // resetPasswordFormSubmit,
};
