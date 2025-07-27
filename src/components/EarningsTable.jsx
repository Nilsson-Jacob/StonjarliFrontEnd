import React from "react";

const EarningsTable = ({ earnings }) => {
  return (
    <table className="earnings-table">
      <thead>
        <tr>
          <th>Symbol</th>
          <th>Company</th>
          <th>Report Date</th>
          <th>Est. EPS</th>
          <th>Est. Revenue</th>
        </tr>
      </thead>
      <tbody>
        {earnings.map((stock) => (
          <tr key={stock.symbol}>
            <td>{stock.symbol}</td>
            <td>{stock.company}</td>
            <td>{stock.date}</td>
            <td>{stock.estimatedEPS}</td>
            <td>{stock.estimatedRevenue}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default EarningsTable;
