import { useNavigate, useLocation } from "react-router-dom";

export default function TopNavbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === "/checkin";
  const isProfile = location.pathname === "/profile";
  const isLogs = location.pathname === "/logs";

  return (
    <div style={styles.container}>
      {/* Back button only when NOT on main page */}
      {!isHome && (
        <button onClick={() => navigate("/")} style={styles.backButton}>
          ←
        </button>
      )}

      {/* Tabs */}
      <div
        style={{
          ...styles.tabs,
          ...(isHome && styles.homeTabs),
        }}
      >
        <button
          onClick={() => navigate("/profile")}
          style={{
            ...styles.tab,
            ...(isProfile ? styles.activeTab : {}),
            ...(isHome ? styles.homeTab : {}),
          }}
        >
          Profile
        </button>

        <button
          onClick={() => navigate("/logs")}
          style={{
            ...styles.tab,
            ...(isLogs ? styles.activeTab : {}),
            ...(isHome ? styles.homeTab : {}),
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
    background: "rgba(10, 10, 15, 0.75)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    zIndex: 1000,
  },

  backButton: {
    background: "rgba(255,255,255,0.08)",
    border: "none",
    borderRadius: 10,
    color: "#fff",
    fontSize: 20,
    cursor: "pointer",
    width: 45,
    height: 45,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    transition: "background 0.2s ease",
  },

  tabs: {
    display: "flex",
    flex: 1,
    height: "100%",
  },

  /* Main page: full width split tabs */
  homeTabs: {
    gap: 0,
  },

  /* Inner pages: compact centered tabs */
  innerTabs: {
    justifyContent: "center",
  },

  tab: {
    background: "rgba(255,255,255,0.06)",
    border: "none",
    //borderRadius: 14,
    // padding: "8px 18px",
    color: "#aaa",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.25s ease",
  },

  /* Used only on the home page: split the bar in half */
  homeTab: {
    flex: 1,
    borderRadius: 0,
    margin: 0,
    height: "100%",
    fontSize: 15,
    background: "rgba(255,255,255,0.03)",
  },

  activeTab: {
    color: "#fff",
    background:
      "linear-gradient(135deg, rgba(90,120,255,0.35), rgba(130,90,255,0.35))",
    boxShadow: "0 4px 15px rgba(90,120,255,0.35)",
  },
};
