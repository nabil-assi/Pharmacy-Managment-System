const db = require("../config/db");
const { checkExpiry, checkLowStock } = require("../utils/notification");
const { timeAgo } = require("../helper/helper");

const getActivity = async (req, res) => {
  try {
    const [logs] = await db.query(`
  SELECT 
    activity_logs.*, 
    staff.name AS user_name 
  FROM activity_logs 
  LEFT JOIN staff ON activity_logs.user_id = staff.id 
  ORDER BY activity_logs.timestamp DESC
`);

    const enrichedLogs = logs.map((log) => ({
      ...log,
      timeAgo: timeAgo(log.timestamp),
      user_name: log.user_name || "Unknown User",
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
};
module.exports = {
  getActivity,
};
