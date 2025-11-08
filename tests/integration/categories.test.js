const request = require("supertest");
const express = require("express");
const path = require("path");
const session = require("express-session");
const expressLayouts = require("express-ejs-layouts");

const categoriesRoutes = require("../../routes/categories");

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

app.set("views", path.join(__dirname, "../../views"));
app.set("view engine", "ejs");
app.use(expressLayouts);

app.use(express.static(path.join(__dirname, "../../public")));

app.use("/dashboard/categories", categoriesRoutes);


jest.mock("../../config/db", () => ({
  query: jest.fn(() => Promise.resolve([[], []])),
  execute: jest.fn(() => Promise.resolve([[], []])),
}));

jest.mock("../../middleware/auth", () => ({
  authMiddleware: (role) => {
    return (req, res, next) => {
      req.session = req.session || {};
      req.session.user = {
        id: 1,
        name: "Test User",
        role: "admin",
        is_active: 1,
      };
      next();
    };
  },
}));



describe("GET /dashboard/categories", () => {
  test("should return 200 and contain 'Categories'", async () => {
    const res = await request(app).get("/dashboard/categories");
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain("Categories");
  });
});
