const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth");
const dashboardController  = require("../controllers/dashboardController");

router.get("/", authMiddleware(), dashboardController.mainPage);
router.get("/medicines", authMiddleware(),dashboardController.medicinePage);
router.get("/customers/:id", authMiddleware(), dashboardController.customerPage);
router.get("/customers", authMiddleware(), dashboardController.customersPage);
router.get("/sales", authMiddleware(), dashboardController.salesPage);
router.get("/categories", authMiddleware(), dashboardController.categoriesPage);
router.get("/staff", authMiddleware("admin"), dashboardController.staffPage);
router.get("/prescriptions", authMiddleware(), dashboardController.prescriptionsPage);
router.get("/batches", authMiddleware(), dashboardController.batchesPage);
router.get("/settings", authMiddleware("admin"), dashboardController.settingsPage);
router.post("/settings/update", authMiddleware("admin"), dashboardController.settingsUpdate);
router.get("/profile", authMiddleware(), dashboardController.profilePage);
router.post("/profile", authMiddleware(), dashboardController.profileUpdate);

module.exports = router;
