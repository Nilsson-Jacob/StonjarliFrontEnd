import React, { useEffect, useState } from "react";
import EarningsGrid from "../components/EarningsGrid";

// Fetch list of upcoming earnings
const axios = require("axios").default;
const apiKey = "cupln21r01qk8dnkqkcgcupln21r01qk8dnkqkd0";

const baseURL = "https://finnhub.io/api/v1";

const Home = () => {
  const [earnings, setEarnings] = useState([]);

  useEffect(() => {
    getUpcomingEarnings().then(setEarnings);
  }, []);

  const API_BASE = "http://localhost:5000/api/stocks"; // Use your deployed URL in production

  async function getUpcomingEarnings() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 2);
    const to = yesterday.toISOString().split("T")[0];

    const from = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // past 1 day
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

      const raw = res.data.earningsCalendar || [];

      const filtered = await Promise.all(
        raw.map(async (entry) => {
          const surpriseRatio = entry.epsActual / entry.epsEstimate;

          // Basic EPS check
          if (!entry.epsActual || !entry.epsEstimate || surpriseRatio <= 1.1)
            return false;

          // Only include AMC/BMO (after-market or before-market)
          if (entry.hour !== "amc" && entry.hour !== "bmo") return false;

          // Fetch price, volume, market cap
          try {
            const quoteRes = await axios.get(`${baseURL}/quote`, {
              params: { symbol: entry.symbol, token: apiKey },
            });

            const profileRes = await axios.get(`${baseURL}/stock/profile2`, {
              params: { symbol: entry.symbol, token: apiKey },
            });

            const price = quoteRes.data.c;
            const marketCap = profileRes.data.marketCapitalization;

            if (
              price > 5 &&
              marketCap > 500 // in millions
            ) {
              const opportunity = {
                ...entry,
                price,
                comparisonEPS: surpriseRatio,
                buyDate: new Date().toISOString().split("T")[0],
              };

              const saved =
                JSON.parse(localStorage.getItem("savedStocks")) || [];
              const exists = saved.find((item) => item.symbol === entry.symbol);

              if (!exists) {
                saved.push(opportunity);
                localStorage.setItem("savedStocks", JSON.stringify(saved));
              }

              return {
                ...entry,
                price,
                marketCap,
                comparisonEPS: surpriseRatio,
              };
            }

            return false;
          } catch (err) {
            console.warn(
              `Error fetching details for ${entry.symbol}:`,
              err.message
            );
            return false;
          }
        })
      );

      return filtered.filter((e) => e);
    } catch (err) {
      console.error("Error fetching earnings from Finnhub:", err.message);
      return [];
    }
  }
  return (
    <div>
      <div>
        <h1 style={{ textAlign: "center" }}>Earnings Highlights</h1>
        <EarningsGrid earnings={earnings} />
      </div>
      <div>how many pass the? : {earnings.length}</div>
    </div>
  );
};

export default Home;
