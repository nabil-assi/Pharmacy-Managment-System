const express = require("express");
const db = require("../config/db");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { sendEmail } = require("../helper/emailHelper");
const logger = require("../utils/logger");

const login = async (req, res) => {
  try {
    const message = req.session?.message || null;
    delete req.session.message;

    res.render("pages/login/login", {
      title: "Login",
      message,
      layout: "templates/loginTemplate",
    });
  } catch (err) {
    // console.error("Error loading customer page:", err);
    res.status(500).send("Server error");
  }
};
const checkLogin = async (req, res) => {
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
      is_active: user.is_active,
      role: user.role,
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
};
const forgotPassword = async (req, res) => {
  try {
    const message = req.session.message;
    delete req.session.message;
    res.render("pages/login/forgot-password", {
      title: "Forgot-Password",
      layout: "templates/loginTemplate",
      message,
    });
  } catch (err) {
    console.error("Error loading customer page:", err);
    res.status(500).send("Server error");
  }
};
const forgotPasswordPost = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      req.session.message = {
        type: "error",
        text: "Please enter your email!",
      };
      return res.redirect("/login/forgot-password");
    }

    const [rows] = await db.query("SELECT * FROM staff WHERE email = ?", [
      email,
    ]);

    if (rows.length === 0) {
      req.session.message = {
        type: "error",
        text: "No account found with that email!",
      };
      return res.redirect("/login/forgot-password");
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000);

    await db.query(
      "UPDATE staff SET reset_token=?, reset_expires=? WHERE email=?",
      [token, expires, email]
    );
    const port = process.env.PORT;
    const resetLink = `http://localhost:${port}/login/reset-password/${token}`;

    const html = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
    <h2 style="color: #2c3e50;">🔐 Password Reset Request</h2>
    <p>Hello,</p>
    <p>We received a request to reset your password. Click the button below to proceed:</p>
    
    <div style="text-align: center; margin: 20px 0;">
      <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 4px;">
        Reset Password
      </a>
    </div>

    <p style="font-size: 0.9rem; color: #555;">If the button doesn't work, copy and paste this link into your browser:</p>
    <p style="word-break: break-all;"><a href="${resetLink}">${resetLink}</a></p>

    <hr style="margin: 20px 0;">
    <p style="font-size: 0.85rem; color: #888;">This link will expire in <strong>1 hour</strong>. If you didn't request a password reset, please ignore this email.</p>
  </div>
`;

    const sent = await sendEmail(email, "Reset your password", html);

    if (!sent) {
      console.error("Failed to send email to", email);
      req.session.message = {
        type: "error",
        text: "Error sending reset email. Try again later.",
      };
      return res.redirect("/login/forgot-password");
    }

    req.session.message = {
      type: "success",
      text: "Reset link sent! Check your email!",
    };
    res.redirect("/login/send-email");
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).send("Server error");
  }
};
const sendEmailB = async (req, res) => {
  try {
    res.render("pages/login/email-sent", {
      title: "Send Email",
      layout: "templates/loginTemplate",
    });
  } catch (err) {
    console.error("Error loading customer page:", err);
    res.status(500).send("Server error");
  }
};
const resetPassword = async (req, res) => {
  const resetToken = req.params.token;

  try {
    const [rows] = await db.query(
      "SELECT * FROM staff WHERE reset_token = ? AND reset_expires > NOW()",
      [resetToken]
    );

    if (rows.length === 0) {
      req.session.message = {
        type: "error",
        text: "token is invalid or has expired.",
      };
      return res.redirect("/login/forgot-password");
    }

    res.render("pages/login/reset-password", {
      title: "Reset Password",
      layout: "templates/loginTemplate",
      token: resetToken,
    });
  } catch (err) {
    console.error("Error loading reset password page:", err);
    req.session.message = {
      type: "error",
      text: "Something went wrong. Please try again later.",
    };
    res.status(500).redirect("/login");
  }
};
const changePassword = async (req, res) => {
  const { token, newPassword, confirmPassword } = req.body;

  try {
    if (!newPassword || !confirmPassword || !token) {
      req.session.message = {
        type: "error",
        text: "Please fill up all boxes! ",
      };
      console.log("Missing fields in change password request");
      return res.redirect(`/reset-password/${token}`);
    }

    if (newPassword !== confirmPassword) {
      console.log("unmatched passwords");

      req.session.message = {
        type: "error",
        text: "Unmatched Passwords! Please try again.",
      };
      return res.redirect(`/reset-password/${token}`);
    }

    const [rows] = await db.query(
      "SELECT id FROM staff WHERE reset_token = ? AND reset_expires > NOW()",
      [token]
    );

    if (rows.length === 0) {
      req.session.message = {
        type: "error",
        text: "Invalid token or token has expired.",
      };
      return res.redirect("/login/forgot-password");
    }

    const staffId = rows[0].id;

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.query(
      "UPDATE staff SET password = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?",
      [hashedPassword, staffId]
    );

    req.session.message = {
      type: "success",
      text: "password changed successfully! You can now log in with your new password.",
    };
    return res.redirect("/login");
  } catch (error) {
    console.error("Error changing password:", error);
    req.session.message = {
      type: "error",
      text: "internal server error. Please try again later.",
    };
    return res.status(500).redirect(`/reset-password/${token}`);
  }
};
const logout = (req, res) => {
  if (req.session.user) {
    console.log(`User "${req.session.user.email}" logged out`);
    req.session.destroy((err) => {
      if (err) console.error("Error destroying session:", err);
      res.redirect("/login");
    });
  } else {
    res.redirect("/login");
  }
};

module.exports = {
  login,
  checkLogin,
  forgotPassword,
  forgotPasswordPost,
  sendEmailB,
  resetPassword,
  changePassword,
  logout,
};
