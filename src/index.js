require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const pool = require("./config/db"); // import MySQL pool
const authRoutes = require("./routes/auth");
const scadaRoutes = require("./routes/scada");
const scheduleRoutes = require("./routes/schedule");

const app = express();
// const router = express.Router();

app.set("trust proxy", 1);
app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  console.log(`Received ${req.method} request for ${req.url}`);
  next();
});

// routes
app.get("/", (req, res) => {
  res.send("Hello, world! Server is working 🎉");
});

app.use("/api/auth", authRoutes);
app.use("/api/scada", scadaRoutes);
app.use("/api/schedule", scheduleRoutes);

const PORT = process.env.PORT || 8080;

// start server only if DB is connected
async function startServer() {
  try {
    const conn = await pool.getConnection();
    console.log("DB connected!");
    conn.release(); // release the connection

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to connect to DB:", err);
  }
}

startServer();

// const cron = require('node-cron');

// async function startSchedules() {
//   const schedules = await db.query("SELECT * FROM schedules");

//   schedules.forEach(schedule => {
//     const [hour, minute] = schedule.scheduled_time.split(':');
//     const cronTime = `${+minute} ${+hour} * * *`;

//     cron.schedule(cronTime, () => {
//       const percentage = schedule.action === 'open' ? 100 : 0;
//       sendCommand(schedule.gate_id, percentage);
//     });
//   });
// }

// // Call this when your app starts
// startSchedules();
