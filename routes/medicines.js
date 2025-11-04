const express = require("express");
const router = express.Router();
const medicineController = require('../controllers/medicinesController');
// Add a new medicine
router.post("/add",medicineController.medicineAdd  );

router.post("/delete/:id",medicineController.medicineDelete );
router.post("/update",medicineController.medicineUpdate);

module.exports = router;
