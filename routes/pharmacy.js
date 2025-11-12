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
    // const products = await db.query("SELECT * FROM products");
    const result = await db.query("SELECT * FROM medicines");
    const pharmacyResult = await db.query("SELECT * FROM pharmacy");
    const pharmacyData = pharmacyResult[0][0];
    res.render("pages/pharmacy/store", {
      title: "Pharmacy Home",
      products: result.rows,
      layout: "templates/pharmacy",
      products: [
        {
          id: 1,
          name: "Panadol Extra",
          price: 4.99,
          imageUrl: "/images/panadol.jpg",
          description: "Pain relief tablets",
        },
        {
          id: 2,
          name: "Vitamin C 1000mg",
          price: 7.5,
          imageUrl: "/images/vitamin-c.jpg",
          description: "Immune booster",
        },
        // ...
      ],
      currentPage: 1,
      totalPages: 3,
      url: req.url,
      pharmacy: pharmacyData,
    });
  } catch (error) {
    console.log(error);
  }
});
router.get("/categories", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM categories");
    const pharmacyResult = await db.query("SELECT * FROM pharmacy");
    const pharmacyData = pharmacyResult[0][0];
    res.render("pages/pharmacy/categories", {
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
router.get("/offers", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM categories");
    const pharmacyResult = await db.query("SELECT * FROM pharmacy");
    const pharmacyData = pharmacyResult[0][0];
    res.render("pages/pharmacy/offers", {
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
