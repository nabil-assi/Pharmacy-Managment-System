const express = require("express");
const router = express.Router();
const categoriesController = require("../controllers/categoriesController");
router.get("/", (req, res) => {
  res.send("Categories");
});
router.post("/delete/:id", categoriesController.categoryDelete);
router.post("/update", categoriesController.categoryUpdate);
router.post("/add", categoriesController.categoryAdd);

module.exports = router;
