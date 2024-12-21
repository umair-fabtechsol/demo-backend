const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const validator = require("validator");

const roleEnum = {
  US: "User",
  AD: "Admin",
};

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
      required: [true, "Email is required"],
      validate: [validator.isEmail, "Please provide a valid email"],
    },

    profile: {
      type: String,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
      // minlength: [8, "Password must be at least 8 characters long"]
    },
    role: {
      type: String,
      enum: Object.keys(roleEnum),
      default: Object.keys(roleEnum)[0],
    },

    otp: {
      type: String,
    },
    otpExpires: {
      type: Date,
    },

    sessionExpiration: {
      type: String,
    },
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    timestamps: true,
    versionKey: false,
  }
);
UserSchema.pre("save", async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified("password")) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  if (this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

UserSchema.pre("findOneAndUpdate", async function (next) {
  try {
    if (this._update?.password) {
      const hashed = await bcrypt.hash(this._update.password, 12);
      this._update.password = hashed;
      this._update.passwordChangedAt = Date.now() - 1000;
    }
    next();
  } catch (err) {
    return next(err);
  }
});
UserSchema.methods.correctPassword = async function (
  enteredPassword,
  userPassword
) {
  return await bcrypt.compare(enteredPassword, userPassword);
};

UserSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

// Inside your User schema methods
UserSchema.methods.createOtp = function () {
  const otp = Math.floor(1000 + Math.random() * 9000); // Generate 4-digit OTP
  this.otp = crypto.createHash("sha256").update(otp.toString()).digest("hex");
  this.otpExpires = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes
  return otp; // Return the plain OTP for sending in the email
};

UserSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")

    .update(resetToken)
    .digest("hex");

  // console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model("User", UserSchema);
