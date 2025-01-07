const router = require("express").Router();
const userController = require("../controllers/user.controller");

router.post("/register", userController.register);
router.post("/email-otp", userController.sendOtpToEmail);
router.post("/phone-otp", userController.sendOtpToPhone);
router.post("/verify-otp", userController.verifyOtp);
router.post("/forgot-password", userController.forgotPassword);
router.post("/verify-forgot-password-otp", userController.verifyForgotPasswordOtp);
router.post("/reset-password", userController.resetPassword);

module.exports = router;