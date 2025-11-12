const express = require("express");
const router = express.Router();
const db = require("../config/db");
router.get("/", async (req, res) => {
  try {
    const [products] = await db.query(`
  SELECT m.id, m.name, m.category_id, c.name AS category_name, 
         m.price, m.quantity, m.expiry_date, m.min_quantity, m.image, m.offer
  FROM medicines m
  LEFT JOIN categories c ON m.category_id = c.id
  ORDER BY m.offer DESC
  LIMIT 4
`);

    const [pharmacyRows] = await db.query("SELECT * FROM pharmacy");
    const pharmacyData = pharmacyRows[0];

    res.render("pages/pharmacy/home", {
      title: "Pharmacy Home",
      products,
      pharmacy: pharmacyData,
      layout: "templates/pharmacy",
      url: req.url,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error loading pharmacy page");
  }
});
router.get("/store", async (req, res) => {
  try {
    const [products] = await db.query(`
      SELECT m.id, m.name, m.category_id, c.name AS category_name,
             m.price, m.quantity, m.min_quantity, m.image, m.offer AS discount, m.description
      FROM medicines m
      LEFT JOIN categories c ON m.category_id = c.id
      ORDER BY m.name ASC
    `);

    const [pharmacyRows] = await db.query("SELECT * FROM pharmacy");
    const pharmacyData = pharmacyRows[0];

    res.render("pages/pharmacy/store", {
      title: "Pharmacy Store",
      products,
      layout: "templates/pharmacy",
      currentPage: 1,
      totalPages: 3,
      url: req.url,
      pharmacy: pharmacyData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error loading store page");
  }
});
router.get("/categories", async (req, res) => {
  try {
    const [categories] = await db.query("SELECT * FROM categories"); // rows فقط
    const [pharmacyRows] = await db.query("SELECT * FROM pharmacy");
    const pharmacyData = pharmacyRows[0];

    console.log(categories);  

    res.render("pages/pharmacy/categories", {
      title: "Product Categories",
      layout: "templates/pharmacy",
      categories,  
      pharmacy: pharmacyData,
      url: req.url,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).send("Server Error");
  }
});
router.get("/offers", async (req, res) => {
  try {
     const [products] = await db.query(
      "SELECT * FROM medicines WHERE offer > 0 ORDER BY offer"
    );

    const [pharmacyRows] = await db.query("SELECT * FROM pharmacy");
    const pharmacyData = pharmacyRows[0];

    res.render("pages/pharmacy/offers", {
      title: "Offers",
      layout: "templates/pharmacy",
      products,  
      pharmacy: pharmacyData,
      url: req.url,
    });
  } catch (error) {
    console.error("Error fetching offers:", error);
    res.status(500).send("Server Error");
  }
});

router.get("/contact", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM categories");
    const pharmacyResult = await db.query("SELECT * FROM pharmacy");
    const pharmacyData = pharmacyResult[0][0];
    res.render("pages/pharmacy/contact", {
      title: "Product Categories",
      layout: "templates/pharmacy",
      categories: result.rows,
      pharmacy: pharmacyData,
      url: req.url,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).send("Server Error");
  }
});
module.exports = router;
