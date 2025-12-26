import { useState, useEffect } from "react";

export default function Checkin() {
  const [listening, setListening] = useState(false);

  return (
    <div style={styles.app}>
      <h1 style={styles.title}>Today</h1>

      <div style={styles.card}>
        <p style={styles.prompt}>How was your day?</p>

        <SiriBlob active={listening} />

        <button style={styles.button} onClick={() => setListening(!listening)}>
          {listening ? "Stop" : "Start talking"}
        </button>
      </div>

      <style>{keyframes}</style>
    </div>
  );
}

function SiriBlob({ active }) {
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
    <div style={styles.blobContainer}>
      {/* Soft rings */}
      {[0, 0.8, 1.6].map((delay) => (
        <span
          key={delay}
          style={{
            ...styles.ring,
            animationDelay: `${delay}s`,
            opacity: active ? 0.5 : 0.2,
          }}
        />
      ))}

      {/* Floating blob */}
      <div
        style={{
          ...styles.blob,
          ...(active ? styles.blobActive : styles.blobIdle),
        }}
      />

      {/* Countdown only when active */}
      {active && (
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
            stroke="rgba(221,181,47,0.15)"
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
      )}
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

  blobContainer: {
    position: "relative",
    width: 130,
    height: 130,
    margin: "20px auto",
  },

  blob: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    borderRadius: "45% 55% 50% 50% / 55% 45% 50% 50%",
    background: "radial-gradient(circle at 40% 40%, #ddb52f, #72063c)",
    boxShadow: "0 0 40px rgba(221,181,47,0.4)",
    transition: "all 0.3s ease",
    zIndex: 1,
  },

  blobIdle: {
    animation:
      "float 6s ease-in-out infinite, subtlePulse 3s ease-in-out infinite",
  },

  blobActive: {
    animation:
      "float 6s ease-in-out infinite, pulse 3s ease-in-out infinite, rotate 12s linear infinite",
  },

  ring: {
    position: "absolute",
    inset: -12,
    borderRadius: "50%",
    border: "2px solid rgba(221,181,47,0.3)",
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

@keyframes subtlePulse {
  0% { transform: scale(0.98); }
  50% { transform: scale(1.02); }
  100% { transform: scale(0.98); }
}

@keyframes rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes float {
  0%, 100% { transform: translateY(0) translateX(0) border-radius: 45% 55% 50% 50% / 55% 45% 50% 50%; }
  25% { transform: translateY(-6px) translateX(4px) border-radius: 50% 45% 55% 50% / 50% 50% 55% 45%; }
  50% { transform: translateY(4px) translateX(-4px) border-radius: 48% 52% 45% 55% / 55% 50% 50% 45%; }
  75% { transform: translateY(-3px) translateX(3px) border-radius: 50% 50% 50% 50% / 50% 55% 50% 50%; }
}

@keyframes ring {
  0% { transform: scale(0.9); opacity: 0.3; }
  100% { transform: scale(1.4); opacity: 0; }
}

@keyframes breathe {
  0% { filter: brightness(1); }
  50% { filter: brightness(1.03); }
  100% { filter: brightness(1); }
}
`;
