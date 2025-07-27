import React, { useState } from "react";

const StrategySimulator = ({ onSimulate }) => {
  const [ticker, setTicker] = useState("");
  const [days, setDays] = useState(5);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await onSimulate(ticker, days);
    setResult(response);
  };

  return (
    <div className="simulator">
      <h3>Strategy Simulator</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Stock Ticker (e.g. AAPL)"
          value={ticker}
          onChange={(e) => setTicker(e.target.value.toUpperCase())}
        />
        <input
          type="number"
          placeholder="Hold days after earnings"
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
        />
        <button type="submit">Run Simulation</button>
      </form>

      {result && (
        <div className="results">
          <h4>Simulation Result</h4>
          <p>
            <strong>Avg Return:</strong> {result.avgReturn}%
          </p>
          <p>
            <strong>Win Rate:</strong> {result.winRate}%
          </p>
          <p>
            <strong>Trades:</strong> {result.totalTrades}
          </p>
        </div>
      )}
    </div>
  );
};

export default StrategySimulator;
