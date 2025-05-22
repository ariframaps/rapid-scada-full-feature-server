const express = require("express");
const router = express.Router();
const { authenticateToken, authorizeRole } = require("../middlewares/auth");
const scadaClient = require("../utils/scadaClient");
const db = require("../config/db");

router.get("/getData", authenticateToken, async (req, res) => {
  try {
    const { channels } = req.query; // contoh ?channels=101,102
    if (!channels)
      return res.status(400).json({ message: "Channels required" });

    const data = await scadaClient.getCurData(channels);
    res.status(200).json(data);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: err.message });
  }
});

// hanya admin boleh kirim command
router.post(
  "/sendCommand",
  authenticateToken,
  authorizeRole("admin"),
  async (req, res) => {
    try {
      const { channelNum, cmdVal } = req.body;
      if (!channelNum || cmdVal === undefined) {
        return res
          .status(400)
          .json({ message: "channelNum and cmdVal required" });
      }

      const result = await scadaClient.sendCommand(channelNum, cmdVal);
      console.log("successfully send command");
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

router.get("/getChannels", authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM gates");
    res.status(200).json({ ok: true, gates: rows });
  } catch (err) {
    console.error("error fetching gates ", err.message);
    res
      .status(500)
      .json({ ok: false, msg: "Error fetching gates", error: err.message });
  }
});

router.get("/getChannel/:channelName", authenticateToken, async (req, res) => {
  const { channelName } = req.params;

  try {
    const [rows] = await db.execute(
      "SELECT id, channel_number, channel_name FROM gates WHERE channel_name = ?",
      [channelName]
    );
    if (rows.length === 0) {
      console.log("gate not found");
    }
    res.status(200).json({ ok: true, gate: rows[0] });
  } catch (err) {
    console.error("error fetching gate", err.message);
    res
      .status(500)
      .json({ ok: false, msg: "Error fetching gate", error: err.message });
  }
});

module.exports = router;
