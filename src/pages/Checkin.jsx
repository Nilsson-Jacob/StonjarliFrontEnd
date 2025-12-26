import React, { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshDistortMaterial, OrbitControls } from "@react-three/drei";

export default function Checkin() {
  const [listening, setListening] = useState(false);
  const [audioData, setAudioData] = useState(0);
  const analyserRef = useRef(null);

  // Start mic and audio analysis
  const startAudio = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    analyserRef.current = analyser;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const animate = () => {
      analyser.getByteFrequencyData(dataArray);
      const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      setAudioData(avg / 255); // normalize 0-1
      requestAnimationFrame(animate);
    };
    animate();
  };

  const toggleListening = () => {
    if (!listening) startAudio();
    setListening(!listening);
  };

  return (
    <div style={styles.app}>
      <h1 style={styles.title}>Today</h1>
      <div style={styles.card}>
        <p style={styles.prompt}>How was your day?</p>

        {/* 3D AI Orb Visualizer */}
        <div style={{ width: "100%", height: 300 }}>
          <Canvas>
            <ambientLight intensity={0.3} />
            <directionalLight position={[5, 5, 5]} />
            <AudioOrb audioData={audioData} />
            <OrbitControls enableZoom={false} enablePan={false} />
          </Canvas>
        </div>

        <button style={styles.button} onClick={toggleListening}>
          {listening ? "Stop" : "Start Talking"}
        </button>
      </div>
    </div>
  );
}

// Orb Component
function AudioOrb({ audioData }) {
  const meshRef = useRef();

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.scale.set(
        1 + audioData * 0.8,
        1 + audioData * 0.8,
        1 + audioData * 0.8
      );
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 64, 64]} />
      <MeshDistortMaterial
        color="#ddb52f"
        attach="material"
        distort={0.5}
        speed={3}
        roughness={0.2}
        metalness={0.8}
      />
    </mesh>
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
  prompt: { color: "#ddb52f", fontSize: 18, marginBottom: 16 },
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
};
