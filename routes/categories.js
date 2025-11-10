const express = require("express");
const router = express.Router();
const categoriesController = require("../controllers/categoriesController");
const { authMiddleware } = require("../middleware/auth");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/icons");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });



router.get("/", (req, res) => {
  res.send("Categories");
});
router.post("/delete/:id", authMiddleware("admin"),categoriesController.categoryDelete);
router.post("/add", authMiddleware("admin"), upload.single("icon"), categoriesController.categoryAdd);
router.post("/update", authMiddleware("admin"), upload.single("icon"), categoriesController.categoryUpdate);
module.exports = router;
