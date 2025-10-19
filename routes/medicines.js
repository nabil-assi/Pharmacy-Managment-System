const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Get all medicines
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM medicines");
    // res.json(rows);
    res.render('pages/medicines', {rows,
      title: "Medicines List",
      url: req.url

    });
  } catch (err) {
    console.error("Error fetching medicines:", err);
    res.status(500).json({ error: "Database error" });
  }
});


// // Add a new medicine
// router.post('/', async (req, res) => {
//   const { name, category_id, price, quantity, batch_id, expiry_date } = req.body;
//   try {
//     const [result] = await db.query(
//       'INSERT INTO medicines (name, category_id, price, quantity, batch_id, expiry_date) VALUES (?, ?, ?, ?, ?, ?)',
//       [name, category_id, price, quantity, batch_id, expiry_date]
//     );
//     res.status(201).json({ id: result.insertId, message: 'Medicine added successfully' });
//   } catch (err) {
//     console.error('Error adding medicine:', err);
//     res.status(500).json({ error: 'Database error' });
//   }
// });

module.exports = router;
