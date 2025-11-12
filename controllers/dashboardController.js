const express = require("express");
const db = require("../config/db");
const { formatDate } = require("../utils/helper");
const { checkExpiry, checkLowStock } = require("../utils/notification");
const logger = require("../utils/logger");
const { timeAgo } = require("../helper/helper");

const { getPagination } = require("../helper/pagination");

const mainPage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;

    const [medicines] = await db.query("SELECT * FROM medicines");
    const [customers] = await db.query("SELECT * FROM customers");

    const [countResult] = await db.query("SELECT COUNT(*) AS count FROM sales");
    const totalRows = countResult[0].count;

    const { offset, rowsPerPage, totalPages } = getPagination(
      page,
      totalRows,
      5
    );

    const [sales] = await db.query(
      `
      SELECT
        sales.*,
        customers.name AS customer_name,
        medicines.name AS medicine_name
      FROM sales
      LEFT JOIN customers ON sales.customer_id = customers.id
      LEFT JOIN medicines ON sales.medicine_id = medicines.id
      ORDER BY sale_date DESC, sales.id DESC
      LIMIT ? OFFSET ?
    `,
      [rowsPerPage, offset]
    );

    const formattedSales = sales.map((sale) => ({
      ...sale,
      sale_date_formatted: formatDate(sale.sale_date),
    }));

    const message = req.session.message;
    delete req.session.message;

    const expiryAlerts = await checkExpiry();
    const lowStockAlerts = await checkLowStock();

    res.render("pages/main", {
      medicines,
      customers,
      sales: formattedSales,
      currentPage: page,
      totalPages,
      title: "Dashboard",
      url: req.url,
      message,
      layout: "templates/index",
      req,
      lowStockAlerts: expiryAlerts,
      expiryAlerts: lowStockAlerts,
    });
  } catch (err) {
    logger.error("Error in mainPage controller: %o", err);
    console.error("Error fetching dashboard data:", err);
    res.status(500).json({ error: "Database error" });
  }
};

const medicinePage = async (req, res) => {
  try {
    const [categories] = await db.query("SELECT * FROM categories");

    const [medicines] = await db.query(`
      SELECT 
        m.*, 
        c.name AS category_name
      FROM medicines m
      LEFT JOIN categories c ON m.category_id = c.id
    `);

    // console.log(medicines);
    const formattedMedicines = medicines.map((med) => ({
      ...med,
      expiry_date_formatted: formatDate(med.expiry_date),
    }));

    const message = req.session.message;
    delete req.session.message;
    const expiryAlerts = await checkExpiry();
    const lowStockAlerts = await checkLowStock();

    res.render("pages/medicines", {
      medicines: formattedMedicines,
      categories: categories,
      title: "Medicines",
      url: req.url,
      message,
      layout: "templates/index",
      req,
      lowStockAlerts: lowStockAlerts,
      expiryAlerts: expiryAlerts,
    });
  } catch (err) {
    console.error("Error fetching medicines:", err);
    res.status(500).json({ error: "Database error" });
  }
};
const customerPage = async (req, res) => {
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
    const expiryAlerts = await checkExpiry();
    const lowStockAlerts = await checkLowStock();
    res.render("pages/customer", {
      customer,
      sales: formattedSales,
      title: `Customer: ${customer.name}`,
      url: req.url,
      message,
      layout: "templates/index",
      req,
      lowStockAlerts: lowStockAlerts,
      expiryAlerts: expiryAlerts,
    });
  } catch (err) {
    console.error("Error loading customer page:", err);
    res.status(500).send("Server error");
  }
};
const customersPage = async (req, res) => {
  try {
    const [customers] = await db.query("SELECT * FROM customers");
    const message = req.session.message;
    delete req.session.message;
    const expiryAlerts = await checkExpiry();
    const lowStockAlerts = await checkLowStock();
    res.render("pages/customers", {
      title: "Customers",
      customers,
      url: req.url,
      message,
      layout: "templates/index",
      req,
      lowStockAlerts: lowStockAlerts,
      expiryAlerts: expiryAlerts,
    });
  } catch (err) {
    console.error("Error fetching customers:", err);
    res.status(500).json({ error: "Database error" });
  }
};
const salesPage = async (req, res) => {
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
    const expiryAlerts = await checkExpiry();
    const lowStockAlerts = await checkLowStock();
    res.render("pages/sales", {
      medicines,
      customers,
      sales: formattedSales,
      title: "Dashboard",
      url: req.url,
      message,
      layout: "templates/index",
      req,
      lowStockAlerts: lowStockAlerts,
      expiryAlerts: expiryAlerts,
    });
  } catch (err) {
    console.error("Error fetching dashboard data:", err);
    res.status(500).json({ error: "Database error" });
  }
};
const categoriesPage = async (req, res) => {
  try {
    const [categories] = await db.query("SELECT * FROM categories");
    const message = req.session.message;
    delete req.session.message;
    const expiryAlerts = await checkExpiry();
    const lowStockAlerts = await checkLowStock();
    res.render("pages/categories", {
      title: "Categories",
      categories,
      url: req.url,
      message,
      layout: "templates/index",
      req,
      lowStockAlerts: lowStockAlerts,
      expiryAlerts: expiryAlerts,
    });
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ error: "Database error" });
  }
};
const staffPage = async (req, res) => {
  try {
    const [stuff] = await db.query("SELECT * FROM staff");
    const message = req.session.message;
    delete req.session.message;
    const expiryAlerts = await checkExpiry();
    const lowStockAlerts = await checkLowStock();
    res.render("pages/staff", {
      title: "Pharmacists",
      stuff,
      url: req.url,
      message,
      layout: "templates/index",
      req,
      lowStockAlerts: lowStockAlerts,
      expiryAlerts: expiryAlerts,
    });
  } catch (err) {
    console.error("Error fetching pharmacists:", err);
    res.status(500).json({ error: "Database error" });
  }
};
const prescriptionsPage = async (req, res) => {
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
      lowStockAlerts: checkLowStock,
      expiryAlerts: checkExpiry,
    });
  } catch (err) {
    console.error("Error fetching prescriptions:", err);
    res.status(500).json({ error: "Database error" });
  }
};
const batchesPage = async (req, res) => {
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
      lowStockAlerts: checkLowStock,
      expiryAlerts: checkExpiry,
    });
  } catch (err) {
    console.error("Error fetching batches:", err);
    res.status(500).json({ error: "Database error" });
  }
};
const activityPage = async (req, res) => {
  try {
    const [logs] = await db.query(`
  SELECT 
    activity_logs.*, 
    staff.name AS user_name 
  FROM activity_logs 
  LEFT JOIN staff ON activity_logs.user_id = staff.id 
  ORDER BY activity_logs.timestamp DESC
`);

    const enrichedLogs = logs.map((log) => ({
      ...log,
      timeAgo: timeAgo(log.timestamp),
      user_name: log.user_name || "Unknown User",
    }));

    const message = req.session.message;
    delete req.session.message;

    const expiryAlerts = await checkExpiry();
    const lowStockAlerts = await checkLowStock();

    res.render("pages/activity", {
      logs: enrichedLogs,
      title: "Activity Logs",
      url: req.url,
      layout: "templates/index",
      req,
      message,
      lowStockAlerts: expiryAlerts,
      expiryAlerts: lowStockAlerts,
    });
  } catch (error) {
    console.error("Error loading activity logs:", error);
    res.status(500).send("Server error");
  }
};
const offersPage = async (req, res) => {
  try {
    const expiryAlerts = await checkExpiry();
    const lowStockAlerts = await checkLowStock();
    const message = req.session.message;
    delete req.session.message;
    res.render("pages/offers", {
      title: "Offers",
      layout: "templates/index",
      url: req.url,
      req,
      message,
      lowStockAlerts: lowStockAlerts,
      expiryAlerts: expiryAlerts,
    });
    res.render();
  } catch (error) {
    console.log(error);
  }
};
const settingsPage = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM pharmacy");
    const pharmacy = rows[0];

    const message = req.session.message;
    delete req.session.message;
    const expiryAlerts = await checkExpiry();
    const lowStockAlerts = await checkLowStock();
    res.render("pages/settings", {
      title: "Settings",
      pharmacy,
      url: req.url,
      message,
      layout: "templates/index",
      req,
      lowStockAlerts: lowStockAlerts,
      expiryAlerts: expiryAlerts,
    });
  } catch (err) {
    console.error("Error fetching pharmacy:", err);
    res.status(500).json({ error: "Database error" });
  }
};
const settingsUpdate = async (req, res) => {
  try {
    const { id, pharmacy_name, address, phone_number, email, working_hours } =
      req.body;

    const [rows] = await db.query("SELECT image FROM pharmacy WHERE id = ?", [
      id,
    ]);
    const oldImage = rows[0]?.image;

    let imageUrl = oldImage;
    if (req.file) {
      imageUrl = "/uploads/pharmacy/" + req.file.filename;

      if (oldImage && fs.existsSync("public" + oldImage)) {
        fs.unlinkSync("public" + oldImage);
      }
    }

    await db.query(
      "UPDATE pharmacy SET pharmacy_name=?, address=?, phone_number=?, email=?, working_hours=?, image=?",
      [pharmacy_name, address, phone_number, email, working_hours, imageUrl]
    );

    req.session.message = {
      type: "success",
      text: "Updated pharmacy settings successfully!",
    };
    res.redirect("/dashboard");
  } catch (err) {
    console.error("Error updating settings:", err);
    res.status(500).send("Server error");
  }
};
const profilePage = async (req, res) => {
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
    const expiryAlerts = await checkExpiry();
    const lowStockAlerts = await checkLowStock();
    const user = rows[0];
    res.render("pages/profile", {
      title: "Profile",
      user,
      message,
      url: req.url,
      req,
      lowStockAlerts: lowStockAlerts,
      expiryAlerts: expiryAlerts,
      layout: "templates/index",
    });
  } catch (err) {
    console.error("Error loading profile:", err);
    res.status(500).send("Server error");
  }
};
const profileUpdate = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { name, email, gender, phone, password } = req.body;

    let query = "UPDATE staff SET name=?, email=?, gender=?, phone=?";
    const params = [name, email, gender, phone];

    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += ", password=?";
      params.push(hashedPassword);
    }

    query += " WHERE id=?";
    params.push(userId);

    await db.query(query, params);

    req.session.message = {
      type: "success",
      text: "Updated profile successfully!",
    };
    // console.log(`User ${email} updated their profile`);
    res.redirect("/dashboard/profile");
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).send("Server error");
  }
};

module.exports = {
  mainPage,
  medicinePage,
  customerPage,
  customersPage,
  salesPage,
  categoriesPage,
  staffPage,
  prescriptionsPage,
  batchesPage,
  settingsPage,
  settingsUpdate,
  offersPage,
  activityPage,
  profilePage,
  profileUpdate,
};
