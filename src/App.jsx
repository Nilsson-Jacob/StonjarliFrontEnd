/*import EarningsTable from "./components/EarningsTable";
import StockCard from "./components/StockCard";
import StrategySimulator from "./components/StrategySimulator";*/

// App.jsx
import React from "react";
import NavBar from "./components/NavBar";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Opportunities from "./pages/Opportunites";
import Current from "./pages/Current";

function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<Navigate to="/opportunities" />} />
        <Route path="/opportunities" element={<Opportunities />} />
        <Route path="/current" element={<Current />} />
      </Routes>
    </Router>
  );
}

export default App;
