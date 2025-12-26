/*import React, { useState, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

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

  // Start audio analyser for orb
  const startAudioAnalyser = async () => {
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
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setAudioLevel(avg / 256); // normalized 0-1
        requestAnimationFrame(update);
      };
      update();
    } catch (err) {
      console.error("Audio analyser failed:", err);
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
      startAudioAnalyser();
    } catch (err) {
      console.error("Microphone access error:", err);
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
    <div style={styles.app}>
      <h1 style={styles.title}>Today</h1>
      <div style={styles.card}>
        <p style={styles.prompt}>How was your day?</p>

        <div style={styles.canvasWrapper}>
          <Canvas camera={{ position: [0, 0, 4] }}>
            <ambientLight intensity={0.3} />
            <directionalLight position={[5, 5, 5]} />
            <VoiceOrb audioLevel={audioLevel} />
            <OrbitControls enablePan={false} enableZoom={false} />
          </Canvas>
        </div>

        <button
          style={styles.button}
          onClick={recording ? handleStop : handleStart}
        >
          {recording ? "Stop Recording" : "Start Recording"}
        </button>

        {answer && (
          <div style={styles.transcript}>
            <h4>Transcript</h4>
            <p>{answer.transcript}</p>

            <h4>Structured data</h4>
            <pre>{JSON.stringify(answer.structured, null, 2)}</pre>
          </div>
        )}

        <button style={styles.button} onClick={testLogin}>
          Test Email Login
        </button>
      </div>
    </div>
  );
}

// Orb component with sine-wave distortion (no external noise)
function VoiceOrb({ audioLevel }) {
  const meshRef = useRef();

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.elapsedTime;

    // Pulse scale + rotation based on audio
    const scale = 1 + audioLevel * 0.8;
    meshRef.current.scale.set(scale, scale, scale);
    meshRef.current.rotation.y = t * 0.2;
    meshRef.current.rotation.x = Math.sin(t * 0.3) * 0.1;

    // Simple vertex distortion using sine waves
    const geometry = meshRef.current.geometry;
    const pos = geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const offset = Math.sin(x * 5 + t * 3) * 0.03 * audioLevel;
      pos.setXYZ(i, x + offset, y + offset, z + offset);
    }
    pos.needsUpdate = true;
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1, 64]} />
      <meshStandardMaterial
        color="#4C82FF"
        emissive="#2F3FD7"
        metalness={0.6}
        roughness={0.2}
      />
    </mesh>
  );
}

const styles = {
  app: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #01040f 0%, #0a174b 80%)",
    padding: 24,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    fontFamily: "Inter, sans-serif",
  },
  title: { color: "white", marginBottom: 24, fontWeight: 600 },
  card: {
    width: "100%",
    maxWidth: 420,
    background: "rgba(10, 14, 34, 0.9)",
    borderRadius: 20,
    padding: 24,
    textAlign: "center",
  },
  prompt: { color: "#9fcfff", fontSize: 18, marginBottom: 16 },
  canvasWrapper: { width: "100%", height: 300, marginBottom: 18 },
  button: {
    width: "100%",
    padding: 14,
    borderRadius: 999,
    border: "none",
    background: "#4C82FF",
    color: "white",
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
    marginBottom: 12,
  },
  transcript: {
    color: "#dceaff",
    marginTop: 16,
    textAlign: "left",
  },
}; */

import { motion } from "framer-motion";

export default function Keyframes() {
  return (
    <motion.div
      animate={{
        scale: [1, 2, 2, 1, 1],
        rotate: [0, 0, 180, 180, 0],
        borderRadius: ["0%", "0%", "50%", "50%", "0%"],
      }}
      transition={{
        duration: 2,
        ease: "easeInOut",
        times: [0, 0.2, 0.5, 0.8, 1],
        repeat: Infinity,
        repeatDelay: 1,
      }}
      style={box}
    />
  );
}

/**
 * ==============   Styles   ================
 */

const box = {
  width: 100,
  height: 100,
  backgroundColor: "#f5f5f5",
  borderRadius: 5,
};
