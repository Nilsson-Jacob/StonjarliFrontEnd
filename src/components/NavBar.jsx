// components/NavBar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./NavBar.css"; // optional: for styling

const NavBar = () => {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-title">
        <h1>📊 Earnings Drift 📊</h1>
      </div>
      <ul className="navbar-links">
        <li className={location.pathname === "/opportunities" ? "active" : ""}>
          <Link to="/opportunities">Opportunities</Link>
        </li>
        <li className={location.pathname === "/current" ? "active" : ""}>
          <Link to="/current">Current</Link>
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;
