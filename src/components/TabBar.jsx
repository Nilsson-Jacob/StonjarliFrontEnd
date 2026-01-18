import { useNavigate, useLocation } from "react-router-dom";

export default function TopNavbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isProfile = location.pathname === "/profile";
  const isLogs = location.pathname === "/logs";

  // Only show navbar on Profile and Logs
  if (!isProfile && !isLogs) return null;

  return (
    <div style={styles.container}>
      {/* Back Button */}
      <button onClick={() => navigate("/")} style={styles.backButton}>
        ←
      </button>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          onClick={() => navigate("/profile")}
          style={{
            ...styles.tab,
            ...(isProfile ? styles.activeTab : {}),
          }}
        >
          Profile
        </button>
        <button
          onClick={() => navigate("/logs")}
          style={{
            ...styles.tab,
            ...(isLogs ? styles.activeTab : {}),
          }}
        >
          Logs
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    padding: "0 12px",
    display: "flex",
    alignItems: "center",
    background: "rgba(15, 15, 20, 0.75)", // dark translucent
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    zIndex: 1000,
  },

  backButton: {
    background: "none",
    border: "none",
    color: "#ddb52f",
    fontSize: 22,
    fontWeight: "bold",
    cursor: "pointer",
    marginRight: 12,
  },

  tabs: {
    display: "flex",
    flex: 1,
    justifyContent: "center",
    gap: 20,
  },

  tab: {
    background: "rgba(255,255,255,0.05)",
    border: "none",
    borderRadius: 20,
    padding: "6px 16px",
    color: "#aaa",
    fontSize: 14,
    fontWeight: "bold",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },

  activeTab: {
    background: "rgba(221,181,47,0.25)",
    color: "#ddb52f",
    boxShadow: "0 0 10px rgba(221,181,47,0.4)",
  },
};
