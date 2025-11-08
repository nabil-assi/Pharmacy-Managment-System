const db = require('../config/db'); 

async function checkExpiry() {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + 30); 
  const [rows] = await db.execute(
    'SELECT name, expiry_date FROM medicines WHERE expiry_date <= ?',
    [futureDate]
  );
  return rows; 
}

async function checkLowStock() {
  const [rows] = await db.execute(
    'SELECT name, quantity, min_quantity FROM medicines WHERE quantity <= min_quantity'
  );
  return rows; 
}

module.exports = { checkExpiry, checkLowStock };
