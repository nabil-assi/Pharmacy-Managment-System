const db = require("../config/db");
const { checkExpiry, checkLowStock } = require("../utils/notification");
const { timeAgo } = require('../helper/helper');


const getActivity = async (req, res) => {
  try {
    const [logs] = await db.query(
      "SELECT * FROM activity_logs ORDER BY timestamp DESC"
    );

    // enrich logs with timeAgo
    const enrichedLogs = logs.map((log) => ({
      ...log,
      timeAgo: timeAgo(log.timestamp),
    }));

    const message = req.session.message;
    delete req.session.message;

    const expiryAlerts = await checkExpiry();
    const lowStockAlerts = await checkLowStock();

    res.render("pages/activity", {
      logs: enrichedLogs,
      title: "Activity Logs",
      url: req.url,
      layout: "templates/index",
      req,
      message,
      lowStockAlerts: expiryAlerts,
      expiryAlerts: lowStockAlerts,
    });
  } catch (error) {
    console.error("Error loading activity logs:", error);
    res.status(500).send("Server error");
  }
} 
module.exports = {
    getActivity,
}