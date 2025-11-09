const db = require('../config/db');

async function logActivity({ user_id, action_type, entity_type, entity_id, description, ip_address, user_agent }) {
  try {
    await db.query('INSERT INTO activity_logs SET ?', {
      user_id,
      action_type,
      entity_type,
      entity_id,
      description,
      ip_address,
      user_agent
    });
  } catch (err) {
    console.error('Error during log activity:', err);
   }
}

module.exports = logActivity;