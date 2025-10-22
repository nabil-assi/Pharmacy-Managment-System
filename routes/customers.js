const express = require("express");
const router = express.Router();
const db = require("../config/db");




router.post("/delete/:id", async (req, res) => {
  const customerId = req.params.id;
  try {
    await db.query("DELETE FROM customers WHERE id = ?", [customerId]);

    req.session.message = {
      type: "danger",
      text: "Customer deleted successfully!",
    };
    res.redirect("/dashboard/customers");
  } catch (err) {
    console.error("Error deleting customer:", err);
    res.status(500).json({ error: "Database error : " + err});
  }
});







module.exports = router;
