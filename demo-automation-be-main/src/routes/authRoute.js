const express = require("express");
const {
  registerUser,
  loginUser,
  forgotPassword,
  verifyOtp,
  changePassword,
  //   resetPassword,
  //   updatePassword,
  //   resetPasswordFormSubmit,
  //   resetPasswordBackend
} = require("../controllers/authController");

const requireAuth = require("../middlewares/requireAuth");


const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgotPassword", forgotPassword);
router.post("/verifyOtp", verifyOtp);
router.patch("/changePassword", changePassword);
// router.patch("/updateMyPassword", requireAuth, updatePassword)
// if (getAsBool(process.env.RP_SERVER)) {
//   router.get("/resetPassword/:token", resetPasswordBackend)
//   router.post("/resetPassword/", resetPasswordFormSubmit)
// } else {
//   router.patch("/resetPassword/:token", resetPassword)
// }

module.exports = router;
