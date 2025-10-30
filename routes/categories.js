const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.post("/delete/:id", async (req, res) => {
  const categoryId = req.params.id;
  try {
    await db.query("update medicines set category_id = null where category_id = ?", [categoryId]);
    await db.query("DELETE FROM categories WHERE id = ?", [categoryId]);


    req.session.message = {
      type: "danger",
      text: "Category deleted successfully! values set null ",
    };
    res.redirect("/dashboard/categories");
  } catch (err) {
    console.error("Error deleting category:", err);
    res.status(500).json({ error: "Database error : " + err });
  }
});

router.post("/update", async (req, res) => {
  const { id, name, email, phone, address } = req.body;

  try {
    await db.query(
      "UPDATE customers SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?",
      [name, email, phone, address, id]
    );

    req.session.message = {
      type: "success",
      text: `Customer '${name}' updated successfully!`,
    };
    res.redirect("/dashboard/customers");
  } catch (err) {
    console.error("Error updating customer:", err);
    req.session.message = {
      type: "danger",
      text: "Error updating customer. Please try again.",
    };
    res.redirect("/dashboard/customers");
  }
});
router.post("/add", async (req, res) => {
  const { name} = req.body;
  try {
     await db.query(
      "INSERT INTO categories (name) VALUES (?)",
      [name]
    );
    req.session.message = {
      type: "success",
      text: "Category added successfully!",
    };
    res.redirect("/dashboard/categories");
  } catch (err) {
    console.error("Error adding category:", err);
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;
