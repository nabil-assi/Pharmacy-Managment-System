const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.post("/delete/:id", async (req, res) => {
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
});

router.post("/update", async (req, res) => {
  const { id, name, email, phone, address} = req.body;

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
module.exports = router;
