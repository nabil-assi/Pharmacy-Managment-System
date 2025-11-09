const express = require("express");
const router = express.Router();
const customersController = require("../controllers/customersController");
const { authMiddleware } = require("../middleware/auth");

router.get("/", (req, res) => {
  res.send("Customers");  
});
router.post("/delete/:id",authMiddleware("admin"),customersController.customerDelete );
router.post("/update", authMiddleware("admin"),customersController.customerUpdate );
router.post("/add", authMiddleware("admin"),customersController.customerAdd);
router.get("/print/:id",authMiddleware(), customersController.customerPrint);
module.exports = router;
