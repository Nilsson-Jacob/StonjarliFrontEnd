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

import Holdings from "./pages/Holdings";
import Analysis from "./pages/Analysis";

function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<Navigate to="/holdings" />} />
        <Route path="/holdings" element={<Holdings />} />
        <Route path="/analysis" element={<Analysis />} />
      </Routes>
    </Router>
  );
}

export default App;
