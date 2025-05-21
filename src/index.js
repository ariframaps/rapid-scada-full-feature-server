const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json()); // biar bisa baca JSON dari body

app.get("/", (req, res) => {
  res.send("SCADA Backend Running!");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
