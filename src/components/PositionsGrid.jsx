// EarningsGrid.jsx (or inside your main component)
import PositionsCard from "./PositionsCard"; // adjust path if needed

const PositionsGrid = ({ positions }) => {
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
      {positions.map((entry, index) => (
        <PositionsCard key={index} entry={entry} />
      ))}
    </div>
  );
};

export default PositionsGrid;
