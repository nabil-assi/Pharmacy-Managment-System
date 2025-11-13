const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const expressLayouts = require("express-ejs-layouts");
const app = express();
const session = require("express-session");
const helmet = require("helmet");
const errorHandler = require("./middleware/errorHandler");
const navbarData = require('./middleware/navbarData');
 
app.use(helmet());
app.use(errorHandler);
dotenv.config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);

// Static files
app.use(express.static(path.join(__dirname, "public")));

//user
//flash-messages
//cart

app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 },
  })
);
app.use((req, res, next) => {
  if (!req.session.cart) req.session.cart = [];
  if (!req.session.message) req.session.message = null;
  res.locals.session = req.session;
  next();
});

app.use(navbarData);



// Routes
// Controllers
const dashboardRoutes = require("./routes/dashboard");
app.use("/dashboard", dashboardRoutes);

const productsRoutes = require("./routes/products");
app.use("/dashboard/products", productsRoutes);

const customersRoutes = require("./routes/customers");
app.use("/dashboard/customers", customersRoutes);

const salesRoutes = require("./routes/sales");
app.use("/dashboard/sales", salesRoutes);

const prescriptionsRoutes = require("./routes/prescriptions");
app.use("/dashboard/prescriptions", prescriptionsRoutes);

const categoriesRoutes = require("./routes/categories");
app.use("/dashboard/categories", categoriesRoutes);

const staffRoutes = require("./routes/staff");
app.use("/dashboard/staff", staffRoutes);

const activityRoutes = require("./routes/activity");
app.use("/dashboard/activity", activityRoutes);

const loginRoutes = require("./routes/login");
app.use("/login", loginRoutes);

const pharmacyRoute = require("./routes/pharmacy");
app.use("/home", pharmacyRoute);

const offersRoute = require("./routes/offers");
app.use("/dashboard/offers", offersRoute);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}/home`);
});
