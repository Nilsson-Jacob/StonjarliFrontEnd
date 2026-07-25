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
  // const [targets, setTargets] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [editTag, setEditTag] = useState(false);
  const [tagName, setTagName] = useState("");

  const [authReady, setAuthReady] = useState(false);

  const [competitions, setCompetitions] = useState([]);

  const [newCompetitionName, setNewCompetitionName] = useState("");

  const [gladiatorInput, setGladiatorInput] = useState("");
  const [gladiators, setGladiators] = useState([]);

  const [competitionMembers, setCompetitionMembers] = useState({});

  useEffect(() => {
    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        setAuthReady(true);
      }
    };

    loadSession();
  }, []);

  // Fetch existing targets
  useEffect(() => {
    fetchTargets();
  }, []);

  useEffect(() => {
    competitions.forEach((c) => {
      fetchCompetitionMembers(c.id);
    });
  }, [competitions]);

  const fetchCompetitionMembers = async (competitionId) => {
    /* const { data: members, error } = await supabase
      .from("competition_members")
      .select(
        `
        user_id,
        profiles (
          tag_name
        )
      `
      )
      .eq("competition_id", competitionId);

    if (error) {
      console.error(error);
      return;
    }*/
    const { data: members, error } = await supabase
      .from("competition_members")
      .select("user_id")
      .eq("competition_id", competitionId);

    if (error) console.log(error);

    const ids = members.map((m) => m.user_id);

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, tag_name")
      .in("id", ids);

    const competitionMembers = members.map((m) => ({
      user_id: m.user_id,
      tag_name: profiles.find((p) => p.id === m.user_id)?.tag_name,
    }));

    const userIds = members.map((m) => m.user_id);

    const monday = new Date();
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const { data: workouts } = await supabase
      .from("daily_entries")
      .select(
        `
        user_id,
        created_at
      `
      )
      .in("user_id", userIds)
      .gte("created_at", monday.toISOString())
      .lte("created_at", sunday.toISOString());

    const formatted = competitionMembers.map((m) => {
      const days = {};

      for (let i = 0; i < 7; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);

        const key = date.toISOString().slice(0, 10);

        days[key] = workouts?.some(
          (w) => w.user_id === m.user_id && w.created_at.startsWith(key)
        );
      }

      return {
        user_id: m.user_id,
        tag_name: m.profiles.tag_name,
        days,
      };
    });

    setCompetitionMembers((prev) => ({
      ...prev,
      [competitionId]: formatted,
    }));
  };

  const fetchTargets = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: competitions, error: compError } = await supabase
      .from("competition_members")
      .select(
        `
        competition_id,
        competitions (
          id,
          name,
          start_date,
          end_date,
          creator_id
        )
      `
      )
      .eq("user_id", user.id);

    if (!compError) {
      const formatted = competitions.map((c) => c.competitions);

      setCompetitions(formatted);
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("tag_name")
      .eq("id", user.id)
      .single();

    setTagName(profile.tag_name);
  };

  const handleCreateTarget = async () => {
    if (!authReady) {
      console.error("Auth not ready yet");
      return;
    }

    const {
      data: { session: currentSession },
    } = await supabase.auth.getSession();

    if (!currentSession?.access_token) {
      console.error("User not logged in");
      return;
    }

    console.log("here l77");

    const { data: competition, error: compError } =
      await supabase.functions.invoke("create-competition", {
        headers: {
          Authorization: `Bearer ${currentSession.access_token}`,
        },
        body: {
          name: newCompetitionName,
          members: gladiators,
        },
      });

    console.log("Competition:", competition);
    console.log("Error:", compError);

    if (compError) return;
  };

  return (
    <div style={styles.page}>
      {/* Floating + button */}
      <h2 style={styles.title}>Competitions</h2>
      <div style={styles.editContainer}>
        <div onClick={() => setShowCreateModal(true)}>
          <div style={{ alignItems: "center", fontSize: "2rem" }}>+</div>
        </div>
      </div>
      <div style={styles.targetsGrid}>
        {competitions.map((t) => (
          <div key={t.id} style={styles.targetCard}>
            <h4 style={{ marginTop: -25 }}> {t.name} </h4>
            <div style={styles.competitionTable}>
              <div style={styles.daysRow}>
                <div style={styles.nameColumn}></div>

                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                  (day) => (
                    <div style={styles.day}>{day}</div>
                  )
                )}
              </div>

              {competitionMembers[t.id]?.map((member) => (
                <div style={styles.memberRow} key={member.user_id}>
                  <div style={styles.nameColumn}>{member.tag_name}</div>

                  {Object.values(member.days).map((done, index) => (
                    <div
                      key={index}
                      style={{
                        ...styles.dayBox,
                        background: done ? "#38c172" : "rgba(255,255,255,0.15)",
                      }}
                    >
                      {done ? "✓" : ""}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
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
              <h3 style={{ textAlign: "center" }}>Create new competition</h3>

              <input
                placeholder="Name"
                value={newCompetitionName}
                onChange={(e) => setNewCompetitionName(e.target.value)}
                style={styles.input}
              />

              <input
                type="text"
                placeholder="Competitor"
                value={gladiatorInput}
                onChange={(e) => setGladiatorInput(e.target.value)}
                style={styles.input}
              />

              <button
                style={styles.saveButton}
                onClick={() => {
                  if (!gladiatorInput.trim()) return;

                  setGladiators([...gladiators, gladiatorInput.trim()]);
                  setGladiatorInput("");
                }}
              >
                Add competitor
              </button>

              <div>
                {gladiators.map((g, index) => (
                  <div key={index}>
                    {g}
                    <button
                      onClick={() =>
                        setGladiators(gladiators.filter((_, i) => i !== index))
                      }
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>

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
      <h2 style={styles.title}>Profile</h2>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
        }}
      >
        <input
          type="text"
          value={tagName}
          onChange={(e) => setTagName(e.target.value)}
          style={{
            ...styles.input,
            height: 30,
            width: "80%",
            textAlign: "center",
            fontSize: 34,
          }}
          disabled={!editTag}
        />
        <div onClick={() => setEditTag(!editTag)}>
          <div style={{ opacity: 0.8, stroke: "rgba(255,255,255,0.85)" }}>
            <EditIcon />
          </div>
        </div>
      </div>
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
    gridTemplateColumns: "repeat(1, 1fr)",
    gap: 14,
  },
  targetCard: {
    background: "rgba(0,0,0,0.35)",
    borderRadius: 14,
    padding: 14,
    textAlign: "center",
    boxShadow: "0 6px 14px rgba(0,0,0,0.4)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
    minHeight: 65,
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
  competitionTable: {
    width: "100%",
    marginTop: 10,
  },

  daysRow: {
    display: "grid",
    gridTemplateColumns: "100px repeat(7,1fr)",
    gap: 4,
    fontSize: 12,
  },

  memberRow: {
    display: "grid",
    gridTemplateColumns: "100px repeat(7,1fr)",
    gap: 4,
    marginTop: 6,
    alignItems: "center",
  },

  nameColumn: {
    textAlign: "left",
    overflow: "hidden",
    fontSize: 13,
  },

  day: {
    textAlign: "center",
    fontSize: 12,
  },

  dayBox: {
    height: 25,
    borderRadius: 6,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: 12,
  },
};
