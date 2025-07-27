// EarningsCard.jsx
const EarningsCard = ({ entry }) => {
  const {
    symbol,
    date,
    epsActual,
    epsEstimate,
    revenueActual,
    revenueEstimate,
    comparisonEPS,
    hour,
    buyDate,
    price,
    currentPrice,
  } = entry;

  // Create a green shade based on comparisonEPS
  const getGreenColor = (value) => {
    if (currentPrice) {
      let value = currentPrice - price;
      console.log("Detta value: " + value);
      return value >= 0 ? "Green" : "Red";
    } else if (!value || isNaN(value)) {
      return "#ccc";
    } else {
      const greenLevel = Math.min(255, Math.floor(80 + value * 40)); // cap at 255
      return `rgb(0, ${greenLevel}, 0)`;
    }
  };

  /*const getProfitColor = (buyPrice, currentPrice) => {
    let value = currentPrice - buyPrice;
    console.log("JN compare: " + currentPrice - buyPrice);
    if (!value || isNaN(value)) return "#ccc";
    return value >= 0 ? "Green" : "Red";
  };*/

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
        backgroundColor: getGreenColor(comparisonEPS),
      }}
    >
      <h2 style={{ margin: "0 0 8px 0", fontSize: "1.25rem" }}>{symbol}</h2>
      {!buyDate && (
        <div>
          <p style={{ margin: "4px 0" }}>
            <strong>Date:</strong> {date}
          </p>
          <p style={{ margin: "4px 0" }}>
            <strong>EPS:</strong> {epsActual} (Est: {epsEstimate ?? "N/A"})
          </p>
          <p style={{ margin: "4px 0" }}>
            <strong>Revenue:</strong> ${revenueActual?.toLocaleString()} (Est:{" "}
            {revenueEstimate?.toLocaleString() ?? "N/A"})
          </p>
          <p style={{ margin: "4px 0" }}>
            <strong>Hour:</strong> {hour.toUpperCase()}
          </p>
          <p style={{ margin: "4px 0" }}>
            <strong>EPS Surprise:</strong>{" "}
            <span
              style={{
                fontWeight: "bold",
                color: "black",
                fontSize: "14px",
              }}
            >
              {comparisonEPS ? comparisonEPS.toFixed(2) : "N/A"}
            </span>
          </p>
        </div>
      )}

      {buyDate && (
        <div>
          <p style={{ margin: "4px 0" }}>
            <strong>Days remaining before sell:</strong>{" "}
            <span
              style={{
                fontWeight: "bold",
                color: "black",
                fontSize: "14px",
              }}
            >
              {buyDate ? getDaysRemaining(buyDate) : "N/A"}
            </span>
          </p>
          <p style={{ margin: "4px 0" }}>
            <strong>EPS Surprise:</strong>{" "}
            <span
              style={{
                fontWeight: "bold",
                color: "black",
                fontSize: "14px",
              }}
            >
              {comparisonEPS ? comparisonEPS.toFixed(2) : "N/A"}
            </span>
          </p>
          <p style={{ margin: "4px 0" }}>
            <strong>Buy Price:</strong> <span>{price ? price : "N/A"}</span>
          </p>
          <p style={{ margin: "4px 0" }}>
            <strong>Current Price:</strong>{" "}
            <span>{currentPrice ? currentPrice : "N/A"}</span>
          </p>
          <p style={{ margin: "4px 0" }}>
            <strong>profit/loss:</strong>{" "}
            <span>
              {currentPrice
                ? Number(currentPrice - price).toFixed(2) + "$"
                : "N/A"}
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

export default EarningsCard;

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
}
