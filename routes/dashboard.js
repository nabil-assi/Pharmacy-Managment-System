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
    const message = req.session.message;
    delete req.session.message;

    res.render("pages/main", {
      medicines,
      customers,
      sales: formattedSales,
      title: "Dashboard",
      url: req.url,
      message,
    });
  } catch (err) {
    console.error("Error fetching dashboard data:", err);
    res.status(500).json({ error: "Database error" });
  }
});

router.get("/medicines", async (req, res) => {
  try {
    const [categories] = await db.query("SELECT * FROM categories");
    const [medicines] = await db.query(`
      SELECT 
        medicines.*,
        categories.name AS category_name
      FROM medicines
      JOIN categories ON medicines.category_id = categories.id
    `);

    const formattedMedicines = medicines.map((med) => ({
      ...med,
      expiry_date_formatted: formatDate(med.expiry_date),
      category_name: med.category_name,
    }));

    const message = req.session.message;
    delete req.session.message;

    res.render("pages/medicines", {
      medicines: formattedMedicines,
      categories: categories,
      title: "Medicines",
      url: req.url,
      message,
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
    const message = req.session.message;
    delete req.session.message;

    res.render("pages/customer", {
      customer,
      sales: formattedSales,
      title: `Customer: ${customer.name}`,
      url: req.url,
      message,
    });
  } catch (err) {
    console.error("Error loading customer page:", err);
    res.status(500).send("Server error");
  }
});

router.get("/customers", async (req, res) => {
  try {
    const [customers] = await db.query("SELECT * FROM customers");
    const message = req.session.message;
    delete req.session.message;

    res.render("pages/customers", {
      title: "Customers",
      customers,
      url: req.url,
      message
    });
  } catch (err) {
    console.error("Error fetching customers:", err);
    res.status(500).json({ error: "Database error" });
  }
});
router.get("/sales", async (req, res) => {
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
const message = req.session.message;
    delete req.session.message;

    res.render("pages/sales", {
      medicines,
      customers,
      sales: formattedSales,
      title: "Dashboard",
      url: req.url,
      message
    });
  } catch (err) {
    console.error("Error fetching dashboard data:", err);
    res.status(500).json({ error: "Database error" });
  }
});
router.get("/categories", async (req, res) => {
  try {
    const [categories] = await db.query("SELECT * FROM categories");
    const message = req.session.message;
    delete req.session.message;

    res.render("pages/categories", {
      title: "Categories",
      categories,
      url: req.url,
      message
    });
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ error: "Database error" });
  }
});
router.get("/pharmacists", async (req, res) => {
  try {
    const [pharmacists] = await db.query("SELECT * FROM pharmacists");
    const message = req.session.message;
    delete req.session.message;

    res.render("pages/pharmacists", {
      title: "Pharmacists",
      pharmacists,
      url: req.url,
      message
    });
  } catch (err) {
    console.error("Error fetching pharmacists:", err);
    res.status(500).json({ error: "Database error" });
  }
});
router.get("/prescriptions", async (req, res) => {
  try {
    const [prescriptions] = await db.query(`
      SELECT 
        prescriptions.*,
        customers.name AS customer_name,
        pharmacists.name AS pharmacist_name
      FROM prescriptions
      JOIN customers ON prescriptions.customer_id = customers.id
      JOIN pharmacists ON prescriptions.pharmacist_id = pharmacists.id
    `);

    const formattedPrescriptions = prescriptions.map((p) => ({
      ...p,
      created_at_formatted: formatDate(p.created_at),
    }));
    const message = req.session.message;
    delete req.session.message;

    res.render("pages/prescriptions", {
      title: "Prescriptions",
      prescriptions: formattedPrescriptions,
      url: req.url,
      message
    });
  } catch (err) {
    console.error("Error fetching prescriptions:", err);
    res.status(500).json({ error: "Database error" });
  }
});
router.get("/batches", async (req, res) => {
  try {
    const [batches] = await db.query("SELECT * FROM batches");

    const formattedBatches = batches.map((batch) => ({
      ...batch,
      received_date_formatted: formatDate(batch.received_date),
    }));
const message = req.session.message;
    delete req.session.message;

    res.render("pages/batches", {
      title: "Batches",
      batches: formattedBatches,
      url: req.url,
      message
    });
  } catch (err) {
    console.error("Error fetching batches:", err);
    res.status(500).json({ error: "Database error" });
  }
});

router.get("/settings", async (req, res) => {
  try {
    const [users] = await db.query("SELECT * FROM users");
    const message = req.session.message;
    delete req.session.message;

    res.render("pages/settings", {
      title: "Settings",
      users,
      url: req.url,
      message
    });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;
