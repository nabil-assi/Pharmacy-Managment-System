const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.post("/delete/:id", async (req, res) => {
  const prescriptions = req.params.id;
  try {
    await db.query("DELETE FROM prescriptions WHERE id = ?", [prescriptions]);

    req.session.message = {
      type: "danger",
      text: "prescriptions deleted successfully!",
    };
    res.redirect("/dashboard/prescriptions");
  } catch (err) {
    console.error("Error deleting prescriptions:", err);
    res.status(500).json({ error: "Database error : " + err });
  }
});

module.exports = router;
