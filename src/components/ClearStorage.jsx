import React, { useState } from "react";

const ClearStorageButton = ({ setSaved }) => {
  const [hovered, setHovered] = useState(false);

  const handleClear = () => {
    localStorage.clear();
    setSaved([]);
  };

  const buttonStyle = {
    padding: "10px 20px",
    backgroundColor: hovered ? "#ff4d4f" : "#ff6666",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    cursor: "pointer",
    boxShadow: hovered
      ? "0 4px 12px rgba(255, 77, 79, 0.4)"
      : "0 2px 8px rgba(0,0,0,0.1)",
    transition: "all 0.2s ease-in-out",
  };

  return (
    <button
      style={buttonStyle}
      onClick={handleClear}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      🧹 Clear Local Storage
    </button>
  );
};

export default ClearStorageButton;
