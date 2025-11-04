const express = require("express");
const router = express.Router();
const staffController = require("../controllers/staffController");
const { authMiddleware } = require("../middleware/auth"); 
router.post(
  "/delete/:id",
  authMiddleware("admin"),
  staffController.staffDelete
);

router.post("/update", authMiddleware("admin"), staffController.staffUpdate);
router.post("/add", authMiddleware("admin"), staffController.staffAdd);

module.exports = router;
