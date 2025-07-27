const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const stockRoutes = require("./routes/stocks");
app.use("/api/stocks", stockRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
