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
        setTodaysProfit(todaysProfit + Number(stock.unrealized_intraday_pl));

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
  }, [totalFunds]);

  useEffect(() => {
    async function loadAccount() {
      const funds = await getTotalFund();
      setTotalFunds(funds);
      setProfitPercent(funds / startMoney);
    }
    loadAccount();
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
          flexWrap: "wrap",
        }}
      >
        {/* Dollar values */}
        <div style={{ minWidth: "150px", textAlign: "left" }}>
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
              Todays $: {todaysProfit - beerCount * 5}$
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
            flex: "1 1 auto",
            minWidth: "140px",
            marginTop: window.innerWidth < 600 ? "10px" : "0",
            padding: "10px 20px",
            border: "2px solid #ccc",
            borderRadius: "8px",
            backgroundColor: "#f9f9f9",
            position: "relative",
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
            Start at {startMoney} – {startDate}
          </span>
          <h3 style={{ margin: 0, fontSize: "2.5rem" }}>${totalFunds}</h3>
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

/*import React, { useEffect, useState } from "react";
import PositionsGrid from "../components/PositionsGrid";
import axios from "axios";

//const apiKey = "cupln21r01qk8dnkqkcgcupln21r01qk8dnkqkd0";
//const baseURL = "https://finnhub.io/api/v1";
//const SPY_SYMBOL = "SPY";

const startDate = "2025-09-29";
const startMoney = 214;

// Delay to prevent 429
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// Fetch current price via /quote
/*
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
}*/
/*
const serverApi = "https://stonjarliserver.onrender.com";

const Home = () => {
  //const [positions, setPositions] = useState([]);
  const [saved, setSaved] = useState([]);
  const [dollarUp, setDollarUp] = useState(0);
  const [dollarDown, setDollarDown] = useState(0);
  const [profitPercent, setProfitPercent] = useState(0);
  //const [percentDown, setPercentDown] = useState(0);

  const [spyGrowth, setSpyGrowth] = useState(0);

  const [totalFunds, setTotalFunds] = useState(0);

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
  async function getBuyDate() {
    // You can fetch this from your server using:

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
      console.log("SPGROWTH: " + JSON.stringify(response));

      const growth = response.data.growthPct;

      console.log("percent: " + growth);
      return growth;
    } catch (err) {
      console.error("Failed to fetch S&P growth:", err.message);
      return 0; // Return a safe number
    }
  }

  async function getTotalFund() {
    try {
      const response = await axios.get(`${serverApi}/account`);
      const account = response.data;

      return account.portfolio_value;
    } catch (err) {
      console.error("Failed to fetch total funds:", err.message);
      return "N/A"; // return a string or 0
    }
  }

  useEffect(() => {
    async function load() {
      // Call getPositions here
      const aPositions = await getPositions();
      const aClosedOrders = await getBuyDate();

      let symbolMap;

      if (aClosedOrders) {
        symbolMap = new Map(aClosedOrders.map((item) => [item.symbol, item]));
      }

      //const currentSPY = await getCurrentPrice(SPY_SYMBOL);
      const enriched = [];

      let up = 0;
      let down = 0;

      for (const stock of aPositions.data) {
        if (stock.unrealized_pl >= 0) {
          up = up + Math.abs(stock.unrealized_pl);
        } else {
          down = down + Math.abs(stock.unrealized_pl);
        }

        let buyDate = "";
        const oMatch = symbolMap.get(stock.symbol);
        if (oMatch && oMatch.filled_at) {
          buyDate = oMatch.filled_at.substring(0, 10);
        }

        // check if
        enriched.push({
          ...stock,
          // spyReturn,
          buyDate,
        });
        await delay(1000);
      }

      //setPositions(enriched);

      setDollarUp(up);
      setDollarDown(down);

      /*setSpyGrowth(
        enriched[0]?.spyPriceAtBuy
          ? ((currentSPY - enriched[0].spyPriceAtBuy) /
              enriched[0].spyPriceAtBuy) *
              100
          : 0
      );*/
/*
      setSaved(enriched);
      setSpyGrowth(await getSPGrowth());
    }

    load();
  }, [totalFunds]);

  useEffect(() => {
    async function loadAccount() {
      const funds = await getTotalFund();
      setTotalFunds(funds);

      console.log(funds + "fonds - : start: " + startMoney);
      setProfitPercent(funds / startMoney);
    }

    loadAccount();
  }, []);

  return (
    <div style={{ textAlign: "center" }}>
      <div
        className="summary-container"
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "10px",
          gap: "40px",
          flexWrap: "wrap",
        }}
      >
        {/* Dollar values }
        <div style={{ textAlign: "left" }}>
          <h3>💵 Up: ${format(dollarUp)}</h3>
          <h3>📉 Down: ${format(dollarDown)}</h3>
          <h3>📈 Profit: ${format(dollarUp - dollarDown)}</h3>
        </div>

        {/* Vertical divider }
        <div
          style={{
            borderLeft: "2px solid #ccc",
            height: "100%",
          }}
        />

        {/* Percent values }
        <div style={{ textAlign: "left" }}>
          <h4>🔼 Growth (%): {format(profitPercent)}%</h4>
          <h4>
            📊 S&P500 Growth (%, in same intervall):{" "}
            {spyGrowth ? spyGrowth : "N/A"}%
          </h4>
        </div>

        {/* Vertical divider before funds box }
        <div
          style={{
            borderLeft: "2px solid #ccc",
            height: "100%",
          }}
        />

        {/* Total funds box }
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "10px 20px",
            border: "2px solid #ccc",
            borderRadius: "8px",
            backgroundColor: "#f9f9f9",
            position: "relative",
            minWidth: "140px",
            height: "70px", // 🔑 makes it shorter than the left columns
          }}
        >
          <span
            style={{
              fontSize: "0.75rem",
              color: "#555",
              position: "absolute",
              //top: "20px",
              right: "10px",
              bottom: "5px",
            }}
          >
            Start at {startMoney} - {startDate}
          </span>
          <h3 style={{ margin: 0 }}>${totalFunds}</h3>
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

export default Home;*/
