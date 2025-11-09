const express = require("express");
const router = express.Router();
const categoriesController = require("../controllers/categoriesController");
const { authMiddleware } = require("../middleware/auth");

router.get("/", (req, res) => {
  res.send("Categories");
});
router.post("/delete/:id", authMiddleware("admin"),categoriesController.categoryDelete);
router.post("/update", authMiddleware("admin"),categoriesController.categoryUpdate);
router.post("/add", authMiddleware("admin"),categoriesController.categoryAdd);

module.exports = router;
