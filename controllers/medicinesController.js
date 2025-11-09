const db = require("../config/db");
const logActivity = require("../helper/activityLogger");

const medicineAdd = async (req, res) => {
  const { name, category_id, price, quantity, expiry_date } = req.body;

  try {
    const [result] = await db.query(
      "INSERT INTO medicines (name, category_id, price, quantity, expiry_date) VALUES (?, ?, ?, ?, ?)",
      [name, category_id, price, quantity, expiry_date]
    );

    req.session.message = {
      type: "success",
      text: "Medicine added successfully!",
    };

    await logActivity({
      user_id: req.session.user.id,
      action_type: "add",
      entity_type: "medicine",
      entity_id: result.insertId,
      description: `New medicine added: ${name} (ID: ${result.insertId}) with price ${price} and quantity ${quantity}`,
      ip_address: req.ip,
      user_agent: req.headers["user-agent"],
    });

    res.redirect("/dashboard/medicines");
  } catch (err) {
    console.error("Error adding medicine:", err);
    res.status(500).json({ error: "Database error" });
  }
};

const medicineUpdate = async (req, res) => {
  const { id, name, category_id, price, quantity, expiry_date } = req.body;

  try {
    await db.query(
      "UPDATE medicines SET name = ?, category_id = ?, price = ?, quantity = ?, expiry_date = ? WHERE id = ?",
      [name, category_id, price, quantity, expiry_date, id]
    );

    req.session.message = {
      type: "success",
      text: `Medicine '${name}' updated successfully!`,
    };
    await logActivity({
      user_id: req.session.user.id,
      action_type: "update",
      entity_type: "medicine",
      entity_id: result.insertId,
      description: `Medicine updated: ${name} (ID: ${id}) with price ${price} and quantity ${quantity}`,
      ip_address: req.ip,
      user_agent: req.headers["user-agent"],
    });
    res.redirect("/dashboard/medicines");
  } catch (err) {
    console.error("Error updating medicine:", err);
    req.session.message = {
      type: "danger",
      text: "Error updating medicine. Please try again.",
    };
    res.redirect("/dashboard/medicines");
  }
};
const medicineDelete = async (req, res) => {
  const medicineId = req.params.id;
  try {
    const [result] = await db.query("SELECT * FROM medicines WHERE id = ?", [
      medicineId,
    ]);

    await db.query("DELETE FROM medicines WHERE id = ?", [medicineId]);

    req.session.message = {
      type: "danger",
      text: "Medicine deleted successfully!",
    };
    await logActivity({
      user_id: req.session.user.id,
      action_type: "delete",
      entity_type: "medicine",
      entity_id: result.insertId,
      description: `Medicine deleted: ${result[0].name} (ID: ${result[0].id}) with price ${result[0].price} and quantity ${result[0].quantity}`,
      ip_address: req.ip,
      user_agent: req.headers["user-agent"],
    });
    res.redirect("/dashboard/medicines");
  } catch (err) {
    console.error("Error deleting medicine:", err);
    res.status(500).json({ error: "Database error" });
  }
};

module.exports = {
  medicineAdd,
  medicineUpdate,
  medicineDelete,
};
