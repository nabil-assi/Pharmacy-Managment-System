const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { sendEmail } = require("../helper/emailHelper");

router.get("/", async (req, res) => {
  try {
    const searchQuery = req.query.q || "";
    let productsQuery = `
      SELECT m.id, m.name, m.category_id, c.name AS category_name, 
             m.price, m.quantity, m.expiry_date, m.min_quantity, m.image, m.offer
      FROM medicines m
      LEFT JOIN categories c ON m.category_id = c.id
    `;

    // إذا هناك نص بحث، أضف WHERE
    if (searchQuery) {
      productsQuery += ` WHERE m.name LIKE ? OR c.name LIKE ?`;
    }

    productsQuery += ` ORDER BY m.offer DESC`;

    const [products] = searchQuery
      ? await db.query(productsQuery, [`%${searchQuery}%`, `%${searchQuery}%`])
      : await db.query(productsQuery);

    res.render("pages/pharmacy/home", {
      title: "Pharmacy Home",
      products,
      layout: "templates/pharmacy",
      url: req.url,
      session: req.session,
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

    res.render("pages/pharmacy/store", {
      title: "Pharmacy Store",
      products,
      layout: "templates/pharmacy",
      currentPage: 1,
      totalPages: 3,
      url: req.url,
      session: req.session, // <--- تمرير السيشن
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error loading store page");
  }
});
router.get("/categories", async (req, res) => {
  try {
    const [categories] = await db.query("SELECT * FROM categories"); // rows فقط

    console.log(categories);

    res.render("pages/pharmacy/categories", {
      title: "Product Categories",
      layout: "templates/pharmacy",
      categories,
      url: req.url,
      session: req.session, // <--- تمرير السيشن
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

    res.render("pages/pharmacy/offers", {
      title: "Offers",
      layout: "templates/pharmacy",
      products,
      url: req.url,
      session: req.session, // <--- تمرير السيشن
    });
  } catch (error) {
    console.error("Error fetching offers:", error);
    res.status(500).send("Server Error");
  }
});

router.get("/contact", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM categories");

    res.render("pages/pharmacy/contact", {
      title: "Product Categories",
      layout: "templates/pharmacy",
      categories: result.rows,
      url: req.url,
      session: req.session, // <--- تمرير السيشن
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).send("Server Error");
  }
});
router.get("/product/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const [productRows] = await db.query(
      `
  SELECT m.id, m.name, m.category_id, c.name AS category_name,
         m.price, m.quantity, m.expiry_date, m.min_quantity, m.image, m.offer, m.description
  FROM medicines m
  LEFT JOIN categories c ON m.category_id = c.id
  WHERE m.id = ?
  LIMIT 1
`,
      [id]
    );

    const product = productRows[0];

    const [relatedProducts] = await db.query(
      `SELECT * FROM medicines WHERE category_id = ? AND id != ? LIMIT 4`,
      [product.category_id, id]
    );

    res.render("pages/pharmacy/product", {
      title: "Pharmacy Home",
      product: product,
      relatedProducts: relatedProducts,
      layout: "templates/pharmacy",
      url: req.url,
      session: req.session, // <--- تمرير السيشن
      req,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error loading pharmacy page");
  }
});
router.get("/category/:id", async (req, res) => {
  try {
    const categoryId = req.params.id;

    const [categoryRows] = await db.query(
      `
      SELECT * FROM categories WHERE id = ?
    `,
      [categoryId]
    );
    const category = categoryRows[0];

    if (!category) {
      return res.status(404).send("Category not found");
    }

    const [products] = await db.query(
      `
      SELECT m.id, m.name, m.category_id, c.name AS category_name, 
             m.price, m.quantity, m.expiry_date, m.min_quantity, m.image, m.offer, m.description
      FROM medicines m
      LEFT JOIN categories c ON m.category_id = c.id
      WHERE m.category_id = ?
      ORDER BY m.offer DESC
    `,
      [categoryId]
    );

    res.render("pages/pharmacy/category", {
      title: category.name,
      category,
      session: req.session, // <--- تمرير السيشن

      products,
      layout: "templates/pharmacy",
      url: req.url,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error loading category page");
  }
});
router.post("/cart/add/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    const quantity = parseInt(req.body.quantity) || 1;

    const [productRows] = await db.query(
      `SELECT id, name, price, offer, image FROM medicines WHERE id = ?`,
      [productId]
    );
    const product = productRows[0];
    if (!product) return res.status(404).send("Product not found");

    if (!req.session.cart) req.session.cart = [];

    const existingIndex = req.session.cart.findIndex(
      (item) => item.id === product.id
    );
    if (existingIndex !== -1) {
      req.session.cart[existingIndex].quantity += quantity;
    } else {
      req.session.cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        offer: product.offer,
        image: product.image,
        quantity: quantity,
      });
    }

    req.session.message = {
      type: "success",
      text: `${product.name} added to cart.`,
    };

    res.redirect(req.body.redirect || req.get("referer") || "/home");
  } catch (err) {
    console.log(err);
    req.session.message = { type: "danger", text: `Error adding product.` };
    res.redirect("back");
  }
});
router.post("/cart/remove/:id", (req, res) => {
  const id = parseInt(req.params.id);
  if (req.session.cart) {
    const removedItem = req.session.cart.find((item) => item.id === id);
    req.session.cart = req.session.cart.filter((item) => item.id !== id);

    if (removedItem) {
      req.session.message = {
        type: "warning",
        text: `${removedItem.name} removed from cart.`,
      };
    }
  }
  res.redirect("/home");
});
router.get("/checkout", (req, res) => {
  try {
    const cart = req.session.cart || [];

    let total = 0;
    const cartWithSubtotal = cart.map((item) => {
      const originalPrice = Number(item.price) || 0;
      const offer = Number(item.offer) || 0;

      const price =
        offer > 0 ? originalPrice * (1 - offer / 100) : originalPrice;

      const subtotal = price * (item.quantity || 1);
      total += subtotal;

      return {
        ...item,
        price: price.toFixed(2),
        subtotal: subtotal.toFixed(2),
      };
    });

    res.render("pages/pharmacy/checkout", {
      title: "Checkout",
      cart: cartWithSubtotal,
      total: total.toFixed(2),
      pharmacy: res.locals.pharmacy || {},
      layout: "templates/pharmacy",
      url: "/checkout",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error loading checkout page");
  }
});
router.get("/checkout/confirm", (req, res) => {
  try {
    const cart = req.session.cart || [];

    if (cart.length === 0) {
      req.session.message = { type: "warning", text: "Your cart is empty." };
      return res.redirect("/checkout");
    }

    res.render("pages/pharmacy/confirm_order", {
      title: "Confirm Order",
      cart: cart,
      pharmacy: res.locals.pharmacy || {},
      layout: "templates/pharmacy",
      url: "/checkout/confirm",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error loading confirm order page");
  }
});
router.post("/contact/submit", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res
        .status(400)
        .json({ success: false, message: "Please fill all fields." });
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
        <h2 style="color: #2c3e50;">📩 New Contact Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
        <hr style="margin: 20px 0;">
        <p style="font-size: 0.85rem; color: #888;">This message was sent from your website contact form.</p>
      </div>
    `;

    const emailAdmin = process.env.EMAIL_USER;
    const sent = await sendEmail(emailAdmin, "New Contact Message", html);

    if (sent) {
      req.session.message = {
        type: "success",
        text: `Message sent successfully!`,
      };
    } else {
      res
        .status(500)
        .json({ success: false, message: "Failed to send message." });
    }
  } catch (error) {
    console.error("Contact submit error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
});
router.get("/search-result", async (req, res) => {
  try {
     const searchQuery = req.query.search || "";

    const [products] = searchQuery
      ? await db.query("SELECT * FROM medicines WHERE name LIKE ?", [
          `%${searchQuery}%`,
        ])
      : await db.query("SELECT * FROM medicines");

    res.render("pages/pharmacy/store", {
      title: "Search Results",
      layout: "templates/pharmacy",
      products: products,
      searchQuery,
      url: req.url,
      session: req.session,
      currentPage: 1,
      totalPages: 3,
        searchQuery,
    urlPath: req.path,
    session: req.session
    });
  } catch (error) {
    console.error(error);
  }
});
module.exports = router;
