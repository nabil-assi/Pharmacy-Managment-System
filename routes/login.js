const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcrypt");
 
router.get("/", async (req, res) => {
  try {
    const message = req.session.message;
    delete req.session.message;

    res.render("pages/login/login", {
      title: "Login",
      message,
      layout: "templates/loginTemplate",
    });
  } catch (err) {
    console.error("Error loading customer page:", err);
    res.status(500).send("Server error");
  }
});
router.post("/check-login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const [rows] = await db.query(
      "SELECT * FROM staff WHERE email = ? AND role = ?",
      [email, role]
    );

    if (rows.length === 0) {
      req.session.message = {
        type: "error",
        text: `Login failed: No user found with email ${email} and role "${role}"`,
      };
      // console.log(`No user found with email ${email}`);
      return res.redirect("/login");
    }
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      req.session.message = {
        type: "error",
        text: `Login failed: Incorrect password for user "${email}" with role "${role}"`,
      };
      return res.redirect("/login");
    }
     req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    req.session.message = {
      type: "success",
      text: `Login successfully ! ${user.name}`,
    };
    res.redirect("/dashboard");
    console.log(`Login successful: User "${email}" logged in as "${role}"`);
  } catch (err) {
    console.error("Server error during login:", err);
    res.status(500).send("Server error");
  }
});

router.get("/forgot-password", async (req, res) => {
  try {
    res.render("pages/login/forgot-password", {
      title: "Forgot-Password",
      layout: "templates/loginTemplate",
    });
  } catch (err) {
    console.error("Error loading customer page:", err);
    res.status(500).send("Server error");
  }
});
router.get("/send-email", async (req, res) => {
  try {
    res.render("pages/login/email-sent", {
      title: "Send Email",
      layout: "templates/loginTemplate",
    });
  } catch (err) {
    console.error("Error loading customer page:", err);
    res.status(500).send("Server error");
  }
});
router.get("/reset-password", async (req, res) => {
  try {
    res.render("pages/login/reset-password", {
      title: "Reset Password",
      layout: "templates/loginTemplate",
    });
  } catch (err) {
    console.error("Error loading customer page:", err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
