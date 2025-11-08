const express = require("express");
const router = express.Router();
 const loginController = require('../controllers/loginController');
 
router.get("/", loginController.login);
router.post("/check-login", loginController.checkLogin);
router.get("/forgot-password", loginController.forgotPassword);
router.post("/forgot-password",loginController.forgotPasswordPost);
router.get("/send-email",loginController.sendEmailB);
router.get("/reset-password/:token", loginController.resetPassword );
router.post("/change-password/", loginController.changePassword );
router.get("/logout", loginController.logout);
module.exports = router;
