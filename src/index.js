require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");

const app = express();

app.use(express.json());
app.use(cookieParser()); // enable cookies

// routes
const authRoutes = require("./routes/auth");
const scadaRoutes = require("./routes/scada");
const scheduleRoutes = require("./routes/schedule");

app.use("/api/auth", authRoutes);
app.use("/api/scada", scadaRoutes);
app.use("/api/schedule", scheduleRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

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
