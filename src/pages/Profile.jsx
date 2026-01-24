import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../components/supabaseClient";

const EditIcon = () => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 44 44"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3 21l3.75-.75L20 7l-3-3L3.75 17.25 3 21z"
      stroke="white"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14 4l3 3"
      stroke="white"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M2 22h20" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export default function Profile() {
  const [targets, setTargets] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [editModal, setEditModal] = useState(false);

  const [newTarget, setNewTarget] = useState({
    name: "",
    value: "",
  });

  const deleteTarget = async (targetId) => {
    const { data, error } = await supabase
      .from("targets")
      .delete("*")
      .eq("id", targetId);

    if (error) {
      console.log("table delete error");
    }

    console.log("this is targets: " + JSON.stringify(targets));

    const { targets, TargetsError } = await supabase
      .from("targets")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (!TargetsError) setTargets(targets);
  };

  // Fetch existing targets
  useEffect(() => {
    fetchTargets();
  }, []);

  const fetchTargets = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("targets")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (!error) setTargets(data);
  };

  const handleCreateTarget = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!newTarget.name || !newTarget.value) return;

    const { data, error } = await supabase
      .from("targets")
      .insert({
        user_id: user.id,
        name: newTarget.name,
        target_value: Number(newTarget.value),
        unit: newTarget.unit,
      })
      .select();

    if (!error) {
      setTargets([...targets, data[0]]);
      setShowCreateModal(false);
      setNewTarget({ name: "", value: "", evaluation: "under" });
    }
  };

  return (
    <div style={styles.page}>
      {/* Floating + button */}

      <h2 style={styles.title}>Your Targets</h2>
      <div style={styles.editContainer}>
        {editModal && (
          <div
            onClick={() => setShowCreateModal(true)}
            style={styles.floatingAdd}
          >
            +
          </div>
        )}
        <div onClick={() => setEditModal(!editModal)}>
          <div style={{ opacity: 0.8, stroke: "rgba(255,255,255,0.85)" }}>
            <EditIcon />
          </div>
        </div>
      </div>
      <div style={styles.targetsGrid}>
        {targets.map((t) => (
          <div key={t.id} style={styles.targetCard}>
            {editModal && (
              <button onClick={() => deleteTarget(t.id)} title="-">
                {" "}
              </button>
            )}
            <h4>{t.name}</h4>
            <p style={{ fontSize: 13 }}>
              {t.evaluation?.toUpperCase()} {t.target_value}
            </p>
          </div>
        ))}
        {editModal && (
          <div style={styles.targetCard}>
            <div style={{ alignItems: "center", fontSize: "2rem" }}>+</div>
          </div>
        )}
      </div>

      {/* Create Target Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={styles.overlay}
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={styles.modal}
            >
              <h3 style={{ textAlign: "center" }}>Create new target</h3>

              <input
                placeholder="Target name"
                value={newTarget.name}
                onChange={(e) =>
                  setNewTarget({ ...newTarget, name: e.target.value })
                }
                style={styles.input}
              />

              <input
                type="number"
                placeholder="Target value"
                value={newTarget.value}
                onChange={(e) =>
                  setNewTarget({ ...newTarget, value: e.target.value })
                }
                style={styles.input}
              />

              <input
                type="text"
                placeholder="Unit"
                value={newTarget.unit}
                onChange={(e) =>
                  setNewTarget({ ...newTarget, unit: e.target.value })
                }
                style={styles.input}
              />

              {/* <div style={{ marginTop: 12 }}>
                <p style={{ fontSize: 12, marginBottom: 6 }}>
                  Evaluation style
                </p>
                <div style={styles.evaluationGrid}>
                  {["under", "slightly under", "slightly above", "above"].map(
                    (opt) => (
                      <button
                        key={opt}
                        onClick={() =>
                          setNewTarget({ ...newTarget, evaluation: opt })
                        }
                        style={{
                          ...styles.evalButton,
                          background:
                            newTarget.evaluation === opt ? "#ddb52f" : "#111",
                          color:
                            newTarget.evaluation === opt ? "#4e0329" : "#fff",
                        }}
                      >
                        {opt?.toUpperCase()}
                      </button>
                    )
                  )}
                </div>
              </div> */}

              <div style={styles.modalActions}>
                <button
                  style={styles.cancelButton}
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button style={styles.saveButton} onClick={handleCreateTarget}>
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ================= Styles ================= */

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(180deg,rgba(57,13,35,0.9) 0%,rgb(29,29,58) 100%)",
    color: "#fff",
    padding: 20,
    paddingTop: 60,
  },
  title: {
    textAlign: "center",
    marginBottom: 20,
  },
  targetsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 14,
  },
  targetCard: {
    background: "rgba(0,0,0,0.35)",
    borderRadius: 14,
    padding: 14,
    textAlign: "center",
    boxShadow: "0 6px 14px rgba(0,0,0,0.4)",
  },
  editContainer: {
    height: 60,
  },
  floatingAdd: {
    width: 60,
    //height: 60,
    marginRight: 10,
    display: "relative",
    alignItems: "left",
    fontSize: 26,
    fontWeight: "bold",
    color: "white",
    cursor: "pointer",
    zIndex: 100,
  },
  floatingEdit: {
    width: 80,
    // height: 60,
    marginRight: 10,
    display: "relative",
    alignItems: "left",
    fontSize: 26,
    fontWeight: "bold",
    color: "white",
    cursor: "pointer",
    zIndex: 100,
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    background: "#1a1a22",
    borderRadius: 18,
    padding: 22,
    width: "90%",
    maxWidth: 340,
  },
  input: {
    width: "100%",
    padding: 10,
    borderRadius: 10,
    border: "none",
    background: "#111",
    color: "#fff",
    marginBottom: 10,
  },
  evaluationGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 8,
  },
  evalButton: {
    padding: 8,
    borderRadius: 10,
    border: "none",
    fontSize: 11,
    fontWeight: "bold",
  },
  modalActions: {
    display: "flex",
    gap: 10,
    marginTop: 18,
  },
  deleteButton: {
    marginLeft: 20,
    padding: 10,
    borderRadius: 10,
    border: "none",
    background: "#333",
    color: "#fff",
  },
  cancelButton: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    border: "none",
    background: "#333",
    color: "#fff",
  },
  saveButton: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    border: "none",
    background: "linear-gradient(90deg,#ddb52f,#4e0329)",
    color: "#000",
    fontWeight: "bold",
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
