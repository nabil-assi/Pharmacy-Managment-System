const express = require("express");
const router = express.Router();
const salesController = require('../controllers/salesController');

router.post("/delete/:id", salesController.saleDelete);
router.post("/add", salesController.saleAdd);
router.get("/print/:id", salesController.salePrint);

module.exports = router;
