import { useState, useEffect } from "react";

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

      <style>{keyframes}</style>
    </div>
  );
}

function ListeningOrb({ active }) {
  const [progress, setProgress] = useState(0);
  const totalTime = 30; // seconds

  useEffect(() => {
    if (!active) {
      setProgress(0);
      return;
    }

    let start = Date.now();
    const interval = setInterval(() => {
      const elapsed = (Date.now() - start) / 1000;
      const pct = Math.min(elapsed / totalTime, 1);
      setProgress(pct);

      if (pct >= 1) clearInterval(interval);
    }, 100);

    return () => clearInterval(interval);
  }, [active]);

  const radius = 65;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div style={styles.orbContainer}>
      {/* Pulsing rings */}
      {[0, 0.6, 1.2].map((delay) => (
        <span
          key={delay}
          style={{
            ...styles.ring,
            animationDelay: `${delay}s`,
            ...(active
              ? { animationPlayState: "running" }
              : { animationPlayState: "paused" }),
          }}
        />
      ))}

      {/* Orb */}
      <div style={{ ...styles.orb, ...(active ? styles.orbActive : {}) }} />

      {/* Circular countdown */}
      <svg
        style={styles.progressSvg}
        width={radius * 2}
        height={radius * 2}
        viewBox={`0 0 ${radius * 2} ${radius * 2}`}
      >
        <circle
          cx={radius}
          cy={radius}
          r={radius}
          fill="transparent"
          stroke="rgba(221,181,47,0.2)"
          strokeWidth={4}
        />
        <circle
          cx={radius}
          cy={radius}
          r={radius}
          fill="transparent"
          stroke="#ddb52f"
          strokeWidth={4}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.1s linear" }}
        />
      </svg>
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

  orbContainer: {
    position: "relative",
    width: 130,
    height: 130,
    margin: "20px auto",
  },

  orb: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    background: "radial-gradient(circle, #ddb52f, #72063c)",
    boxShadow: "0 0 30px rgba(221, 181, 47, 0.5)",
    opacity: 0.6,
    transition: "all 0.3s ease",
    zIndex: 1,
  },

  orbActive: {
    opacity: 1,
    animation: "pulse 3s ease-in-out infinite, rotate 12s linear infinite",
  },

  ring: {
    position: "absolute",
    inset: -12,
    borderRadius: "50%",
    border: "2px solid rgba(221,181,47,0.6)",
    opacity: 0,
    animation: "ring 2.5s infinite",
    zIndex: 0,
  },

  progressSvg: {
    position: "absolute",
    top: 0,
    left: 0,
    transform: "rotate(-90deg)",
    zIndex: 2,
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

/* ---------- KEYFRAMES ---------- */
const keyframes = `
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

@keyframes rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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
