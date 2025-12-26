// components/NavBar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./NavBar.css"; // optional: for styling

import jNVENT from "../images/jNVENTV2.png";

const NavBar = () => {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-title">
        <img src={jNVENT} alt="logo" width={"150px"} />
      </div>
      <ul className="navbar-links">
        <li className={location.pathname === "/holdings" ? "active" : ""}>
          <Link to="/holdings">Holdings</Link>
        </li>
        {/* <li className={location.pathname === "/todays" ? "active" : ""}>
          <Link to="/todays">Todays</Link>
        </li> */}
        <li className={location.pathname === "/analysis" ? "active" : ""}>
          <Link to="/analysis">Analytics </Link>
        </li>
        <li className={location.pathname === "/checkin" ? "active" : ""}>
          <Link to="/checkin">Checkin</Link>
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;
