const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { formatDate } = require("../utils/helper");
const { authMiddleware } = require("../middleware/auth");
router.get("/", authMiddleware(), async (req, res) => {
  try {
    const [medicines] = await db.query("SELECT * FROM medicines");
    const [customers] = await db.query("SELECT * FROM customers");
    const [sales] = await db.query(`
    SELECT
        *
    FROM
        sales
    ORDER BY
        sale_date DESC, id DESC
    LIMIT 5;
`);
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
      layout: "templates/index",
      req,
    });
  } catch (err) {
    console.error("Error fetching dashboard data:", err);
    res.status(500).json({ error: "Database error" });
  }
});
router.get("/medicines", authMiddleware(), async (req, res) => {
  try {
    const [categories] = await db.query("SELECT * FROM categories");

    const [medicines] = await db.query(`
      SELECT 
        m.*, 
        c.name AS category_name
      FROM medicines m
      LEFT JOIN categories c ON m.category_id = c.id
    `);

    const formattedMedicines = medicines.map((med) => ({
      ...med,
      expiry_date_formatted: formatDate(med.expiry_date),
    }));

    const message = req.session.message;
    delete req.session.message;

    res.render("pages/medicines", {
      medicines: formattedMedicines,
      categories: categories,
      title: "Medicines",
      url: req.url,
      message,
      layout: "templates/index",
      req,
    });
  } catch (err) {
    console.error("Error fetching medicines:", err);
    res.status(500).json({ error: "Database error" });
  }
});

router.get("/customers/:id", authMiddleware(), async (req, res) => {
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
      layout: "templates/index",
      req,
    });
  } catch (err) {
    console.error("Error loading customer page:", err);
    res.status(500).send("Server error");
  }
});

router.get("/customers", authMiddleware(), async (req, res) => {
  try {
    const [customers] = await db.query("SELECT * FROM customers");
    const message = req.session.message;
    delete req.session.message;

    res.render("pages/customers", {
      title: "Customers",
      customers,
      url: req.url,
      message,
      layout: "templates/index",
      req,
    });
  } catch (err) {
    console.error("Error fetching customers:", err);
    res.status(500).json({ error: "Database error" });
  }
});
router.get("/sales", authMiddleware(), async (req, res) => {
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
      message,
      layout: "templates/index",
      req,
    });
  } catch (err) {
    console.error("Error fetching dashboard data:", err);
    res.status(500).json({ error: "Database error" });
  }
});
router.get("/categories", authMiddleware(), async (req, res) => {
  try {
    const [categories] = await db.query("SELECT * FROM categories");
    const message = req.session.message;
    delete req.session.message;

    res.render("pages/categories", {
      title: "Categories",
      categories,
      url: req.url,
      message,
      layout: "templates/index",
      req,
    });
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ error: "Database error" });
  }
});
router.get("/staff", authMiddleware(), async (req, res) => {
  try {
    const [stuff] = await db.query("SELECT * FROM staff");
    const message = req.session.message;
    delete req.session.message;

    res.render("pages/staff", {
      title: "Pharmacists",
      stuff,
      url: req.url,
      message,
      layout: "templates/index",
      req,
    });
  } catch (err) {
    console.error("Error fetching pharmacists:", err);
    res.status(500).json({ error: "Database error" });
  }
});
router.get("/prescriptions", authMiddleware(), async (req, res) => {
  try {
    const [prescriptions] = await db.query(`
      SELECT 
        prescriptions.*,
        customers.name AS customer_name,
        staff.name AS pharmacist_name
      FROM prescriptions
      JOIN customers ON prescriptions.customer_id = customers.id
      JOIN staff ON prescriptions.pharmacist_id = staff.id
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
      message,
      layout: "templates/index",
      req,
    });
  } catch (err) {
    console.error("Error fetching prescriptions:", err);
    res.status(500).json({ error: "Database error" });
  }
});
router.get("/batches", authMiddleware(), async (req, res) => {
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
      message,
      layout: "templates/index",
      req,
    });
  } catch (err) {
    console.error("Error fetching batches:", err);
    res.status(500).json({ error: "Database error" });
  }
});

router.get("/settings", authMiddleware(), async (req, res) => {
  try {
    const pharmacy = await db.query("SELECT * FROM pharmacy");

    const message = req.session.message;
    delete req.session.message;
    // console.log(pharmacy[0]);
    res.render("pages/settings", {
      title: "Settings",
      pharmacy: pharmacy[0],
      url: req.url,
      message,
      layout: "templates/index",
      req,
    });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: "Database error" });
  }
});
router.get("/profile", authMiddleware(), async (req, res) => {
  try {
    const userId = req.session.user.id;
    const message = req.session.message;
    delete req.session.message;
    const [rows] = await db.query(
      "SELECT name, email, gender, phone FROM staff WHERE id = ?",
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).send("User not found");
    }

    const user = rows[0];
    res.render("pages/profile", {
      title: "Profile",
      user,
      message,
      url: req.url,
      req,
      layout: "templates/index",
    });
  } catch (err) {
    console.error("Error loading profile:", err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
