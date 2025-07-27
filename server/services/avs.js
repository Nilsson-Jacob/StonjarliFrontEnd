const axios = require("axios");
const apiKey = process.env.FINNHUB_API_KEY;

const baseURL = "https://finnhub.io/api/v1";

async function getUpcomingEarnings() {
  const to = new Date().toISOString().split("T")[0];
  const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // past 7 days
    .toISOString()
    .split("T")[0];

  try {
    const res = await axios.get(`${baseURL}/calendar/earnings`, {
      params: {
        from,
        to,
        token: apiKey,
      },
    });

    // Clean up and return top 10 upcoming earnings
    const raw = res.data.earningsCalendar || [];
    return raw.slice(0, 10).map((entry) => ({
      symbol: entry.symbol,
      company: entry.company,
      date: entry.date,
      estimatedEPS: entry.epsEstimate,
      estimatedRevenue: entry.revenueEstimate,
    }));
  } catch (err) {
    console.error("Error fetching earnings from Finnhub:", err.message);
    return [];
  }
}

async function getHistoricalPrices(symbol) {
  const now = Math.floor(Date.now() / 1000);
  const oneYearAgo = now - 365 * 24 * 60 * 60;

  const res = await axios.get(`${baseURL}/stock/candle`, {
    params: {
      symbol,
      resolution: "D",
      from: oneYearAgo,
      to: now,
      token: apiKey,
    },
  });

  if (res.data.s !== "ok") {
    throw new Error("Failed to fetch price data");
  }

  return res.data.t.map((timestamp, index) => ({
    date: new Date(timestamp * 1000).toISOString().split("T")[0],
    close: res.data.c[index],
  }));
}

module.exports = {
  getUpcomingEarnings,
  getHistoricalPrices,
};
