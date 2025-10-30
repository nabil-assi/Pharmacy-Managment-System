const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const expressLayouts = require("express-ejs-layouts");
const app = express();
const session = require("express-session");

// Load environment variables
dotenv.config();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.set("layout", "templates/index");

// Static files
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

// Routes
const prescriptionsRoutes = require("./routes/prescriptions");
const salesRoutes = require("./routes/sales");
const medicinesRoutes = require("./routes/medicines");
const customersRoutes = require("./routes/customers");
const dashboardRoutes = require("./routes/dashboard");
app.use("/dashboard", dashboardRoutes);
app.use("/dashboard/medicines", medicinesRoutes);
app.use("/dashboard/customers", customersRoutes);
app.use("/dashboard/sales", salesRoutes);
app.use("/dashboard/prescriptions", prescriptionsRoutes);

// Home route
app.get("/", (req, res) => {
  res.render("index", { title: "Pharmacy Dashboard" });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}/dashboard`);
});
