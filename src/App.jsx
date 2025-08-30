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
import Todays from "./pages/Todays";
//import Todays from "./pages/Todays";

function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<Navigate to="/todays" />} />
        <Route path="/holdings" element={<Holdings />} />
        <Route path="/todays" element={<Todays />} />
      </Routes>
    </Router>
  );
}

export default App;
