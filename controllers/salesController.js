const db = require("../config/db");

const saleAdd= async (req, res) => {
  const userId = req.session.user.id;
  
  const { customer_id, medicine_id, quantity } = req.body;
  const quantitySold = parseInt(quantity);

  try {
    const [medicineRows] = await db.query(
      "SELECT price, quantity AS stock FROM medicines WHERE id = ?",
      [medicine_id]
    );

    if (medicineRows.length === 0) {
      req.session.message = {
        type: "error",
        text: "Invalid medicine selected.",
      };
      return res.redirect("/dashboard/sales");
    }

    const medicine = medicineRows[0];

    if (medicine.stock < quantitySold) {
      req.session.message = {
        type: "error",
        text: `Insufficient stock. Only ${medicine.stock} available.`,
      };
      return res.redirect("/dashboard/sales");
    }

    const total_price = medicine.price * quantitySold;

    await db.query(
      "INSERT INTO sales (customer_id, medicine_id, quantity, total_price, sale_date) VALUES (?, ?, ?, ?, NOW())",
      [customer_id, medicine_id, quantitySold, total_price]
    );

    await db.query(
      "UPDATE medicines SET quantity = quantity - ? WHERE id = ?",
      [quantitySold, medicine_id]
    );

    req.session.message = {
      type: "success",
      text: "Sale operation added and stock updated successfully!",
    };
    res.redirect("/dashboard/sales");
  } catch (err) {
    console.error("Error adding sales operation:", err);
    req.session.message = {
      type: "error",
      text: "An error occurred during the sale process.",
    };
    res.redirect("/dashboard/sales");
  }
}
const saleDelete= async (req, res) => {
  const salesId = req.params.id;
  try {
    await db.query("DELETE FROM sales WHERE id = ?", [salesId]);

    req.session.message = {
      type: "danger",
      text: "Sales operation deleted successfully!",
    };
    res.redirect("/dashboard/sales");
  } catch (err) {
    console.error("Error deleting sakes:", err);
    res.status(500).json({ error: "Database error : " + err });
  }
}
const salePrint=async (req, res) => {
  const saleId = req.params.id;
  try {
    const [pharmacy] = await db.query(`select * from pharmacy`);
    const [sale] = await db.query(`select * from sales WHERE id = ?`, [saleId]);

    const [customer] = await db.query(`select * from customers WHERE id = ?`, [
      sale[0].customer_id,
    ]);
    const [medicine] = await db.query(`select * from medicines WHERE id = ?`, [
      sale[0].medicine_id,
    ]);

    if (!sale) {
      return res.status(404).send("Sale not found");
    }

    // Render without layout
    res.render("pages/printSale", {
      pharmacy: pharmacy[0] ,
      sale: sale[0] ,
      customer: customer[0],
      medicine: medicine[0],
      title: `Sale Report - ID: ${saleId}`,
      url: req.url,
      layout: false,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
}

module.exports = {
    saleAdd,
    saleDelete,
    salePrint,

}