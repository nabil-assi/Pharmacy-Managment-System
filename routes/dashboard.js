const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth");
const dashboardController = require("../controllers/dashboardController");
const { checkExpiry, checkLowStock } = require("../utils/notification");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/pharmacy");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

router.get("/", authMiddleware(), dashboardController.mainPage);
router.get("/products", authMiddleware(), dashboardController.medicinePage);
router.get(
  "/customers/:id",
  authMiddleware(),
  dashboardController.customerPage
);
router.get("/customers", authMiddleware(), dashboardController.customersPage);
router.get("/sales", authMiddleware(), dashboardController.salesPage);
router.get("/categories", authMiddleware(), dashboardController.categoriesPage);
router.get("/staff", authMiddleware("admin"), dashboardController.staffPage);
router.get(
  "/prescriptions",
  authMiddleware(),
  dashboardController.prescriptionsPage
);
router.get("/batches", authMiddleware(), dashboardController.batchesPage);

router.get("/activity", authMiddleware(), dashboardController.activityPage);
router.get("/offers", authMiddleware(), dashboardController.offersPage);
router.post("/offers/update", authMiddleware("admin"), dashboardController.offerUpdate);

router.get(
  "/settings",
  authMiddleware("admin"),
  dashboardController.settingsPage
);
router.post(
  "/settings/update",
  authMiddleware("admin"),
  upload.single("image"),
  dashboardController.settingsUpdate
);
router.get("/profile", authMiddleware(), dashboardController.profilePage);
router.post("/profile", authMiddleware(), dashboardController.profileUpdate);

module.exports = router;
