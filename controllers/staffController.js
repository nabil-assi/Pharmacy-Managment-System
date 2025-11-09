const db = require("../config/db");
const logActivity = require("../helper/activityLogger");

const staffDelete = async (req, res) => {
  const staffId = req.params.id;
  const userId = req.session.user?.id;

  try {
    await db.query("DELETE FROM staff WHERE id = ?", [staffId]);

    await logActivity({
      user_id: userId,
      action_type: "delete",
      entity_type: "staff",
      entity_id: staffId,
      description: `Staff member with ID ${staffId} was deleted by user ${userId}.`,
      ip_address: req.ip,
      user_agent: req.headers["user-agent"],
    });

    req.session.message = {
      type: "danger",
      text: "Staff deleted successfully!",
    };
    res.redirect("/dashboard/staff");
  } catch (err) {
    console.error("Error deleting staff:", err);
    res.status(500).json({ error: "Database error : " + err });
  }
};

const staffUpdate = async (req, res) => {
  const { id, name, email, gender, phone, password, is_active, role } = req.body;
  const userId = req.session.user?.id;

  let query =
    "UPDATE staff SET name = ?, email = ?, gender = ?, is_active=?, phone = ?, role = ?";
  let params = [name, email, gender, is_active, phone, role];

  if (password) {
    query += ", password = ?";
    params.push(password);
  }

  query += " WHERE id = ?";
  params.push(id);

  try {
    await db.query(query, params);

    await logActivity({
      user_id: userId,
      action_type: "update",
      entity_type: "staff",
      entity_id: id,
      description: `Staff member '${name}' (ID: ${id}) was updated by user ${userId}.`,
      ip_address: req.ip,
      user_agent: req.headers["user-agent"],
    });

    req.session.message = {
      type: "success",
      text: `'${name}' staff member updated successfully!`,
    };
    res.redirect("/dashboard/staff");
  } catch (err) {
    console.error("Error updating staff member:", err);
    req.session.message = {
      type: "danger",
      text: "Error updating staff member. Please try again.",
    };
    res.redirect("/dashboard/staff");
  }
};

const staffAdd = async (req, res) => {
  const { name, email, gender, phone, password, role, is_active } = req.body;
  const userId = req.session.user?.id;

  try {
    const [result] = await db.query(
      "INSERT INTO staff (name, email, gender, phone, password, role, is_active, created_at) VALUES (?,?,?,?,?,?,?, now())",
      [name, email, gender, phone, password, role, is_active]
    );

    await logActivity({
      user_id: userId,
      action_type: "add",
      entity_type: "staff",
      entity_id: result.insertId,
      description: `New staff member '${name}' (ID: ${result.insertId}) added by user ${userId}.`,
      ip_address: req.ip,
      user_agent: req.headers["user-agent"],
    });

    req.session.message = {
      type: "success",
      text: "Staff added successfully!",
    };
    res.redirect("/dashboard/staff");
  } catch (err) {
    console.error("Error adding staff:", err);
    res.status(500).json({ error: "Database error" });
  }
};

module.exports = {
  staffDelete,
  staffUpdate,
  staffAdd,
};

