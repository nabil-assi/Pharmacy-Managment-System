const db = require("../config/db");
const logActivity = require("../helper/activityLogger");

const categoryDelete = async (req, res) => {
  const categoryId = req.params.id;
  const userId = req.session.user?.id;

  try {
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
      text: "Category deleted successfully! Values set to NULL.",
    };
    res.redirect("/dashboard/categories");
  } catch (err) {
    console.error("Error deleting category:", err);
    res.status(500).json({ error: "Database error: " + err });
  }
};

const categoryUpdate = async (req, res) => {
  const { id, name } = req.body;
  const userId = req.session.user?.id;

  try {
    await db.query("UPDATE categories SET name = ? WHERE id = ?", [name, id]);

    await logActivity({
      user_id: userId,
      action_type: "update",
      entity_type: "category",
      entity_id: id,
      description: `Category with ID ${id} was updated to '${name}'.`,
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
  const { name } = req.body;
  const userId = req.session.user?.id;

  try {
    const [result] = await db.query("INSERT INTO categories (name) VALUES (?)", [name]);

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

