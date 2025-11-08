const express = require("express");
const router = express.Router();
const medicineController = require('../controllers/medicinesController');
router.get("/", (req, res) => {
  res.send("Medicines");  
});

router.post("/add",medicineController.medicineAdd  );

router.post("/delete/:id",medicineController.medicineDelete );
router.post("/update",medicineController.medicineUpdate);

module.exports = router;
