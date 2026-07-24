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

  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  const today = new Date().toLocaleDateString();

  // ===== Load Supabase session ONCE =====
  useEffect(() => {
    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setAuthReady(true);
    };

    loadSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  // ===== START RECORDING =====
  /*
  const startRecording = async () => {
    if (!authReady) {
      console.error("Auth not ready yet");
      return;
    }

    if (!session?.access_token) {
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
      if (e.data.size > 0) audioChunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = async () => {
      try {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType,
        });

        console.log("Medie size:", audioBlob.size, audioBlob.type);

        const formData = new FormData();
        formData.append("audio", audioBlob, "training.webm");

        // 🔐 SAFE CHECK
        if (!session?.access_token) {
          console.error("Missing session token at upload time");
          return;
        }

        console.log("SESSION TOKEN:", session?.access_token);


        const res = await fetch(
          "https://agbtomavehebxbmzzziy.supabase.co/functions/v1/transcribe",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
            body: formData,
          }
        );

        const data = await res.json();
        setAnswer(data);
        //setStep("home");
      } catch (err) {
        console.error("Transcription error:", err);
      } finally {
        // cleanup mic
        setStep("home");
        streamRef.current?.getTracks().forEach((t) => t.stop());
      }
    };

    mediaRecorder.start(1000);
    setRecording(true);
  };*/
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

    const options = {
      mimeType: "audio/webm;codecs=opus",
    };

    const mediaRecorder = MediaRecorder.isTypeSupported(options.mimeType)
      ? new MediaRecorder(stream, options)
      : new MediaRecorder(stream);

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
  /*
  const handleStop = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };*/
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
  const Card = ({ children, onClick }) => (
    <div onClick={onClick} style={cardStyle}>
      {children}
    </div>
  );

  return (
    <div style={styles.page}>
      {step === "home" && (
        <div style={cardContainer}>
          <Card onClick={() => setStep("training")}>
            Log Training - {today}
          </Card>

          {answer && (
            <div style={cardStyle}>
              <pre style={{ whiteSpace: "pre-wrap" }}>
                {JSON.stringify(answer, null, 2)}
              </pre>
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
}; /*}

/*import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "../components/supabaseClient";

const serverApi = "https://stonjarliserver.onrender.com";

export default function Home() {
  const [step, setStep] = useState("home");
  // const [targets, setTargets] = useState([]);
  // const [currentTargetIndex, setCurrentTargetIndex] = useState(0);
  // const [answers, setAnswers] = useState([]);
  // home | training | protein | sleep

  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  //const [protein, setProtein] = useState(null); // less | equal | above
  //const [sleep, setSleep] = useState(null); // less | equal | above
  const [answer, setAnswer] = useState(null);

  // ===== Auto-start recording when entering training =====
  useEffect(() => {
    if (step === "training" && !recording) {
      const startRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: mediaRecorder.mimeType,
          });

          const formData = new FormData();
          formData.append("audio", audioBlob, "training.webm");

          const {
            data: { session },
          } = await supabase.auth.getSession();

          const res = await fetch(serverApi + "/transcribe", {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
            method: "POST",
            body: formData,
          });

          const data = await res.json();
          setAnswer(data);
          setStep("home");
        };

        mediaRecorder.start();
        setRecording(true);
      };

      startRecording();
    }
  }, [step, recording]);

  console.log(answer);

  // ===== Load targets from DB =====
  /*
  useEffect(() => {
    const fetchTargets = async () => {
      const { data, error } = await supabase.from("targets").select("*");
      if (error) {
        console.error(error);
      } else {
        console.log("logdata: " + data);

        setTargets(data);
      }
    };
    fetchTargets();
  }, []);*/ /*}
/*
  const today = new Date().toLocaleDateString();

  const handleStop = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
    setStep("home");
  };

  /*
  const saveDailyCheckin = async (finalAnswers) => {
    const todayKey = new Date().toISOString().split("T")[0];

    const formattedTargets = finalAnswers.map((a) => {
      const target = targets.find((t) => t.id === a.target_id);

      return {
        name: target.name,
        value: a.value,
        met: a.value === "equal" || a.value === "above",
      };
    });

    const payload = {
      date: todayKey,
      targets: formattedTargets,
    };

    console.log("Sending payload:", payload);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const res = await fetch(serverApi + "/targets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("Daily entry saved:", data);
    } catch (err) {
      console.error("Failed saving daily checkin:", err);
    }
  };*/

/*
  const handleTargetAnswer = (value) => {
    const currentTarget = targets[currentTargetIndex];

    const nextAnswers = [...answers, { target_id: currentTarget.id, value }];

    setAnswers(nextAnswers);

    if (currentTargetIndex < targets.length - 1) {
      setCurrentTargetIndex((i) => i + 1);
    } else {
      saveDailyCheckin(nextAnswers);
      setStep("home");
      setCurrentTargetIndex(0);
      setAnswers([]);
    }
  };*/

// ===== UI Components =====

/*  const Card = ({ children, onClick }) => (
    <div onClick={onClick} style={cardStyle}>
      {children}
    </div>
  );

  /*
  const ChoiceCard = ({ target }) => (
    <div style={cardStyle}>
      <h3>
        {target.icon} {target.name}
      </h3>
      <h4>
        Target: {target.target_value} {target.unit}
      </h4>
      <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
        {["less", "equal", "above"].map((opt) => (
          <button
            key={opt}
            onClick={() => handleTargetAnswer(opt)}
            style={{
              ...choiceButton,
              background: "#1a1a22",
              color: "#fff",
            }}
          >
            {opt.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );*/

// ===== Render Logic =====
/*  return (
    <div style={styles.page}>
      {step === "home" && (
        <>
          <div style={cardContainer}>
            <Card onClick={() => setStep("training")}>
              Log Training - {today}
            </Card>

            {/** <Card onClick={() => setStep("targets")}>📅 Checkin : {today}</Card> */
/*          </div>
        </>
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

      {/*step === "targets" && targets[currentTargetIndex] && (
        <div style={cardContainer}>
          <ChoiceCard target={targets[currentTargetIndex]} />
        </div>
      )*/
/*   </div>
  );
}

// ===== Styles =====

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
};

/*
const choiceButton = {
  flex: 1,
  padding: "10px",
  border: "none",
  borderRadius: 10,
  fontWeight: "bold",
};
*/
