const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const app = express();

// Load environment variables
dotenv.config();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// View engine setup (EJS example)
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views/templates"));
app.use(express.static(path.join(__dirname, "public")));
// Routes
const medicinesRoutes = require("./routes/medicines");

// Add more routes as needed

app.use("/medicines", medicinesRoutes);

// Home route
app.get("/", (req, res) => {
  res.render("index", { title: "Pharmacy Dashboard" });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
