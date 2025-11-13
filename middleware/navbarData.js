// middleware/navbarData.js
const db = require('../config/db'); 

async function navbarData(req, res, next) {
  try {
    // جلب بيانات الصيدلية
    const [pharmacyRows] = await db.query("SELECT * FROM pharmacy");
    const pharmacyData = pharmacyRows[0] || {};

    // تمرير البيانات لكل views
    res.locals.pharmacy = pharmacyData;
    res.locals.session = req.session;

    // تمرير نص البحث الحالي (إذا موجود في query string)
    res.locals.searchQuery = req.query.search || '';

    next();
  } catch (err) {
    console.error("Error fetching navbar data:", err);
    res.locals.pharmacy = {};
    res.locals.session = req.session;
    res.locals.searchQuery = '';
    next();
  }
}

module.exports = navbarData;
