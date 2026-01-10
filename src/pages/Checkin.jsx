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

      {/* Motion Indicator */}
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

      {/* Binary Questions */}
      <div style={{ marginTop: 30 }}>
        <BinaryQuestion label="Slept ≥7h?" value={sleep} setValue={setSleep} />
        <BinaryQuestion
          label="Protein goal met?"
          value={protein}
          setValue={setProtein}
        />
      </div>

      {/* Display results */}
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

/**
 * ============== Styles ================
 */
const box = {
  width: 100,
  height: 100,
  margin: "20px auto",
  backgroundColor: "#f5f5f5",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
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
};

/*import React, { useState, useRef } from "react";
import { motion } from "framer-motion";

const serverApi = "https://stonjarliserver.onrender.com";


const Home = () => {
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [answer, setAnswer] = useState("");

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
            : {
                scale: 1,
                rotate: 0,
                borderRadius: "20%",
              }
        }
        transition={
          recording
            ? {
                duration: 1.2,
                ease: "easeInOut",
                repeat: Infinity,
              }
            : { duration: 0.3 }
        }
        style={box}
      />

      <button
        style={{ marginTop: 20 }}
        onClick={recording ? handleStop : handleStart}
      >
        {recording ? "Stop Recording" : "Start Recording"}
      </button>

      {answer && (
        <div style={{ marginTop: 20, textAlign: "left" }}>
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
};

const styles = {
  page: {
    height: "100vh",
    background: "linear-gradient(180deg, #4e0329 0%, #ddb52f 100%)",
  },
};*/
