const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { formatDate } = require("../utils/helper");

router.get("/", async (req, res) => {
  try {
    const [medicines] = await db.query("SELECT * FROM medicines");
    const [customers] = await db.query("SELECT * FROM customers");
    const [sales] = await db.query("SELECT * FROM sales");

    for (let i = 0; i < sales.length; i++) {
      const customerId = sales[i].customer_id;
      const medicineId = sales[i].medicine_id;

      const [customerRows] = await db.query(
        "SELECT name FROM customers WHERE id = ?",
        [customerId]
      );
      sales[i].customer_name = customerRows[0]?.name || "Unknown";

      const [medicineRows] = await db.query(
        "SELECT name FROM medicines WHERE id = ?",
        [medicineId]
      );
      sales[i].medicine_name = medicineRows[0]?.name || "Unknown";
    }

    const formattedSales = sales.map((sale) => ({
      ...sale,
      sale_date_formatted: formatDate(sale.sale_date),
      customer_name: sale.customer_name,
      medicine_name: sale.medicine_name,
    }));

    res.render("pages/main", {
      medicines,
      customers,
      sales: formattedSales,
      title: "Medicines",
      url: req.url,
    });
  } catch (err) {
    console.error("Error fetching dashboard data:", err);
    res.status(500).json({ error: "Database error" });
  }
});

router.get("/medicines", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM medicines");
    // res.json(rows);
    res.render("pages/medicines", {
      rows,
      title: "Medicines List",
      url: req.url,
    });
  } catch (err) {
    console.error("Error fetching medicines:", err);
    res.status(500).json({ error: "Database error" });
  }
});

router.get("/customers/:id", async (req, res) => {
  const customerId = req.params.id;

  try {
    const [customerRows] = await db.query(
      "SELECT * FROM customers WHERE id = ?",
      [customerId]
    );
    const customer = customerRows[0];

    if (!customer) {
      return res.status(404).send("Customer not found");
    }

    const [sales] = await db.query(
      `
      SELECT 
        sales.id,
        sales.medicine_id,
        sales.quantity,
        sales.total_price,
        sales.sale_date,
        medicines.name AS medicine_name
      FROM sales
      JOIN medicines ON sales.medicine_id = medicines.id
      WHERE sales.customer_id = ?
    `,
      [customerId]
    );

    const formattedSales = sales.map((sale) => ({
      ...sale,
      sale_date_formatted: formatDate(sale.sale_date),
    }));

    res.render("pages/customer", {
      customer,
      sales: formattedSales,
      title: `Customer: ${customer.name}`,
      url: req.url,
    });
  } catch (err) {
    console.error("Error loading customer page:", err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
