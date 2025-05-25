require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const pool = require("./config/db"); // import MySQL pool
const authRoutes = require("./routes/auth");
const scadaRoutes = require("./routes/scada");
const scheduleRoutes = require("./routes/schedule");
const { startSchedules } = require("./utils/startSchedule");

const app = express();
// const router = express.Router();

app.use((req, res, next) => {
  console.log(`Received ${req.method} request for ${req.url}`);
  next();
});

app.set("trust proxy", 1);
app.use(express.json());
app.use(cookieParser());

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
      startSchedules();
    });
  } catch (err) {
    console.error("Failed to connect to DB:", err);
  }
}

startServer();
