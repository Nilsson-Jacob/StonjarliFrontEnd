const API_BASE = "http://localhost:5000/api/stocks"; // Use your deployed URL in production

// Fetch list of upcoming earnings
export async function getUpcomingEarnings() {
  try {
    const response = await fetch(`${API_BASE}/earnings/upcoming`);
    return await response.json();
  } catch (err) {
    console.error("Error fetching earnings:", err);
    return [];
  }
}

// Fetch historical price data for a stock
export async function getStockHistory(ticker) {
  try {
    const response = await fetch(`${API_BASE}/${ticker}/history`);
    return await response.json();
  } catch (err) {
    console.error("Error fetching stock history:", err);
    return [];
  }
}

// Simulate earnings strategy
export async function simulateStrategy(ticker, days) {
  try {
    const response = await fetch(`${API_BASE}/simulate-strategy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticker, days }),
    });

    return await response.json();
  } catch (err) {
    console.error("Error simulating strategy:", err);
    return { error: true };
  }
}
