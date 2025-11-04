const db = require("../config/db");


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
    await db.query("DELETE FROM customers WHERE id = ?", [customerId]);

    //delete o,z from orders
    // as o join customers AS c ON o.id = c.customer_id where o.id = 123
    req.session.message = {
      type: "danger",
      text: "Customer deleted successfully!",
    };
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
}