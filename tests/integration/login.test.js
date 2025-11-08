const request = require("supertest");
const express = require("express");
const path = require("path");
const session = require("express-session");
const expressLayouts = require("express-ejs-layouts");

const loginRoutes = require("../../routes/login");

const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(
  session({
    secret: "test_secret",
    resave: false,
    saveUninitialized: true,
  })
);

// View engine
app.set("views", path.join(__dirname, "../../views"));
app.set("view engine", "ejs");
app.use(expressLayouts);

app.use(express.static(path.join(__dirname, "../../public")));

// Route
app.use("/login", loginRoutes);

describe("GET /login", () => {
  test("should return 200 and contain 'Login'", async () => {
    const res = await request(app).get("/login");
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain("Login");
  });
});
