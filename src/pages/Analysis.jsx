import React, { useState, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshDistortMaterial, OrbitControls } from "@react-three/drei";

const serverApi = "https://stonjarliserver.onrender.com";

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_PUBLISHABLE_DEFAULT_KEY
);

async function testLogin() {
  const { error } = await supabase.auth.signInWithOtp({
    email: "idrinkwater1015@gmail.com",
  });
  if (error) alert("Error sending magic link");
  else alert("Magic link sent — check your email");
}

export default function Checkin() {
  const [recording, setRecording] = useState(false);
  const [answer, setAnswer] = useState("");
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const analyserRef = useRef(null);
  const [audioLevel, setAudioLevel] = useState(0);

  // Mic + Visualizer setup
  const startAudioVisualizer = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const update = () => {
        analyser.getByteFrequencyData(dataArray);
        const avg =
          dataArray.reduce((a, b) => a + b, 0) / dataArray.length / 255;
        setAudioLevel(avg);
        requestAnimationFrame(update);
      };
      update();
    } catch (err) {
      console.error("Audio setup failed:", err);
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
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType,
        });
        const formData = new FormData();
        formData.append("audio", audioBlob);

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
      startAudioVisualizer();
    } catch (err) {
      console.error(err);
      alert("Could not access microphone");
    }
  };

  const handleStop = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  return (
    <div style={styles.app}>
      <h1 style={styles.title}>Today</h1>

      <div style={styles.card}>
        <p style={styles.prompt}>How was your day?</p>

        {/* 3D Audio‑Reactive Orb */}
        <div style={styles.canvasWrapper}>
          <Canvas camera={{ position: [0, 0, 5] }}>
            <ambientLight intensity={0.3} />
            <directionalLight position={[5, 5, 5]} />
            <AudioOrb audioLevel={audioLevel} />
            <OrbitControls enablePan={false} enableZoom={false} />
          </Canvas>
        </div>

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
          </div>
        )}

        <button style={{ ...styles.button, marginTop: 12 }} onClick={testLogin}>
          Test Email Login
        </button>
      </div>
    </div>
  );
}

// Orb component that reacts to audioLevel
function AudioOrb({ audioLevel }) {
  const meshRef = useRef();

  useFrame(() => {
    if (meshRef.current) {
      // Pulse, distort, rotate
      meshRef.current.scale.set(
        1 + audioLevel * 0.8,
        1 + audioLevel * 0.8,
        1 + audioLevel * 0.8
      );
      meshRef.current.rotation.y += 0.003;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 128, 128]} />
      <MeshDistortMaterial
        color="#3E47F4"
        attach="material"
        distort={0.5 + audioLevel * 1.5}
        speed={3}
        roughness={0.1}
        metalness={0.8}
      />
    </mesh>
  );
}

const styles = {
  app: {
    minHeight: "100vh",
    background:
      "linear-gradient(180deg, #0a0e2a 0%, #15193d 55%, #2b3b80 100%)",
    padding: 24,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif",
  },
  title: { color: "white", marginBottom: 24, fontWeight: 600 },
  card: {
    width: "100%",
    maxWidth: 420,
    background: "rgba(20, 24, 48, 0.85)",
    borderRadius: 22,
    padding: 24,
    textAlign: "center",
    boxShadow: "0 16px 40px rgba(0,0,0,0.3)",
  },
  prompt: { color: "#9fcfff", fontSize: 20, marginBottom: 16 },
  canvasWrapper: {
    width: "100%",
    height: 300,
    margin: "0 auto 18px auto",
  },
  button: {
    width: "100%",
    padding: 14,
    borderRadius: 999,
    border: "none",
    background: "#3E47F4",
    color: "white",
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
  },
  transcript: {
    color: "#dceaff",
    marginTop: 16,
    textAlign: "left",
    fontSize: 14,
  },
};
