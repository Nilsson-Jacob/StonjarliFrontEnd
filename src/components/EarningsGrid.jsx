// EarningsGrid.jsx (or inside your main component)
import EarningsCard from "./EarningsCard"; // adjust path if needed

const EarningsGrid = ({ earnings }) => {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        backgroundColor: "#f9f9f9",
        padding: "20px",
        fontSize: "12px",
      }}
    >
      {earnings.map((entry, index) => (
        <EarningsCard key={index} entry={entry} />
      ))}
    </div>
  );
};

export default EarningsGrid;
