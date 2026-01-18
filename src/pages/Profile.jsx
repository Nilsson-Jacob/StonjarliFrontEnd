import React, { useState } from "react";

const Profile = () => {
  const [sleepGoal, setSleepGoal] = useState(7);
  const [proteinGoal, setProteinGoal] = useState(150);

  const handleSave = () => {
    const goals = {
      sleep_hours: sleepGoal,
      protein_grams: proteinGoal,
    };
    console.log("Saved goals:", goals);
    alert("Goals saved");
  };

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>Your Goals</h2>

      <div style={styles.goalsRow}>
        {/* Sleep Goal */}
        <div style={styles.goalCard}>
          <h4>😴 Sleep</h4>
          <input
            type="number"
            min="4"
            max="12"
            step="0.5"
            value={sleepGoal}
            onChange={(e) => setSleepGoal(Number(e.target.value))}
            style={styles.input}
          />
          <span style={styles.unit}>hours</span>
        </div>

        {/* Protein Goal */}
        <div style={styles.goalCard}>
          <h4>🥩 Protein</h4>
          <input
            type="number"
            min="50"
            max="400"
            step="5"
            value={proteinGoal}
            onChange={(e) => setProteinGoal(Number(e.target.value))}
            style={styles.input}
          />
          <span style={styles.unit}>grams</span>
        </div>
      </div>

      <button style={styles.saveButton} onClick={handleSave}>
        Save Goals
      </button>
    </div>
  );
};

export default Profile;

/* ================= Styles ================= */

const styles = {
  page: {
    minHeight: "100vh",
    padding: 20,
    background: "linear-gradient(180deg, #4e0329 0%, #ddb52f 100%)", // same as Checkin
    color: "#fff",
  },
  title: {
    textAlign: "center",
    marginBottom: 20,
  },
  goalsRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 14,
    marginBottom: 30,
  },
  goalCard: {
    flex: 1,
    background: "rgba(0,0,0,0.35)",
    borderRadius: 12,
    padding: 14,
    textAlign: "center",
    boxShadow: "0 6px 14px rgba(0,0,0,0.4)",
  },
  input: {
    width: "100%",
    padding: 8,
    borderRadius: 8,
    border: "none",
    marginTop: 8,
    fontSize: 14,
    background: "#111",
    color: "#fff",
    textAlign: "center",
  },
  unit: {
    display: "block",
    marginTop: 4,
    fontSize: 12,
    color: "#ddb52f",
  },
  saveButton: {
    width: "100%",
    padding: 12,
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(90deg, #ddb52f, #4e0329)",
    color: "#000",
    fontWeight: "bold",
    fontSize: 15,
    cursor: "pointer",
  },
};
