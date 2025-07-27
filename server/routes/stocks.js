const express = require("express");
const router = express.Router();
const finnhub = require("../services/finnhubService");
const { simulateEarningsStrategy } = require("../utils/earningsHelpers");

router.get("/earnings/upcoming", async (req, res) => {
  const data = await finnhub.getUpcomingEarnings();
  res.json(data);
});

router.get("/:ticker/history", async (req, res) => {
  const ticker = req.params.ticker.toUpperCase();
  const data = await finnhub.getHistoricalPrices(ticker);
  res.json(data);
});

router.post("/simulate-strategy", async (req, res) => {
  const { ticker, days } = req.body;
  const result = await simulateEarningsStrategy(ticker.toUpperCase(), days);
  res.json(result);
});

module.exports = router;
