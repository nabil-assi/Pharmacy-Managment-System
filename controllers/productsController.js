const db = require("../config/db");
const logActivity = require("../helper/activityLogger");
const fs = require("fs");
const path = require("path");

const productAdd = async (req, res) => {
  const { name, category_id, price, quantity, expiry_date } = req.body;
  try {
    console.log(req.body);

    let imageUrl = null;
    if (req.file) {
      imageUrl = "/uploads/products/" + req.file.filename;
    }

    const [result] = await db.query(
      `INSERT INTO medicines 
       (name, category_id, price, quantity, expiry_date, image) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, category_id, price, quantity, expiry_date, imageUrl]
    );

    req.session.message = {
      type: "success",
      text: "Product added successfully!",
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

    res.redirect("/dashboard/products");
  } catch (err) {
    console.error("Error adding product:", err);
    res.status(500).json({ error: "Database error" });
  }
};

const productUpdate = async (req, res) => {
  const { id, name, category_id, price, quantity, expiry_date, offer } = req.body;

  try {
    const [rows] = await db.query("SELECT image FROM medicines WHERE id = ?", [
      id,
    ]);
    const oldImage = rows[0]?.image;

    let imageUrl = oldImage;

    if (req.file) {
      imageUrl = "/uploads/products/" + req.file.filename;

      if (oldImage && fs.existsSync("public" + oldImage)) {
        fs.unlinkSync("public" + oldImage);
      }
    }

await db.query(
  `UPDATE medicines 
   SET name = ?, category_id = ?, price = ?, quantity = ?, expiry_date = ?, image = ?, offer = ?
   WHERE id = ?`,
  [name, category_id, price, quantity, expiry_date, imageUrl, offer, id]
);


    req.session.message = {
      type: "success",
      text: `Medicine '${name}' updated successfully!`,
    };

    await logActivity({
      user_id: req.session.user.id,
      action_type: "update",
      entity_type: "medicine",
      entity_id: id,
      description: `Medicine updated: ${name} (ID: ${id}) with price ${price} and quantity ${quantity}`,
      ip_address: req.ip,
      user_agent: req.headers["user-agent"],
    });

    res.redirect("/dashboard/products");
  } catch (err) {
    console.error("Error updating medicine:", err);
    req.session.message = {
      type: "danger",
      text: "Error updating medicine. Please try again.",
    };
    res.redirect("/dashboard/products");
  }
};

const productDelete = async (req, res) => {
  const medicineId = req.params.id;

  try {
    const [result] = await db.query("SELECT * FROM medicines WHERE id = ?", [
      medicineId,
    ]);

    if (result.length === 0) {
      req.session.message = {
        type: "warning",
        text: "Product not found.",
      };
      return res.redirect("/dashboard/products");
    }

    const medicine = result[0];

    if (medicine.image && fs.existsSync("public" + medicine.image)) {
      fs.unlinkSync("public" + medicine.image);
    }

    await db.query("DELETE FROM medicines WHERE id = ?", [medicineId]);

    req.session.message = {
      type: "danger",
      text: "Medicine deleted successfully!",
    };

    // تسجيل النشاط
    await logActivity({
      user_id: req.session.user.id,
      action_type: "delete",
      entity_type: "medicine",
      entity_id: medicine.id,
      description: `Medicine deleted: ${medicine.name} (ID: ${medicine.id}) with price ${medicine.price} and quantity ${medicine.quantity}`,
      ip_address: req.ip,
      user_agent: req.headers["user-agent"],
    });

    res.redirect("/dashboard/products");
  } catch (err) {
    console.error("Error deleting medicine:", err);
    res.status(500).json({ error: "Database error" });
  }
};

module.exports = {
  productAdd,
  productUpdate,
  productDelete,
};
