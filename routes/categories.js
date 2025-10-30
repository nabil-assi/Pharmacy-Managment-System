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
  const { id, name } = req.body;

  try {
    await db.query(
      "UPDATE categories SET name = ? WHERE id = ?",
      [name, id]
    );

    req.session.message = {
      type: "success",
      text: `Category '${name}' updated successfully!`,
    };
    res.redirect("/dashboard/categories");
  } catch (err) {
    console.error("Error updating category:", err);
    req.session.message = {
      type: "danger",
      text: "Error updating category. Please try again.",
    };
    res.redirect("/dashboard/categories");
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
