const router = require("express").Router();
const userController = require("../controllers/user.controller");
const {authMiddleware} = require("../middleware/authMiddleware");

router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/logout",authMiddleware,userController.logout)
router.post("/refresh-token",authMiddleware,userController.refreshToken)
router.post("/email-otp", userController.sendOtpToEmail);
router.post("/phone-otp", userController.sendOtpToPhone);
router.post("/verify-otp", userController.verifyOtp);
router.post("/forgot-password", userController.forgotPassword);
router.post("/verify-forgot-password-otp", userController.verifyForgotPasswordOtp);
router.post("/reset-password", userController.resetPassword);
router.post("/refresh-token",userController.refreshToken)
router.get("/get-user-by-id/:id",authMiddleware,userController.getUser)

module.exports = router;