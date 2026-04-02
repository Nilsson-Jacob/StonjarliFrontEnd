// components/NavBar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./NavBar.css"; // optional: for styling

const CafeNavBar = () => {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-title"></div>
      <ul className="navbar-links">
        <li className={location.pathname === "/event-overview" ? "active" : ""}>
          <Link to="/event-overview">Overview</Link>
        </li>
      </ul>
    </nav>
  );
};

export default CafeNavBar;
