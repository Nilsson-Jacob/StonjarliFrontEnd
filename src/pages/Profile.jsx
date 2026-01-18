import React, { useState } from "react";

const Profile = () => {
  const [sleepGoal, setSleepGoal] = useState(7); // hours
  const [proteinGoal, setProteinGoal] = useState(150); // grams

  const handleSave = () => {
    const goals = {
      sleep_hours: sleepGoal,
      protein_grams: proteinGoal,
    };

    console.log("Saved goals:", goals);
    // later: save to Supabase
    // supabase.from("profiles").update({ goals }).eq("id", user.id)
    alert("Goals saved");
  };

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>Your Goals</h2>

      <div style={styles.card}>
        <h3>😴 Sleep Goal</h3>
        <p>How many hours per night?</p>
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

      <div style={styles.card}>
        <h3>🥩 Protein Goal</h3>
        <p>How many grams per day?</p>
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
    background: "linear-gradient(180deg, #0f0f14 0%, #1a1a22 100%)",
    color: "#fff",
  },
  title: {
    textAlign: "center",
    marginBottom: 24,
  },
  card: {
    background: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
  },
  input: {
    width: "100%",
    padding: 12,
    borderRadius: 10,
    border: "none",
    marginTop: 10,
    fontSize: 16,
    background: "#111",
    color: "#fff",
  },
  unit: {
    fontSize: 14,
    color: "#bbb",
  },
  saveButton: {
    width: "100%",
    padding: 14,
    borderRadius: 14,
    border: "none",
    background: "linear-gradient(90deg, #ddb52f, #4e0329)",
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
    cursor: "pointer",
    marginTop: 10,
  },
};
