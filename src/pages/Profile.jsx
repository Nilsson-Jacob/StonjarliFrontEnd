// src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../components/supabaseClient";

export default function Profile() {
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTargets = async () => {
    const { data, error } = await supabase
      .from("targets")
      .select("*")
      .order("created_at");

    if (error) {
      console.error(error);
      return;
    }

    setTargets(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTargets();
  }, []);

  const updateTarget = (id, value) => {
    setTargets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, target_value: value } : t))
    );
  };

  const saveTargets = async () => {
    for (const t of targets) {
      await supabase
        .from("targets")
        .update({ target_value: t.target_value })
        .eq("id", t.id);
    }
    alert("Targets saved!");
  };

  const addTarget = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const newTarget = {
      user_id: user.id,
      name: "New Target",
      emoji: "🎯",
      unit: "units",
      target_value: 1,
      comparison_type: ">=",
    };

    const { data, error } = await supabase
      .from("targets")
      .insert(newTarget)
      .select();

    if (!error) {
      setTargets([...targets, data[0]]);
    }
  };

  if (loading) return <p style={{ color: "#fff" }}>Loading...</p>;

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>Your Targets</h2>

      <div style={styles.targetsList}>
        {targets.map((t) => (
          <div key={t.id} style={styles.targetCard}>
            <div style={styles.header}>
              <span style={{ fontSize: 22 }}>{t.emoji}</span>
              <strong>{t.name}</strong>
            </div>

            <input
              type="number"
              value={t.target_value}
              onChange={(e) => updateTarget(t.id, Number(e.target.value))}
              style={styles.input}
            />

            <span style={styles.unit}>
              {t.comparison_type} {t.unit}
            </span>
          </div>
        ))}
      </div>

      <button style={styles.addButton} onClick={addTarget}>
        + Add New Target
      </button>

      <button style={styles.saveButton} onClick={saveTargets}>
        Save Targets
      </button>
    </div>
  );
}

/* ================= Styles ================= */

const styles = {
  page: {
    minHeight: "100vh",
    padding: 20,
    paddingTop: 40,
    background:
      "linear-gradient(180deg,rgba(57, 13, 35, 0.77) 0%,rgb(29, 29, 58) 100%)",
    color: "#fff",
  },
  title: {
    textAlign: "center",
    marginBottom: 20,
  },
  targetsList: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
    marginBottom: 20,
  },
  targetCard: {
    background: "rgba(0,0,0,0.35)",
    borderRadius: 12,
    padding: 14,
    boxShadow: "0 6px 14px rgba(0,0,0,0.4)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  input: {
    width: "100%",
    padding: 10,
    borderRadius: 8,
    border: "none",
    background: "#111",
    color: "#fff",
    textAlign: "center",
    fontSize: 15,
  },
  unit: {
    display: "block",
    marginTop: 4,
    fontSize: 12,
    color: "#ddb52f",
    textAlign: "center",
  },
  addButton: {
    width: "100%",
    padding: 10,
    borderRadius: 10,
    border: "1px dashed #ddb52f",
    background: "transparent",
    color: "#ddb52f",
    fontWeight: "bold",
    marginBottom: 12,
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

/*import React, { useState } from "react";

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
      <h2 style={styles.title}>Your Targets</h2>

      <div style={styles.goalsRow}>
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
        Save Targets
      </button>
    </div>
  );
};

export default Profile;


const styles = {
  page: {
    minHeight: "100vh",
    padding: 20,
    paddingTop: 40,
    background:
      "linear-gradient(180deg,rgba(57, 13, 35, 0.77) 0%,rgb(29, 29, 58) 100%)",
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
*/
