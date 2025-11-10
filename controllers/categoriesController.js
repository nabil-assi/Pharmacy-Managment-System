const db = require("../config/db");
const logActivity = require("../helper/activityLogger");
const fs = require("fs");
const path = require("path");

const categoryDelete = async (req, res) => {
const categoryId = req.params.id;
  const userId = req.session.user?.id;

  try {
    const [rows] = await db.query("SELECT icon FROM categories WHERE id = ?", [
      categoryId,
    ]);
    const iconPath = rows[0]?.icon;

    if (iconPath && fs.existsSync(path.join("public", iconPath))) {
      fs.unlinkSync(path.join("public", iconPath));
    }

    await db.query(
      "UPDATE medicines SET category_id = NULL WHERE category_id = ?",
      [categoryId]
    );

    await db.query("DELETE FROM categories WHERE id = ?", [categoryId]);

    await logActivity({
      user_id: userId,
      action_type: "delete",
      entity_type: "category",
      entity_id: categoryId,
      description: `Category with ID ${categoryId} was deleted. All related medicines set to NULL.`,
      ip_address: req.ip,
      user_agent: req.headers["user-agent"],
    });

    req.session.message = {
      type: "danger",
      text: "Category deleted successfully! Icon removed and medicines unlinked.",
    };
    res.redirect("/dashboard/categories");
  } catch (err) {
    console.error("Error deleting category:", err);
    res.status(500).json({ error: "Database error: " + err });
  }
};

const categoryUpdate = async (req, res) => {
  const { id, name, description, is_active } = req.body;
  const userId = req.session.user?.id;

  try {
    const [rows] = await db.query("SELECT icon FROM categories WHERE id = ?", [
      id,
    ]);
    const oldIcon = rows[0]?.icon;

    let iconPath = oldIcon;

    if (req.file) {
      iconPath = "/uploads/icons/" + req.file.filename;

      if (oldIcon && fs.existsSync(path.join("public", oldIcon))) {
        fs.unlinkSync(path.join("public", oldIcon));
      }
    }

    await db.query(
      `UPDATE categories SET name = ?, description = ?, is_active = ?, icon = ? WHERE id = ?`,
      [name, description, is_active, iconPath, id]
    );

    await logActivity({
      user_id: userId,
      action_type: "update",
      entity_type: "category",
      entity_id: id,
      description: `Category updated: ${name} (ID: ${id})`,
      ip_address: req.ip,
      user_agent: req.headers["user-agent"],
    });

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
};

const categoryAdd = async (req, res) => {
  const { name, description, is_active } = req.body;
  const userId = req.session.user?.id;

  try {
    let iconPath = null;
    if (req.file) {
      iconPath = "/uploads/icons/" + req.file.filename;
    }

    const [result] = await db.query(
      `INSERT INTO categories (name, description, is_active, icon) VALUES (?, ?, ?, ?)`,
      [name, description, is_active, iconPath]
    );

    await logActivity({
      user_id: userId,
      action_type: "add",
      entity_type: "category",
      entity_id: result.insertId,
      description: `New category '${name}' added with ID ${result.insertId}.`,
      ip_address: req.ip,
      user_agent: req.headers["user-agent"],
    });

    req.session.message = {
      type: "success",
      text: "Category added successfully!",
    };
    res.redirect("/dashboard/categories");
  } catch (err) {
    console.error("Error adding category:", err);
    res.status(500).json({ error: "Database error" });
  }
};

module.exports = {
  categoryDelete,
  categoryUpdate,
  categoryAdd,
};
