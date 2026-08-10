import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "../components/supabaseClient";

//const serverApi = "https://stonjarliserver.onrender.com";

export default function Home() {
  const [step, setStep] = useState("home");
  const [recording, setRecording] = useState(false);
  const [answer, setAnswer] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);

  //const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  const [pressTimer, setPressTimer] = useState(null);
  const [longPressTriggered, setLongPressTriggered] = useState(false);

  const [trainingText, setTrainingText] = useState("");
  const [sendingText] = useState(false);

  const [previousWorkouts, setPreviousWorkouts] = useState([]);
  const [showPreviousDropdown, setShowPreviousDropdown] = useState(false);

  const [editedActivities, setEditedActivities] = useState([]);

  const [allowEditActivities /*, setAllowEditActivities*/] = useState(false);

  const fetchPreviousWorkouts = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("daily_entries")
      .select("entry_date, structured")
      .eq("user_id", user.id)
      .order("entry_date", { ascending: false });

    if (!error) {
      setPreviousWorkouts(data);
    }
  };

  useEffect(() => {
    fetchPreviousWorkouts();
  }, []);

  const today = new Date().toLocaleDateString();

  const submitTextLog = async () => {
    if (!trainingText.trim()) return;

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const res = await fetch(
      "https://agbtomavehebxbmzzziy.supabase.co/functions/v1/transcribe",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isText: true,
          text: trainingText,
        }),
      }
    );

    const data = await res.json();

    console.log("TEXT AI RESULT:", data);

    setAnswer(data);
    setStep("home");
  };

  const handlePressStart = () => {
    setLongPressTriggered(false);

    const timer = setTimeout(() => {
      setLongPressTriggered(true);
      setStep("typelog");
    }, 600);

    setPressTimer(timer);
  };

  const handlePressEnd = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }

    // If it wasn't a long press, start voice recording
    if (!longPressTriggered) {
      setStep("training");
    }
  };

  // ===== Load Supabase session ONCE =====

  useEffect(() => {
    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        setAuthReady(true);
      }
    };

    loadSession();
  }, []);

  const saveWorkout = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const today = new Date().toISOString().slice(0, 10);

    const structured = {
      activities:
        editedActivities.length > 0
          ? editedActivities
          : answer.structured.activities,
    };

    const { error } = await supabase.from("daily_entries").upsert(
      {
        user_id: user.id,
        entry_date: today,
        structured,
      },
      {
        onConflict: "user_id,entry_date",
      }
    );

    if (error) {
      console.error(error);
      return;
    }
  };

  // ===== START RECORDING =====

  const startRecording = async () => {
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

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    streamRef.current = stream;
    const mediaRecorder = new MediaRecorder(stream);

    mediaRecorderRef.current = mediaRecorder;

    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (e) => {
      console.log("Chunk:", e.data.size);

      if (e.data.size > 0) {
        audioChunksRef.current.push(e.data);
      }
    };

    mediaRecorder.onstop = async () => {
      try {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType,
        });

        console.log("FINAL AUDIO:", audioBlob.size, audioBlob.type);

        if (audioBlob.size < 5000) {
          console.error("Recording too short");
          return;
        }

        const formData = new FormData();

        formData.append("audio", audioBlob, "training.webm");

        const res = await fetch(
          "https://agbtomavehebxbmzzziy.supabase.co/functions/v1/transcribe",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${currentSession.access_token}`,
            },
            body: formData,
          }
        );

        const data = await res.json();

        console.log("TRANSCRIBE RESULT:", data);

        setAnswer(data);
      } catch (err) {
        console.error("Transcription error:", err);
      } finally {
        streamRef.current?.getTracks().forEach((track) => track.stop());

        audioChunksRef.current = [];

        setStep("home");
      }
    };

    // IMPORTANT
    mediaRecorder.start(1000);

    setRecording(true);
  };

  // ===== STOP RECORDING =====

  const handleStop = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();

      setRecording(false);
    }
  };

  // ===== AUTO START WHEN ENTERING TRAINING =====
  useEffect(() => {
    if (step === "training") {
      startRecording();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // ===== UI =====

  return (
    <div style={styles.page}>
      {step === "home" && (
        <div style={cardContainer}>
          {!answer && (
            <div
              style={cardStyle}
              onMouseDown={handlePressStart}
              onMouseUp={handlePressEnd}
              onMouseLeave={handlePressEnd}
              onTouchStart={handlePressStart}
              onTouchEnd={handlePressEnd}
            >
              Log Training - {today}
              <h5 style={{ fontSize: "0.8rem" }}>
                Click to voicelog || Press & hold to typelog
              </h5>
            </div>
          )}

          {answer && (
            <div style={cardStyle}>
              <h3> Training - {today} </h3>

              {
                /*answer.structured?.activities?.map((activity, index) => (*/
                (editedActivities.length
                  ? editedActivities
                  : answer.structured?.activities || []
                ).map((activity, index) => (
                  <div key={index}>
                    {activity.training_type === "gym" && (
                      <div
                        style={{
                          background: "rgba(255,255,255,0.08)",
                          borderRadius: 14,
                          padding: 16,
                          marginBottom: 12,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: 15,
                              fontWeight: "bold",
                              marginBottom: 6,
                            }}
                          >
                            {/*activity.activity_type*/}
                            <input
                              value={activity.activity_type}
                              onChange={(e) => {
                                const copy = [...editedActivities];
                                copy[index].activity_type = e.target.value;
                                setEditedActivities(copy);
                              }}
                            />
                          </div>

                          <div
                            style={{
                              color: "#ddd",
                              fontSize: 13,
                            }}
                          >
                            {/* <span>
                              {activity.anchor_metric?.weight || 0} kg
                            </span>
                            <span>
                              <input
                                value={activity.anchor_metric?.weight || 0}
                                disabled={allowEditActivities ? false : true}
                                onChange={(e) => {
                                  const copy = [...editedActivities];
                                  copy[index].anchor_metric.weight =
                                    e.target.value;
                                  //setEditedActivities(copy);
                                }}
                              />
                            </span> */}

                            <span>
                              <input
                                value={0}
                                disabled={allowEditActivities ? false : true}
                              />
                            </span>

                            <span style={{ margin: "0 5px" }}>•</span>
                            <span>
                              {activity.anchor_metric?.sets || 0} sets
                            </span>
                            <span style={{ margin: "0 5px" }}>•</span>
                            <span>
                              {activity.anchor_metric?.reps || 0} reps
                            </span>
                          </div>
                          {activity.notes && (
                            <span>notes: {activity.notes}</span>
                          )}
                        </div>

                        <button
                          style={{
                            padding: "8px 14px",
                            borderRadius: 10,
                            border: "none",
                            background: "#ddb52f",
                            color: "#111",
                            fontWeight: "bold",
                            cursor: "pointer",
                            marginLeft: 20,
                          }}
                        >
                          Edit
                        </button>
                      </div>
                    )}

                    {activity.training_type === "run" && (
                      <div
                        style={{
                          background: "rgba(255,255,255,0.08)",
                          borderRadius: 14,
                          padding: 16,
                          marginBottom: 12,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: 15,
                              fontWeight: "bold",
                              marginBottom: 6,
                            }}
                          >
                            {activity.training_type}
                          </div>

                          <div
                            style={{
                              color: "#ddd",
                              fontSize: 13,
                            }}
                          >
                            <span>{activity.anchor_metric?.cardio} </span>
                          </div>
                          {activity.notes && (
                            <span>notes: {activity.notes}</span>
                          )}
                        </div>

                        <button
                          style={{
                            padding: "8px 14px",
                            borderRadius: 10,
                            border: "none",
                            background: "#ddb52f",
                            color: "#111",
                            fontWeight: "bold",
                            cursor: "pointer",
                            marginLeft: 20,
                          }}
                        >
                          Edit
                        </button>
                      </div>
                    )}

                    {activity.training_type === "sport" && (
                      <div
                        style={{
                          background: "rgba(255,255,255,0.08)",
                          borderRadius: 14,
                          padding: 16,
                          marginBottom: 12,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: 15,
                              fontWeight: "bold",
                              marginBottom: 6,
                            }}
                          >
                            {activity.training_type}
                          </div>

                          <div
                            style={{
                              color: "#ddd",
                              fontSize: 13,
                            }}
                          >
                            <span>{activity.anchor_metric?.cardio} </span>
                          </div>
                          {activity.notes && (
                            <span>notes: {activity.notes}</span>
                          )}
                        </div>

                        <button
                          style={{
                            padding: "8px 14px",
                            borderRadius: 10,
                            border: "none",
                            background: "#ddb52f",
                            color: "#111",
                            fontWeight: "bold",
                            cursor: "pointer",
                            marginLeft: 20,
                          }}
                        >
                          Edit
                        </button>
                      </div>
                    )}

                    {activity.training_type === "swim" && (
                      <div
                        style={{
                          background: "rgba(255,255,255,0.08)",
                          borderRadius: 14,
                          padding: 16,
                          marginBottom: 12,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: 15,
                              fontWeight: "bold",
                              marginBottom: 6,
                            }}
                          >
                            {activity.training_type}
                          </div>

                          <div
                            style={{
                              color: "#ddd",
                              fontSize: 13,
                            }}
                          >
                            <span>{activity.anchor_metric?.cardio} </span>
                          </div>
                          {activity.notes && (
                            <span>notes: {activity.notes}</span>
                          )}
                        </div>

                        <button
                          style={{
                            padding: "8px 14px",
                            borderRadius: 10,
                            border: "none",
                            background: "#ddb52f",
                            color: "#111",
                            fontWeight: "bold",
                            cursor: "pointer",
                            marginLeft: 20,
                          }}
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                ))
              }

              <button
                onClick={saveWorkout}
                style={{
                  marginTop: 20,
                  width: "100%",
                  padding: 14,
                  borderRadius: 12,
                  border: "none",
                  background: "#ddb52f",
                  color: "#111",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Save Training
              </button>
            </div>
          )}
        </div>
      )}

      {step === "training" && (
        <div style={cardContainer}>
          <div style={cardStyle}>
            <motion.div
              animate={
                recording
                  ? {
                      scale: [1, 1.4, 1],
                      rotate: [0, 180, 360],
                      borderRadius: ["20%", "50%", "20%"],
                    }
                  : {}
              }
              transition={{ duration: 1.5, repeat: Infinity }}
              style={orbStyle}
            />

            {recording && (
              <button onClick={handleStop} style={mainButton}>
                Done
              </button>
            )}
          </div>
        </div>
      )}

      {step === "typelog" && (
        <div style={cardContainer}>
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring" }}
            style={cardStyle}
          >
            <button
              style={secondaryButton}
              onClick={() => setShowPreviousDropdown(!showPreviousDropdown)}
            >
              Copy from previous training
            </button>

            {showPreviousDropdown && (
              <div
                style={{
                  background: "#222",
                  borderRadius: 12,
                  marginBottom: 12,
                  maxHeight: 220,
                  overflowY: "auto",
                }}
              >
                {previousWorkouts.map((workout, index) => {
                  const first = workout.structured?.activities?.[0];

                  return (
                    <div
                      key={index}
                      onClick={() => {
                        setEditedActivities(
                          JSON.parse(
                            JSON.stringify(workout.structured.activities)
                          )
                        );

                        setAnswer({
                          structured: {
                            activities: JSON.parse(
                              JSON.stringify(workout.structured.activities)
                            ),
                          },
                        });

                        setStep("home");
                        setShowPreviousDropdown(false);
                      }}
                      style={{
                        padding: 12,
                        borderBottom: "1px solid #333",
                        cursor: "pointer",
                      }}
                    >
                      <strong>{workout.entry_date}</strong>

                      <div style={{ fontSize: 13, opacity: 0.8 }}>
                        {first?.training_type} • {first?.activity_type}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <textarea
              autoFocus
              value={trainingText}
              onChange={(e) => setTrainingText(e.target.value)}
              placeholder="Type training..."
              style={{
                width: "100%",
                height: 150,
                resize: "none",
                borderRadius: 12,
                padding: 15,
                background: "#111",
                color: "white",
                border: "none",
                fontSize: 16,
              }}
            />

            <button
              style={mainButton}
              disabled={sendingText}
              onClick={submitTextLog}
            >
              {sendingText ? "Analyzing..." : "Submit"}
            </button>

            <div style={styles.modalActions}>
              <button
                style={secondaryButton}
                onClick={() => {
                  setTrainingText("");
                  setStep("home");
                }}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// ===== STYLES =====
const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(180deg,rgba(57,13,35,0.9) 0%,rgb(29,29,58) 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
};

const cardContainer = {
  width: "100%",
  maxWidth: 360,
  display: "flex",
  flexDirection: "column",
  gap: 20,
};

const cardStyle = {
  background: "#1a1a22",
  borderRadius: 20,
  padding: 24,
  minHeight: 140,
  color: "#fff",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 18,
  fontWeight: "bold",
  boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
};

const orbStyle = {
  width: 120,
  height: 120,
  borderRadius: "50%",
  background: "linear-gradient(180deg, #ddb52f 0%, #4e0329 100%)",
  marginBottom: 20,
};

const mainButton = {
  border: "none",
  borderRadius: 12,
  padding: "12px 20px",
  background: "#ddb52f",
  color: "#4e0329",
  fontWeight: "bold",
  fontSize: 16,
  marginBottom: 20,
  marginTop: 20,
};

const secondaryButton = {
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: 12,
  padding: "12px 20px",
  background: "#2a2a35",
  color: "#fff",
  fontWeight: "bold",
  fontSize: 16,
  cursor: "pointer",
  transition: "all 0.2s ease",
  marginBottom: 20,
};
