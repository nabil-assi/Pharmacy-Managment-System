const express = require("express");
const router = express.Router();
const activityController = require("../controllers/activityController");
const { authMiddleware } = require("../middleware/auth");



router.get("/", authMiddleware("adminهمه6"),activityController.getActivity );

module.exports = router;
