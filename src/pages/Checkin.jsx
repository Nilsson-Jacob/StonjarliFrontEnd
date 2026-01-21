import React, { useState, useRef } from "react";
import { motion } from "framer-motion";

const serverApi = "https://stonjarliserver.onrender.com";

export default function Home() {
  const [step, setStep] = useState("home");
  // home | training | protein | sleep

  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const [protein, setProtein] = useState(null); // less | equal | above
  const [sleep, setSleep] = useState(null); // less | equal | above
  const [answer, setAnswer] = useState(null);

  const today = new Date().toLocaleDateString();

  // ===== Recording Logic =====
  const handleStart = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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

      const res = await fetch(serverApi + "/transcribe", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setAnswer(data);
      console.log(answer);
      setStep("home");
    };

    mediaRecorder.start();
    setRecording(true);
  };

  const handleStop = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  const saveDailyCheckin = async () => {
    const todayKey = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    const payload = {
      date: todayKey,
      targets: [
        {
          protein: protein,
        },
        { sleep: sleep },
      ],
    };

    try {
      const res = await fetch(serverApi + "/targets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("Daily entry saved:", data);
    } catch (err) {
      console.error("Failed saving daily checkin:", err);
    }
  };

  // ===== UI Components =====
  const Card = ({ children, onClick }) => (
    <div onClick={onClick} style={cardStyle}>
      {children}
    </div>
  );

  const ChoiceCard = ({ title, value, setValue, onNext, onSubmit }) => (
    <div style={cardStyle}>
      <h3>{title}</h3>
      <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
        {["less", "equal", "above"].map((opt) => (
          <button
            key={opt}
            onClick={() => {
              setValue(opt);
              if (onSubmit) {
                saveDailyCheckin();
              }
              onNext();
            }}
            style={{
              ...choiceButton,
              background: value === opt ? "#ddb52f" : "#1a1a22",
              color: value === opt ? "#4e0329" : "#fff",
            }}
          >
            {opt.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );

  // ===== Render Logic =====
  return (
    <div style={styles.page}>
      {step === "home" && (
        <div style={cardContainer}>
          <Card onClick={() => setStep("training")}>🎤 Checkin Training</Card>

          <Card onClick={() => setStep("protein")}>📅 Checkin : {today}</Card>
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
            <button
              onClick={recording ? handleStop : handleStart}
              style={mainButton}
            >
              {recording ? "Finish" : "Start Talking"}
            </button>
          </div>
        </div>
      )}

      {step === "protein" && (
        <div style={cardContainer}>
          <ChoiceCard
            title="Protein intake goal?"
            value={protein}
            setValue={setProtein}
            onNext={() => setStep("sleep")}
          />
        </div>
      )}

      {step === "sleep" && (
        <div style={cardContainer}>
          <ChoiceCard
            title="Sleep goal?"
            value={sleep}
            setValue={setSleep}
            onNext={() => setStep("home")}
            onSubmit={true}
          />
        </div>
      )}
    </div>
  );
}

// ===== Styles =====

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #4e0329 0%, #0f0f14 100%)",
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

const choiceButton = {
  flex: 1,
  padding: "10px",
  border: "none",
  borderRadius: 10,
  fontWeight: "bold",
};

/*
----------------------------------------


import React, { useState, useRef } from "react";
import { motion } from "framer-motion";

const serverApi = "https://stonjarliserver.onrender.com";

const Home = () => {
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [answer, setAnswer] = useState("");

  // New state for questions
  const [sleep, setSleep] = useState(null); // "yes" / "no"
  const [protein, setProtein] = useState(null); // "yes" / "no"

  const handleStart = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const mimeType = mediaRecorder.mimeType;
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });

        const extension = mimeType.includes("webm")
          ? "webm"
          : mimeType.includes("ogg")
          ? "ogg"
          : mimeType.includes("mp4")
          ? "mp4"
          : "audio";

        const formData = new FormData();
        formData.append("audio", audioBlob, `day-recording.${extension}`);
        // Optional: include selected answers if backend supports it
        formData.append("sleep", sleep || "");
        formData.append("protein", protein || "");

        try {
          const res = await fetch(serverApi + "/transcribe", {
            method: "POST",
            body: formData,
          });

          const data = await res.json();
          setAnswer(data);
        } catch (err) {
          console.error("Upload failed", err);
        }
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone");
    }
  };

  const handleStop = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  // Component for a binary question with styled buttons
  const BinaryQuestion = ({ label, value, setValue }) => (
    <div style={questionStyle}>
      <span>{label}</span>
      <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
        {["yes", "no"].map((option) => (
          <button
            key={option}
            onClick={() => setValue(option)}
            style={{
              ...buttonStyle,
              backgroundColor: value === option ? "#ddb52f" : "#f5f5f5",
              color: value === option ? "#4e0329" : "#000",
            }}
          >
            {option.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ ...styles.page, textAlign: "center", padding: "20px" }}>
      <h3>maxHapp — Record your day 🎤</h3>

      <motion.div
        animate={
          recording
            ? {
                scale: [1, 1.5, 1],
                rotate: [0, 180, 360],
                borderRadius: ["20%", "50%", "20%"],
              }
            : { scale: 1, rotate: 0, borderRadius: "20%" }
        }
        transition={
          recording
            ? { duration: 1.2, ease: "easeInOut", repeat: Infinity }
            : { duration: 0.3 }
        }
        style={box}
      />

      <button
        style={{ marginTop: 20, ...buttonStyle, padding: "10px 20px" }}
        onClick={recording ? handleStop : handleStart}
      >
        {recording ? "Stop Recording" : "Start Recording"}
      </button>

      <div style={{ marginTop: 30 }}>
        <BinaryQuestion label="Slept ≥7h?" value={sleep} setValue={setSleep} />
        <BinaryQuestion
          label="Protein goal met?"
          value={protein}
          setValue={setProtein}
        />
      </div>

      {answer && (
        <div style={{ marginTop: 30, textAlign: "left" }}>
          <h4>Transcript</h4>
          <p>{answer.transcript}</p>

          <h4>Structured data</h4>
          <pre>{JSON.stringify(answer.structured, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default Home;
*/
/**
 * ============== Styles ================
 */
/*
const box = {
  width: 100,
  height: 100,
  margin: "20px auto",
  backgroundColor: "#f5f5f5",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(180deg, #ddb52f 0%, #4e0329 100%)",
};

const buttonStyle = {
  border: "none",
  borderRadius: 8,
  padding: "6px 14px",
  cursor: "pointer",
  fontWeight: "bold",
  transition: "all 0.2s",
};

const questionStyle = {
  marginBottom: 20,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #4e0329 0%, #ddb52f 100%)",
  },
};*/
