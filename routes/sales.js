const express = require("express");
const router = express.Router();
const salesController = require('../controllers/salesController');
const { authMiddleware } = require("../middleware/auth");

router.get("/", (req, res) => {
  res.send("Sales");  
});
router.post("/delete/:id", authMiddleware("admin"),salesController.saleDelete);
router.post("/add", authMiddleware("admin"),salesController.saleAdd);
router.get("/print/:id",authMiddleware(), salesController.salePrint);

module.exports = router;
