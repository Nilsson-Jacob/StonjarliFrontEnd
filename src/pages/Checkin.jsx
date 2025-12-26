import { useState } from "react";

export default function Checkin() {
  const [listening, setListening] = useState(false);

  return (
    <div style={styles.app}>
      <h1 style={styles.title}>Today</h1>

      <div style={styles.card}>
        <p style={styles.prompt}>How was your day?</p>

        <ListeningOrb active={listening} />

        <button style={styles.button} onClick={() => setListening(!listening)}>
          {listening ? "Stop" : "Start talking"}
        </button>
      </div>

      {/* Inline animations */}
      <style>{keyframes}</style>
    </div>
  );
}

function ListeningOrb({ active }) {
  return (
    <div style={{ ...styles.orb, ...(active ? styles.orbActive : {}) }}>
      <span style={ringStyle(0)} />
      <span style={ringStyle(0.6)} />
      <span style={ringStyle(1.2)} />
    </div>
  );
}

/* ---------- STYLES ---------- */

const styles = {
  app: {
    minHeight: "100vh",
    background:
      "linear-gradient(180deg, #5a082d 0%, #72063c 45%, #e0b73a 100%)",
    animation: "breathe 12s ease-in-out infinite",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif",
  },

  title: {
    color: "white",
    marginBottom: 24,
    fontWeight: 600,
    letterSpacing: "0.4px",
  },

  card: {
    width: "100%",
    maxWidth: 360,
    background: "rgba(114, 6, 60, 0.9)",
    borderRadius: 22,
    padding: 24,
    boxShadow: "0 16px 40px rgba(0,0,0,0.25)",
    textAlign: "center",
  },

  prompt: {
    color: "#ddb52f",
    fontSize: 18,
    marginBottom: 20,
  },

  orb: {
    position: "relative",
    width: 110,
    height: 110,
    margin: "20px auto",
    borderRadius: "50%",
    background: "radial-gradient(circle, #ddb52f, #72063c)",
    boxShadow: "0 0 30px rgba(221, 181, 47, 0.5)",
    opacity: 0.6,
    transition: "all 0.3s ease",
  },

  orbActive: {
    opacity: 1,
    animation: "pulse 1.8s infinite",
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
    transition: "transform 0.15s ease",
  },
};

const ringStyle = (delay) => ({
  position: "absolute",
  inset: -12,
  borderRadius: "50%",
  border: "2px solid rgba(221,181,47,0.6)",
  opacity: 0,
  animation: `ring 1.8s infinite`,
  animationDelay: `${delay}s`,
});

/* ---------- KEYFRAMES ---------- */

const keyframes = `
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.08); }
  100% { transform: scale(1); }
}

@keyframes ring {
  0% {
    transform: scale(0.9);
    opacity: 0.6;
  }
  100% {
    transform: scale(1.4);
    opacity: 0;
  }
}

@keyframes breathe {
  0% { filter: brightness(1); }
  50% { filter: brightness(1.03); }
  100% { filter: brightness(1); }
}
`;
