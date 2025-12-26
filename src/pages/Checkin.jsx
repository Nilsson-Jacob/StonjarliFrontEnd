import React, { useState, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { motion } from "framer-motion";

const serverApi = "https://stonjarliserver.onrender.com";

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_PUBLISHABLE_DEFAULT_KEY
);

async function testLogin() {
  const { error } = await supabase.auth.signInWithOtp({
    email: "idrinkwater1015@gmail.com",
  });

  if (error) {
    console.error(error);
    alert("Error sending magic link");
  } else {
    alert("Magic link sent — check your email");
  }
}

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
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType,
        });

        const formData = new FormData();
        formData.append("audio", audioBlob, "day-recording.webm");

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
    <div style={{ textAlign: "center", padding: 20 }}>
      <button onClick={testLogin}>Test Email Login</button>

      <h3>maxHapp — Record your day 🎤</h3>

      {/* 🔊 Animated Speaking Indicator */}
      <motion.div
        animate={
          recording
            ? {
                scale: [1, 1.4, 1],
                rotate: [0, 180, 360],
              }
            : {
                scale: 1,
                rotate: 0,
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
      >
        {/* Vertical line */}
        <div style={verticalLine} />

        {/* Horizontal line */}
        <div style={horizontalLine} />
      </motion.div>

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

const box = {
  width: 100,
  height: 100,
  margin: "20px auto",
  backgroundColor: "#f5f5f5",
  position: "relative",
  borderRadius: 8,
};

const verticalLine = {
  position: "absolute",
  top: 0,
  bottom: 0,
  left: "50%",
  width: 2,
  backgroundColor: "#333",
  transform: "translateX(-50%)",
};

const horizontalLine = {
  position: "absolute",
  left: 0,
  right: 0,
  top: "50%",
  height: 2,
  backgroundColor: "#333",
  transform: "translateY(-50%)",
};
