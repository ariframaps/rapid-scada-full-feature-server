// routes/schedule.js
const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { authenticateToken, authorizeRole } = require("../middlewares/auth");
const { stopAndRunAllSchedule } = require("../utils/runSchedule");

// Add a schedule (Admin only)
router.post(
  "/add",
  authenticateToken,
  authorizeRole("admin"),
  async (req, res) => {
    const { gate_id, value, scheduled_time, channel_number } = req.body;
    console.log({ gate_id, value, scheduled_time, channel_number });
    try {
      const dbRes = await db.query(
        "INSERT INTO schedules (gate_id, value, cnl, scheduled_time) VALUES (?, ?, ?, ?)",
        [gate_id, value, channel_number, scheduled_time]
      );

      await stopAndRunAllSchedule();
      console.log("Schedule added successfully");
      res.status(200).json({
        ok: true,
        newId: dbRes[0].insertId,
        msg: "Schedule added successfully",
      });
    } catch (err) {
      console.error("Error adding schedule ", err.message);
      res
        .status(500)
        .json({ ok: false, msg: "Error adding schedule", error: err.message });
    }
  }
);

// Get all schedules (Admin only)
router.get("/", authenticateToken, authorizeRole("admin"), async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM schedules");
    res.status(200).json({ ok: true, schedules: rows });
  } catch (err) {
    console.error("error fetching schedules ", err.message);
    res
      .status(500)
      .json({ ok: false, msg: "Error fetching schedules", error: err.message });
  }
});

// Delete a schedule by ID (Admin only)
router.delete(
  "/:id",
  authenticateToken,
  authorizeRole("admin"),
  async (req, res) => {
    const { id } = req.params;
    try {
      await db.query("DELETE FROM schedules WHERE id = ?", [id]);

      await stopAndRunAllSchedule();

      console.log("shedule deleted successfully");
      res.status(200).json({ ok: true, msg: "Schedule deleted successfully" });
    } catch (err) {
      console.error("error deleting shedule ", err.message);
      res.status(500).json({
        ok: false,
        msg: "Error deleting schedule",
        error: err.message,
      });
    }
  }
);

module.exports = router;
