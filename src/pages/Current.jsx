import EarningsGrid from "../components/EarningsGrid";
import React, { useEffect, useState } from "react";

// Fetch list of upcoming earnings
const axios = require("axios").default;
const apiKey = "cupln21r01qk8dnkqkcgcupln21r01qk8dnkqkd0";
const baseURL = "https://finnhub.io/api/v1";

const Home = () => {
  const [saved, setSaved] = useState([]);
  const [currentUp, setUp] = useState(0);
  const [currentDown, setDown] = useState(0);

  async function addNew() {
    const arrString = localStorage.getItem("savedStocks");
    const arr = arrString ? JSON.parse(arrString) : [];

    let totalUp = 0;
    let totalDown = 0;

    const updated = await Promise.all(
      arr.map(async (stock) => {
        try {
          const quoteRes = await axios.get(`${baseURL}/quote`, {
            params: { symbol: stock.symbol, token: apiKey },
          });

          const currentPrice = quoteRes.data.c;

          // Accumulate profit/loss
          const diff = currentPrice - stock.price;
          if (diff > 0) {
            totalUp += diff;
          } else {
            totalDown += Math.abs(diff);
          }

          return { ...stock, currentPrice };
        } catch (error) {
          console.error("Error fetching quote for", stock.symbol, error);
          return { ...stock, currentPrice: "N/A" };
        }
      })
    );

    // Set totals AFTER all calculations are complete
    setUp(totalUp);
    setDown(totalDown);

    return updated;
  }

  useEffect(() => {
    async function load() {
      const array = await addNew();
      console.log("Loaded holdings:", array);
      setSaved(array);
    }

    load();
  }, []);

  return (
    <div style={{ textAlign: "center" }}>
      <h1>Current holdings</h1>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "500px", // set a fixed or max width for the content
            padding: "10px",
          }}
        >
          <div>
            <h3>Up: {Number(currentUp).toFixed(2)}$</h3>
            <h3>Down: {Number(currentDown.toFixed(2))}$</h3>
          </div>

          <h2 style={{ color: "green", margin: 0 }}>
            Profit: {Number(currentUp - currentDown).toFixed(2)}$
          </h2>
          <h2>🍺 counter: 2</h2>
        </div>
      </div>

      {/* <ClearStorageButton setSaved={setSaved}></ClearStorageButton> */}
      <EarningsGrid earnings={saved} />
    </div>
  );
};

export default Home;
