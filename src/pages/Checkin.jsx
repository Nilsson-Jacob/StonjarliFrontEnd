import React, { useState, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

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

export default function Checkin() {
  const [recording, setRecording] = useState(false);
  const [answer, setAnswer] = useState("");
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const canvasRef = useRef(null);
  const analyserRef = useRef(null);
  const animationRef = useRef(null);

  // Start microphone + visualizer
  const startVisualizer = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const draw = () => {
        animationRef.current = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const barCount = 32;
        const barWidth = canvas.width / barCount;
        let x = 0;

        for (let i = 0; i < barCount; i++) {
          const val = dataArray[i * 4] / 255;
          const barHeight = val * canvas.height;
          const hue = 200 + val * 100;
          ctx.fillStyle = `hsl(${hue}, 90%, 60%)`;
          ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);
          x += barWidth;
        }
      };

      draw();
    } catch (err) {
      console.error("Visualizer error:", err);
    }
  };

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
      startVisualizer();
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone");
    }
  };

  const handleStop = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      cancelAnimationFrame(animationRef.current);
    }
  };

  return (
    <div style={styles.app}>
      <h1 style={styles.title}>Today</h1>

      <div style={styles.card}>
        <p style={styles.prompt}>How was your day?</p>

        {/* AI Motion Visualizer */}
        <canvas
          ref={canvasRef}
          width={300}
          height={120}
          style={styles.visualizer}
        />

        <button
          style={styles.button}
          onClick={recording ? handleStop : handleStart}
        >
          {recording ? "Stop Recording" : "Start Talking"}
        </button>

        {answer && (
          <div style={styles.transcript}>
            <h4>Transcript</h4>
            <p>{answer.transcript}</p>

            <h4>Structured Data</h4>
            <pre>{JSON.stringify(answer.structured, null, 2)}</pre>
          </div>
        )}

        <button style={{ ...styles.button, marginTop: 12 }} onClick={testLogin}>
          Test Email Login
        </button>
      </div>
    </div>
  );
}

const styles = {
  app: {
    minHeight: "100vh",
    background:
      "linear-gradient(180deg, #5a082d 0%, #72063c 45%, #e0b73a 100%)",
    padding: 24,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif",
  },
  title: { color: "white", marginBottom: 24, fontWeight: 600 },
  card: {
    width: "100%",
    maxWidth: 400,
    background: "rgba(114, 6, 60, 0.9)",
    borderRadius: 22,
    padding: 24,
    textAlign: "center",
    boxShadow: "0 16px 40px rgba(0,0,0,0.25)",
  },
  prompt: {
    color: "#ddb52f",
    fontSize: 18,
    marginBottom: 16,
  },
  visualizer: {
    display: "block",
    margin: "20px auto",
    borderRadius: 12,
    background: "rgba(11,11,18,0.6)",
    boxShadow: "0 0 20px rgba(221,181,47,0.5)",
  },
  button: {
    width: "100%",
    padding: 14,
    borderRadius: 999,
    border: "none",
    background: "#ddb52f",
    color: "#4e0329",
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
    marginTop: 12,
  },
  transcript: {
    color: "#fff",
    marginTop: 16,
    textAlign: "left",
    fontSize: 14,
  },
};
