// EarningsCard.jsx
const PositionsCard = ({ entry }) => {
  const { symbol, market_value, cost_basis, unrealized_pl, buyDate } = entry;

  // Create a green shade based on comparisonEPS
  const getGreenColor = (value) => {
    if (value) {
      return value >= 0 ? "Green" : "Red";
    } else if (!value || isNaN(value)) {
      return "#ccc";
    } else {
      const greenLevel = Math.min(255, Math.floor(80 + value * 40)); // cap at 255
      return `rgb(0, ${greenLevel}, 0)`;
    }
  };

  /*return (
    <div>
      {Object.entries(entry).map(([key, value]) => (
        <div key={key}>
          <strong>{key}:</strong> {String(value)}
        </div>
      ))}
    </div>
  );*/

  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "4px",
        margin: "6px",
        boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
        width: "150px",
        height: "150px",
        fontFamily: "Arial, sans-serif",
        backgroundColor: getGreenColor(unrealized_pl),
      }}
    >
      <h2 style={{ margin: "0 0 8px 0", fontSize: "1.25rem" }}>{symbol}</h2>
      <div>
        <p style={{ margin: "4px 0" }}>
          <strong>Buy date:</strong> <span>{buyDate ? buyDate : "N/A"}</span>
        </p>
        <p style={{ margin: "4px 0" }}>
          <strong>profit/loss:</strong>{" "}
          <span>
            {unrealized_pl ? Number(unrealized_pl).toFixed(2) + "$" : "N/A"}
          </span>
        </p>
        <p style={{ margin: "4px 0" }}>
          <strong>Market value:</strong>{" "}
          <span>
            {unrealized_pl ? Number(market_value).toFixed(2) + "$" : "N/A"}
          </span>
        </p>
        <p style={{ margin: "4px 0" }}>
          <strong>Cost:</strong>{" "}
          <span>
            {unrealized_pl ? Number(cost_basis).toFixed(2) + "$" : "N/A"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default PositionsCard;

/*
function getDaysRemaining(startDate, holdDays = 4) {
  const now = new Date();
  const start = new Date(startDate);

  // Calculate the end date: start + holdDays
  const end = new Date(start);
  end.setDate(start.getDate() + holdDays);

  // Calculate difference in days
  const diffMs = end - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays > 0) {
    return `${diffDays} day${diffDays !== 1 ? "s" : ""} remaining`;
  } else if (diffDays === 0) {
    return "Sell today";
  } else {
    return `Expired ${Math.abs(diffDays)} day${
      Math.abs(diffDays) !== 1 ? "s" : ""
    } ago`;
  }
}*/
