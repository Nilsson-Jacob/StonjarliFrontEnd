// components/NavBar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./NavBar.css"; // optional: for styling

const NavBar = () => {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-title">
        <h1>
          WoolSt
          <span
            style={{
              fontSize: "0.7rem",
              color: "white",
              position: "relative",
              alignSelf: "self-end",
              left: "10px",
            }}
          ></span>
        </h1>
      </div>
      <ul className="navbar-links">
        <li className={location.pathname === "/holdings" ? "active" : ""}>
          <Link to="/holdings">Holdings</Link>
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;
