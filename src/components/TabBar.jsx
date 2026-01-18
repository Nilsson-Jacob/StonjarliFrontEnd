import { NavLink } from "react-router-dom";

export default function Tabs() {
  return (
    <div style={styles.container}>
      <NavLink
        to="/profile"
        style={({ isActive }) => ({
          ...styles.tab,
          color: isActive ? "#ddb52f" : "#fff",
        })}
      >
        Profile
      </NavLink>

      <NavLink
        to="/logs"
        style={({ isActive }) => ({
          ...styles.tab,
          color: isActive ? "#ddb52f" : "#fff",
        })}
      >
        Logs
      </NavLink>
    </div>
  );
}

const styles = {
  container: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    background: "#4e0329",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    borderTop: "1px solid rgba(255,255,255,0.1)",
    zIndex: 1000,
  },
  tab: {
    fontSize: 16,
    fontWeight: "bold",
    textDecoration: "none",
  },
};
