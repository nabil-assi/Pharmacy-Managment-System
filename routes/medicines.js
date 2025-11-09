const express = require("express");
const router = express.Router();
const medicineController = require('../controllers/medicinesController');
const { authMiddleware } = require("../middleware/auth");

router.get("/", (req, res) => {
  res.send("Medicines");  
});

router.post("/add", authMiddleware("admin"),medicineController.medicineAdd  );

router.post("/delete/:id",authMiddleware("admin"),medicineController.medicineDelete );
router.post("/update",authMiddleware("admin"),medicineController.medicineUpdate);

module.exports = router;
