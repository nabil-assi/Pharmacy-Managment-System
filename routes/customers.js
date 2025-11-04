const express = require("express");
const router = express.Router();
const customersController = require("../controllers/customersController");
router.post("/delete/:id",customersController.customerDelete );

router.post("/update", customersController.customerUpdate );
router.post("/add", customersController.customerAdd);
router.get("/print/:id", customersController.customerPrint);
module.exports = router;
