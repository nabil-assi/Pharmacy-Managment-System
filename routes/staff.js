const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { formatDate } = require("../utils/helper");
const { authMiddleware } = require("../middleware/auth");

router.post("/delete/:id", authMiddleware("admin"), async (req, res) => {
  const staffId = req.params.id;
  try {
    await db.query("DELETE FROM staff WHERE id = ?", [staffId]);

    req.session.message = {
      type: "danger",
      text: "Staff deleted successfully!",
    };
    res.redirect("/dashboard/staff");
  } catch (err) {
    console.error("Error deleting staff:", err);
    res.status(500).json({ error: "Database error : " + err });
  }
});

router.post("/update", authMiddleware("admin"), async (req, res) => {
  const { id, name, email, gender, phone, password, is_active, role } =
    req.body;

  let query =
    "UPDATE staff SET name = ?, email = ?, gender = ?, is_active=?, phone = ?, role = ?";
  let params = [name, email, gender, is_active, phone, role];

  if (password) {
    query += ", password = ?";
    params.push(password);
  }

  query += " WHERE id = ?";
  params.push(id);

  try {
    await db.query(query, params);

    req.session.message = {
      type: "success",
      text: `'${name}' staff member updated successfully!`,
    };
    res.redirect("/dashboard/staff");
  } catch (err) {
    console.error("Error updating staff member:", err);
    req.session.message = {
      type: "danger",
      text: "Error updating staff member. Please try again.",
    };
    res.redirect("/dashboard/staff");
  }
});
router.post("/add", authMiddleware("admin"), async (req, res) => {
  const { name, email, gender, phone, password, role, is_active } = req.body;
  try {
    await db.query(
      "INSERT INTO staff (name, email, gender, phone, password, role, is_active, created_at) VALUES (?,?,?,?,?,?,?, now())",
      [name, email, gender, phone, password, role, is_active]
    );
    req.session.message = {
      type: "success",
      text: "staff added successfully!",
    };
    res.redirect("/dashboard/staff");
  } catch (err) {
    console.error("Error adding staff:", err);
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;
