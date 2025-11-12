const db = require("../config/db");
const { checkExpiry, checkLowStock } = require("../utils/notification");
const { timeAgo } = require("../helper/helper");

const getActivity = async (req, res) => {
  
};
module.exports = {
  getActivity,
};
