//import React, { useEffect, useState } from "react";
//import EarningsGrid from "../components/EarningsGrid";
//import axios from "axios";

//const apiKey = "cupln21r01qk8dnkqkcgcupln21r01qk8dnkqkd0";
//const baseURL = "https://finnhub.io/api/v1";

//const RATE_LIMIT_MS = 1200; // Delay between requests to avoid 429

const Home = () => {
  return <div>Under construction...</div>;
  /*
  const [earnings, setEarnings] = useState([]);
  const [responseFromBuy, setBuy] = useState("");

  useEffect(() => {
    getUpcomingEarnings().then(setEarnings);
  }, []);

  // Delay helper
  const delay = (ms) => new Promise((r) => setTimeout(r, ms));

  // Simple queue runner with retries
  async function fetchWithRetry(url, params, retries = 3, backoff = 1000) {
    try {
      const res = await axios.get(url, { params });
      return res.data;
    } catch (error) {
      if (error.response && error.response.status === 429 && retries > 0) {
        console.warn(`429 rate limit hit, retrying in ${backoff}ms...`);
        await delay(backoff);
        return fetchWithRetry(url, params, retries - 1, backoff * 2);
      } else {
        throw error;
      }
    }
  }

  // Queue to process requests sequentially with delay between them
  async function processQueue(items, handler) {
    const results = [];
    for (const item of items) {
      try {
        const res = await handler(item);
        results.push(res);
      } catch (e) {
        console.warn("Failed item:", item, e.message);
        results.push(null);
      }
      await delay(RATE_LIMIT_MS);
    }
    return results;
  }

  // Fetch quote and profile for a symbol with retry and caching
  const cache = new Map();
  async function fetchDetails(symbol) {
    if (cache.has(symbol)) return cache.get(symbol);

    const quotePromise = () =>
      fetchWithRetry(`${baseURL}/quote`, { symbol, token: apiKey });
    const profilePromise = () =>
      fetchWithRetry(`${baseURL}/stock/profile2`, { symbol, token: apiKey });

    try {
      const [quote, profile] = await Promise.all([
        quotePromise(),
        profilePromise(),
      ]);
      if (!quote || !profile) throw new Error("Missing data");
      const data = { price: quote.c, marketCap: profile.marketCapitalization };
      cache.set(symbol, data);
      return data;
    } catch (e) {
      console.warn(`Error fetching details for ${symbol}:`, e.message);
      return null;
    }
  }

  async function getUpcomingEarnings() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 2);
    const to = yesterday.toISOString().split("T")[0];

    const from = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    try {
      const earningsRes = await fetchWithRetry(`${baseURL}/calendar/earnings`, {
        from,
        to,
        token: apiKey,
      });

      const raw = earningsRes.earningsCalendar || [];

      // Basic filtering first
      const filtered = raw.filter(
        (e) =>
          e.epsActual &&
          e.epsEstimate &&
          e.epsActual / e.epsEstimate > 1.1 &&
          (e.hour === "amc" || e.hour === "bmo")
      );

      // Process details with rate limited queue to avoid 429
      const detailedEntries = await processQueue(filtered, async (entry) => {
        const details = await fetchDetails(entry.symbol);
        if (details && details.price > 5 && details.marketCap > 500) {
          return {
            ...entry,
            price: details.price,
            marketCap: details.marketCap,
            comparisonEPS: entry.epsActual / entry.epsEstimate,
          };
        }
        return null;
      });

      const validEntries = detailedEntries.filter(Boolean);

      const topBuys = validEntries
        .sort((a, b) => b.comparisonEPS - a.comparisonEPS)
        .slice(0, 5);

      console.log("Top buys:", topBuys);

      const saved = JSON.parse(localStorage.getItem("savedStocks")) || [];
      let hasNewStock = false;

      topBuys.forEach(async (stock) => {
        const exists = saved.find((s) => s.symbol === stock.symbol);
        if (!exists) {
          const spyPriceRes = await fetchWithRetry(`${baseURL}/quote`, {
            symbol: "SPY",
            token: apiKey,
          });
          const spyPriceAtBuy = spyPriceRes?.c || 0;

          saved.push({
            ...stock,
            buyDate: new Date().toISOString().split("T")[0],
            spyPriceAtBuy,
          });

          hasNewStock = true;
          buyTheStocks(stock.symbol, 1);
        }
      });

      if (hasNewStock) {
        localStorage.setItem("savedStocks", JSON.stringify(saved));
      }

      return topBuys;
    } catch (e) {
      console.error("Error fetching earnings:", e.message);
      return [];
    }
  }

  async function buyTheStocks(symbol, qty) {
    console.log("Buying", symbol);

    const serverApi = "https://stonjarliserver.onrender.com";

    try {
      const response = await axios.post(serverApi + "/buy", { symbol, qty });
      setBuy(JSON.stringify(response.data || response));
      console.log("Buy response:", response.data || response);
    } catch (e) {
      console.error("Buy error:", e.message);
    }
  }

  return (
    <div>
      <h1 style={{ textAlign: "center" }}>🎣 Todays catches 🎣</h1>
      <EarningsGrid earnings={earnings} />
      <div>Filtered count: {earnings.length}</div>
      <button onClick={() => buyTheStocks("AAPL", 1)}>Buy AAPL (test)</button>
      <div>Response: {responseFromBuy}</div>
    </div>
  );*/
};

export default Home;
