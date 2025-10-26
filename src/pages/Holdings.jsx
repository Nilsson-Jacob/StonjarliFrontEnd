import React, { useEffect, useState } from "react";
import PositionsGrid from "../components/PositionsGrid";
import axios from "axios";

const startDate = "2025-09-29";
const startMoney = 214;

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const serverApi = "https://stonjarliserver.onrender.com";

const Home = () => {
  const [saved, setSaved] = useState([]);
  const [dollarUp, setDollarUp] = useState(0);
  const [dollarDown, setDollarDown] = useState(0);
  const [profitPercent, setProfitPercent] = useState(0);
  const [spyGrowth, setSpyGrowth] = useState(0);
  const [totalFunds, setTotalFunds] = useState(0);
  const [beerCount, setTotalBeer] = useState(0);
  const [todaysProfit, setTodaysProfit] = useState(0);

  const [sentiments, setSentiments] = useState([]);

  async function getPositions() {
    try {
      const response = await axios.get(serverApi + "/positions");
      return response.data || [];
    } catch (e) {
      console.error("Error fetching positions:", e.message);
      return [];
    }
  }

  async function getBuyDate() {
    try {
      const res = await axios.get(`${serverApi}/buydate`);
      return res.data;
    } catch (error) {
      console.log("JN from buydate" + error);
    }
  }

  async function getSPGrowth() {
    try {
      const response = await axios.get(`${serverApi}/SP500/${startDate}`);
      return response.data.growthPct;
    } catch (err) {
      console.error("Failed to fetch S&P growth:", err.message);
      return 0;
    }
  }

  async function getTotalFund() {
    try {
      const response = await axios.get(`${serverApi}/account`);
      return response.data.portfolio_value;
    } catch (err) {
      console.error("Failed to fetch total funds:", err.message);
      return "N/A";
    }
  }

  async function getSentiments() {
    try {
      const response = await axios.get(serverApi + "/sentiments");
      return response.data || [];
    } catch (e) {
      console.error("Error fetching positions:", e.message);
      return [];
    }
  }

  useEffect(() => {
    async function load() {
      const aPositions = await getPositions();
      const aClosedOrders = await getBuyDate();

      let symbolMap;
      if (aClosedOrders) {
        symbolMap = new Map(aClosedOrders.map((item) => [item.symbol, item]));
      }

      const enriched = [];
      let up = 0;
      let down = 0;

      for (const stock of aPositions.data) {
        console.log("line75: " + JSON.stringify(stock));
        //setTodaysProfit(todaysProfit + Number(stock.unrealized_intraday_pl));
        setTodaysProfit((prev) => prev + Number(stock.unrealized_intraday_pl));

        if (stock.unrealized_pl >= 0) {
          up += Math.abs(stock.unrealized_pl);
        } else {
          down += Math.abs(stock.unrealized_pl);
        }

        let buyDate = "";
        const oMatch = symbolMap.get(stock.symbol);
        if (oMatch && oMatch.filled_at) {
          buyDate = oMatch.filled_at.substring(0, 10);
        }

        enriched.push({ ...stock, buyDate });
        await delay(300); // shorter delay for mobile feel
      }

      setDollarUp(up);
      setDollarDown(down);
      setSaved(enriched);
      setSpyGrowth(await getSPGrowth());
    }

    load();
  }, []);

  useEffect(() => {
    async function loadAccount() {
      const funds = await getTotalFund();
      setTotalFunds(funds);
      setProfitPercent(funds / startMoney);
    }
    loadAccount();
  }, []);

  useEffect(() => {
    async function loadSentiments() {
      const sentiments = await getSentiments();
      setSentiments(sentiments);
    }
    loadSentiments();
  }, []);

  return (
    <div style={{ textAlign: "center", padding: "10px" }}>
      <div
        className="summary-container"
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "10px",
          gap: "20px",
          //flexWrap: "wrap",
          flexWrap: "nowrap",
          alignItems: "flex-start",
        }}
      >
        {/* Dollar values */}
        <div style={{ minWidth: "150px", textAlign: "left" }}>
          <h3 style={{ fontSize: "1.2rem" }}>Current Holdings</h3>
          <h3 style={{ fontSize: "1.1rem" }}>💵 Up: ${format(dollarUp)}</h3>
          <h3 style={{ fontSize: "1.1rem" }}>📉 Down: ${format(dollarDown)}</h3>
          <h3 style={{ fontSize: "1.1rem" }}>
            📈 Profit: ${format(dollarUp - dollarDown)}
          </h3>
        </div>
        {/* Divider (hidden on mobile) */}
        <div
          style={{
            borderLeft: "2px solid #ccc",
            height: "auto",
            display: window.innerWidth < 600 ? "none" : "block",
          }}
        />
        {/* Percent values */}
        <div style={{ minWidth: "150px", textAlign: "left" }}>
          <h4 style={{ fontSize: "1rem" }}>
            🔼 Growth (%): {format(profitPercent)}%
          </h4>
          <h4 style={{ fontSize: "1rem" }}>
            📊 S&P500 Growth: {spyGrowth ? spyGrowth : "N/A"}%
          </h4>

          {/* Divider (hidden on mobile) */}
          <div
            style={{
              borderBottom: "2px solid #ccc",
              height: "auto",
              display: window.innerWidth < 600 ? "none" : "block",
            }}
          />
          <h3>
            <span
              onClick={() => setTotalBeer(beerCount + 1)}
              style={{
                cursor: "pointer",
                fontSize: "1.5rem",
                textShadow: `
        0 0 1px #f2eb60,
        0 0 1px #f2eb60,
        0 0 3px #f2eb60,
        0 0 3px #f2eb60,
        0 0 3px #f2eb60
      `,
                transition: "transform 0.2s, text-shadow 0.3s",
                display: "inline-block",
              }}
            >
              Todays 💸: ${format(todaysProfit - beerCount * 5)}
            </span>
          </h3>

          <h3>
            <span
              onClick={() => setTotalBeer(beerCount + 1)}
              style={{
                cursor: "pointer",
                fontSize: "2.5rem",
                textShadow: `
        0 0 1px #00ff00,
        0 0 1px #00ff00,
        0 0 2px #00ff00,
        0 0 2px #00ff00,
        0 0 3px #00ff00
      `,
                transition: "transform 0.2s, text-shadow 0.3s",
                display: "inline-block",
              }}
            >
              🍺
            </span>
            <span
              style={{
                cursor: "pointer",
                fontSize: "2.5rem",
                textShadow: `
        0 0 1px #00ff00,
        0 0 1px #00ff00,
        0 0 2px #00ff00,
        0 0 2px #00ff00,
        0 0 3px #00ff00
      `,
                transition: "transform 0.2s, text-shadow 0.3s",
                display: "inline-block",
                paddingLeft: "2%",
              }}
            >
              {beerCount ? beerCount : 0}
            </span>
          </h3>
        </div>
        {/* Divider (hidden on mobile) */}
        <div
          style={{
            borderLeft: "2px solid #ccc",
            height: "auto",
            display: window.innerWidth < 600 ? "none" : "block",
          }}
        />
        {/* Total funds box */}
        <div
          style={{
            //flex: "1 1 auto"
            flex: "0 0 350px", // fixed width so it won't shrink or wrap
            maxHeight: "36vh", // entire column height cap
            overflowY: "auto", // scroll right column
            paddingRight: "5px", // space for scrollbar
          }}
        >
          <div
            style={{
              minWidth: "140px",
              marginTop: window.innerWidth < 600 ? "10px" : "0",
              padding: "10px 20px",
              border: "2px solid #ccc",
              borderRadius: "8px",
              backgroundColor: "#f9f9f9",
              position: "relative",
              maxHeight: "75px",
            }}
          >
            <span
              style={{
                fontSize: "0.75rem",
                color: "#555",
                position: "absolute",
                right: "10px",
                bottom: "5px",
              }}
            >
              Start at {startMoney}$ – {startDate}
            </span>
            <h3 style={{ margin: 0, fontSize: "2.5rem" }}>${totalFunds}</h3>
          </div>
          {/* Divider (hidden on mobile) */}
          <div
            style={{
              borderBottom: "2px solid #ccc",
              height: "auto",
              display: window.innerWidth < 600 ? "none" : "block",
              marginTop: "21px",
            }}
          />
          <h3>
            <span
              onClick={() => setTotalBeer(beerCount + 1)}
              style={{
                cursor: "pointer",
                fontSize: "1.5rem",
                textShadow: `
        0 0 1px #f2eb60,
        0 0 1px #f2eb60,
        0 0 3px #f2eb60,
        0 0 3px #f2eb60,
        0 0 3px #f2eb60
      `,
                transition: "transform 0.2s, text-shadow 0.3s",
                display: "inline-block",
              }}
            >
              Todays 🔮
            </span>
          </h3>

          <div style={{ marginTop: "20px", textAlign: "left" }}>
            {sentiments.length === 0 ? (
              <p>No sentiment data yet</p>
            ) : (
              <ul style={{ listStyleType: "none", padding: 0 }}>
                {sentiments.map((item) => (
                  <li
                    key={item.id}
                    style={{
                      marginBottom: "10px",
                      maxHeight: "400px", // allow it to scroll vertically
                      padding: "8px",
                      border: "1px solid #ccc",
                      overflowY: "auto",
                      borderRadius: "6px",
                      backgroundColor: "#f2eb60",
                      /*  item.sentiment === "positive"
                          ? "#d4edda"
                          : item.sentiment === "negative"
                          ? "#f8d7da"
                          : "#fff3cd",*/
                    }}
                  >
                    <strong>{item.event.toUpperCase()}</strong>:{" "}
                    <strong>( {item.symbol.symboltoUpperCase()} )</strong> :{" "}
                    {item.headline + " "}:{" "}
                    {" " + item.created_at.substring(0, 10)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop: "20px" }}>
        <PositionsGrid positions={saved} />
      </div>
    </div>
  );
};

function format(val) {
  return Number(val).toFixed(2);
}

export default Home;
