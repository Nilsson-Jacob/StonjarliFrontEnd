import React, { useEffect, useState } from "react";
import EarningsGrid from "../components/EarningsGrid";

// Fetch list of upcoming earnings
const axios = require("axios").default;
const apiKey = "cupln21r01qk8dnkqkcgcupln21r01qk8dnkqkd0";

const baseURL = "https://finnhub.io/api/v1";

const Home = () => {
  const [earnings, setEarnings] = useState([]);

  const [responseFromBuy, setBuy] = useState("");

  useEffect(() => {
    getUpcomingEarnings().then(setEarnings);
  }, []);

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

      // return filtered.filter((e) => e);
      // return filtered
      //   .sort((a, b) => b.comparisonEPS - a.comparisonEPS)
      //   .slice(0, 5);

      const topBuys = filtered
        .sort((a, b) => b.comparisonEPS - a.comparisonEPS)
        .slice(0, 5);

      topBuys.forEach((stock) => {
        const opportunity = {
          ...stock,
          buyDate: new Date().toISOString().split("T")[0],
        };

        const saved = JSON.parse(localStorage.getItem("savedStocks")) || [];
        const exists = saved.find((item) => item.symbol === stock.symbol);

        if (!exists) {
          saved.push(opportunity);
          localStorage.setItem("savedStocks", JSON.stringify(saved));
        }
      });

      return topBuys;
    } catch (err) {
      console.error("Error fetching earnings from Finnhub:", err.message);
      return [];
    }
  }

  async function buyTheStocks() {
    console.log("Call Alpaca");

    const serverApi = "https://stonjarliserver.onrender.com";

    try {
      const response = await axios.post(serverApi + "/buy", {
        symbol: "AAPL",
        qty: 10,
      });

      setBuy(JSON.stringify(response));
    } catch (error) {}
  }

  return (
    <div>
      <div>
        <h1 style={{ textAlign: "center" }}>Todays catches</h1>
        <EarningsGrid earnings={earnings} />
      </div>
      <div>how many pass the? : {earnings.length}</div>
      <button onClick={buyTheStocks}>Buy</button>
      <div>Response: {responseFromBuy}</div>
    </div>
  );
};

export default Home;
