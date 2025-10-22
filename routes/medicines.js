const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Add a new medicine
router.post("/add", async (req, res) => {
  const { name, category_id, price, quantity, expiry_date } = req.body;
  try {
    const [result] = await db.query(
      "INSERT INTO medicines (name, category_id, price, quantity, expiry_date) VALUES (?, ?, ?, ?, ?)",
      [name, category_id, price, quantity, expiry_date]
    );
    // res.status(201).json({ id: result.insertId, message: 'Medicine added successfully' });
    req.session.message = {
      type: "success",
      text: "Medicine added successfully!",
    };
    res.redirect("/dashboard/medicines");
  } catch (err) {
    console.error("Error adding medicine:", err);
    res.status(500).json({ error: "Database error" });
  }
});

router.post("/delete/:id", async (req, res) => {
  const medicineId = req.params.id;
  try {
    await db.query("DELETE FROM medicines WHERE id = ?", [medicineId]);

    req.session.message = {
      type: "danger",
      text: "Medicine deleted successfully!",
    };
    res.redirect("/dashboard/medicines");
  } catch (err) {
    console.error("Error deleting medicine:", err);
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;
