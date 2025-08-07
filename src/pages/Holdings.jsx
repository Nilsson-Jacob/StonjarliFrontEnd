import React, { useEffect, useState } from "react";
import PositionsGrid from "../components/PositionsGrid";
import axios from "axios";

const apiKey = "cupln21r01qk8dnkqkcgcupln21r01qk8dnkqkd0";
const baseURL = "https://finnhub.io/api/v1";
const SPY_SYMBOL = "SPY";

// Delay to prevent 429
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// Fetch current price via /quote
async function getCurrentPrice(symbol) {
  try {
    const res = await axios.get(`${baseURL}/quote`, {
      params: { symbol, token: apiKey },
    });
    return res.data?.c ?? null;
  } catch (e) {
    console.warn(`Error fetching price for ${symbol}`, e.message);
    return null;
  }
}

const Home = () => {
  const [positions, setPositions] = useState([]);
  const [saved, setSaved] = useState([]);
  const [dollarUp, setDollarUp] = useState(0);
  const [dollarDown, setDollarDown] = useState(0);
  const [percentUp, setPercentUp] = useState(0);
  const [percentDown, setPercentDown] = useState(0);
  const [spyGrowth, setSpyGrowth] = useState(0);

  // Fetch positions from server
  async function getPositions() {
    const serverApi = "https://stonjarliserver.onrender.com";
    try {
      const response = await axios.get(serverApi + "/positions");
      return response.data || [];
    } catch (e) {
      console.error("Error fetching positions:", e.message);
      return [];
    }
  }

  // Placeholder for buy date function
  async function getBuyDate(symbol) {
    // You can fetch this from your server using:
    const serverApi = "https://stonjarliserver.onrender.com";

    try {
      const res = await axios.get(`${serverApi}/buydate?symbol=${symbol}`);
      return res.data;
    } catch (error) {
      console.log("JN from buydate" + error);
    }
  }

  useEffect(() => {
    async function load() {
      // const arr = JSON.parse(localStorage.getItem("savedStocks")) || [];

      // Call getPositions here
      const aPositions = await getPositions();
      console.log("JN POS: " + JSON.stringify(aPositions.data));

      //setPositions(aPositions.data);

      // Optional: use getBuyDate
      for (const position of aPositions.data) {
        const dBuyDate = await getBuyDate(position.symbol);
        console.log("Buy date for", position.symbol, ":", dBuyDate);
      }

      let totalDollarUp = 0;
      let totalDollarDown = 0;
      let totalPercentUp = 0;
      let totalPercentDown = 0;

      const currentSPY = await getCurrentPrice(SPY_SYMBOL);
      const enriched = [];

      let up = 0;
      let down = 0;

      for (const stock of aPositions.data) {
        if (stock.unrealized_pl >= 0) {
          up = up + Math.abs(stock.unrealized_pl);
        } else {
          down = down + Math.abs(stock.unrealized_pl);
        }

        const spyReturn =
          currentSPY && stock.spyPriceAtBuy
            ? ((currentSPY - stock.spyPriceAtBuy) / stock.spyPriceAtBuy) * 100
            : null;

        enriched.push({
          ...stock,
          spyReturn,
        });
        await delay(1000);
      }

      setPositions(enriched);

      setDollarUp(up);
      setDollarDown(down);
      setPercentUp(0);
      setPercentDown(0);

      setSpyGrowth(
        enriched[0]?.spyPriceAtBuy
          ? ((currentSPY - enriched[0].spyPriceAtBuy) /
              enriched[0].spyPriceAtBuy) *
              100
          : 0
      );
      setSaved(enriched);
    }

    load();
  }, []);
  return (
    <div style={{ textAlign: "center" }}>
      <h1>📈 Current Holdings</h1>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "10px",
          gap: "40px",
        }}
      >
        {/* Dollar values */}
        <div style={{ textAlign: "left" }}>
          <h3>💵 Up: ${format(dollarUp)}</h3>
          <h3>📉 Down: ${format(dollarDown)}</h3>
          <h3>📈 Profit: ${format(dollarUp - dollarDown)}</h3>
        </div>

        {/* Vertical divider */}
        <div
          style={{
            borderLeft: "2px solid #ccc",
            height: "100%",
          }}
        />

        {/* Percent values */}
        <div style={{ textAlign: "left" }}>
          <h4>🔼 Total gain: {format(percentUp)}%</h4>
          <h4>🔽 Total loss: {format(percentDown)}%</h4>
          <h4>
            📊 If invested in S&P500: {spyGrowth ? format(spyGrowth) : "N/A"}%
          </h4>
        </div>
      </div>

      <PositionsGrid positions={saved} />
    </div>
  );
};

// Helper formatters
function format(val) {
  return Number(val).toFixed(2);
}

export default Home;
