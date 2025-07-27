import React from "react";

const StockCard = ({ stock }) => {
  return (
    <div className="stock-card">
      <h2>
        {stock.symbol} - {stock.company}
      </h2>
      <p>
        <strong>Last EPS:</strong> {stock.lastEPS}
      </p>
      <p>
        <strong>Surprise %:</strong> {stock.surprisePercent}%
      </p>
      <p>
        <strong>Next Earnings:</strong> {stock.nextEarningsDate}
      </p>
      <p>
        <strong>5-Day Post-Earnings Return:</strong> {stock.avg5DayReturn}%
      </p>
    </div>
  );
};

export default StockCard;
