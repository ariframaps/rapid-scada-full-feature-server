const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const scadaClient = require("../utils/scadaClient");

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // cek apakah user ada apa nggak
    const [rows] = await pool.execute(
      "SELECT id, username, password, role FROM users WHERE username = ?",
      [username]
    );
    if (rows.length === 0) {
      console.log("username not found");
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // cek apakah password bener nggak
    const user = rows[0];
    const validPass = await bcrypt.compare(password, user.password);

    // kalau salah maka 401
    if (!validPass) {
      console.log("password invalid");
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Login ke Rapid SCADA dan simpan cookie di scadaClient
    const loginScadaSuccess = await scadaClient.login();
    if (!loginScadaSuccess) {
      return res
        .status(500)
        .json({ message: "Failed to login to Rapid SCADA" });
    }

    // Buat JWT
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "30m" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      // sameSite:
      maxAge: 30 * 60 * 1000, // 30 minutes in miliseconds
    });
    res.json({ token, username: user.username, role: user.role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/logout", async (req, res) => {
  try {
    const logoutScadaSuccess = await scadaClient.logout();
    if (!logoutScadaSuccess) {
      return res
        .status(500)
        .json({ message: "Failed to logout to Rapid SCADA" });
    }
    res.status(200).json({ message: "ok" });
  } catch (err) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
