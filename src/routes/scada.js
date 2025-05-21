const express = require("express");
const router = express.Router();
const { authenticateToken, authorizeRole } = require("../middlewares/auth");
const scadaClient = require("../utils/scadaClient");

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

module.exports = router;
