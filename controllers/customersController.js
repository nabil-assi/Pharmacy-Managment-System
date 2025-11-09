const db = require("../config/db");
const logActivity = require("../helper/activityLogger");

const customerAdd = async (req, res) => {
  const { name, phone, email, address } = req.body;
  try {
    const [result] = await db.query(
      "INSERT INTO customers (name, phone, email, address) VALUES (?, ?, ?, ?)",
      [name, phone, email, address]
    );
    req.session.message = {
      type: "success",
      text: "Customer added successfully!",
    };
    await logActivity({
      user_id: req.session.user.id,
      action_type: "add",
      entity_type: "customer",
      entity_id: result.insertId,
      description: `New customer added: ${name} (Phone: ${phone}) with email ${email} and address ${address}`,
      ip_address: req.ip,
      user_agent: req.headers["user-agent"],
    });
    res.redirect("/dashboard/customers");
  } catch (err) {
    console.error("Error adding customers:", err);
    res.status(500).json({ error: "Database error" });
  }
};
const customerDelete = async (req, res) => {
  const customerId = req.params.id;
  try {
    // await db.query("DELETE FROM prescriptions WHERE customer_id = ?", [customerId]);
    // await db.query("DELETE FROM customers WHERE id = ?", [customerId]);
    const [result] = await db.query("SELECT * FROM customers WHERE id = ?", [
      customerId,
    ]);
    await db.query("DELETE FROM customers WHERE id = ?", [customerId]);

    //delete o,z from orders
    // as o join customers AS c ON o.id = c.customer_id where o.id = 123
    req.session.message = {
      type: "danger",
      text: "Customer deleted successfully!",
    };

    await logActivity({
      user_id: req.session.user.id,
      action_type: "delete",
      entity_type: "customer",
      entity_id: result.insertId,
      description: `Customer delete: ${result[0].name} (Phone: ${result[0].phone}) with email ${result[0].email} and address ${result[0].address}`,
      ip_address: req.ip,
      user_agent: req.headers["user-agent"],
    });
    res.redirect("/dashboard/customers");
  } catch (err) {
    console.error("Error deleting customer:", err);
    res.status(500).json({ error: "Database error : " + err });
  }
};
const customerUpdate = async (req, res) => {
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
    await logActivity({
      user_id: req.session.user.id,
      action_type: "update",
      entity_type: "customer",
      entity_id: id,
      description: `Customer updated: ${name} (Phone: ${phone}) with email ${email} and address ${address}`,
      ip_address: req.ip,
      user_agent: req.headers["user-agent"],
    });
    res.redirect("/dashboard/customers");
  } catch (err) {
    console.error("Error updating customer:", err);
    req.session.message = {
      type: "danger",
      text: "Error updating customer. Please try again.",
    };
    res.redirect("/dashboard/customers");
  }
};
const customerPrint = async (req, res) => {
  const customerId = req.params.id;
  try {
    const [pharmacy] = await db.query(`select * from pharmacy`);
    const [sale] = await db.query(`select * from sales WHERE customer_id = ?`, [
      customerId,
    ]);

    const [customer] = await db.query(`select * from customers WHERE id = ?`, [
      [customerId],
    ]);
    const [medicine] = await db.query(`select * from medicines WHERE id = ?`, [
      sale[0].medicine_id,
    ]);

    if (!sale) {
      return res.status(404).send("Sale not found");
    }
    await logActivity({
      user_id: req.session.user.id,
      action_type: "print",
      entity_type: "customer",
      entity_id: id,
      description: `Print customer sales report: ${customer[0].name} (Phone: ${customer[0].phone}) with email ${customer[0].email} and address ${customer[0].address}`,
      ip_address: req.ip,
      user_agent: req.headers["user-agent"],
    });
    // Render without layout
    res.render("pages/printCustomerSales", {
      pharmacy: pharmacy[0],
      sale: sale[0],
      customer: customer[0],
      medicine: medicine[0],
      title: `Sale Report - ID: ${customerId}`,
      url: req.url,
      layout: false,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};
module.exports = {
  customerAdd,
  customerDelete,
  customerUpdate,
  customerPrint,
};
