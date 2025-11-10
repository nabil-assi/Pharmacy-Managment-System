const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");

const productsController = require("../controllers/productsController");
const { authMiddleware } = require("../middleware/auth");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/products");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

router.post(
  "/add",
  authMiddleware("admin"),
  upload.single("image"),
  productsController.productAdd
);

router.post(
  "/delete/:id",
  authMiddleware("admin"),
  productsController.productDelete
);

router.post(
  "/update",
  authMiddleware("admin"),
  upload.single("image"),
  productsController.productUpdate
);

module.exports = router;
