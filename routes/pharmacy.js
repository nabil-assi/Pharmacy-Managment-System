const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("pages/pharmacy/home", {
    title: "Pharmacy Home",
    layout: "templates/pharmacy",
  });
});

module.exports = router;
