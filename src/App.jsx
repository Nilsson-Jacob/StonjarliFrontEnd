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
import Checkin from "./pages/Checkin";
import Auth from "./pages/Auth";
import ProtectedRoute from "./components/ProtectedRoute";
import Logs from "./pages/Logs";

function App() {
  return (
    <Router>
      <NavBar />

      <Routes>
        {/* Public */}
        <Route path="/auth" element={<Auth />} />

        {/* Default */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Navigate to="/checkin" />
            </ProtectedRoute>
          }
        />

        {/* Protected */}
        <Route
          path="/holdings"
          element={
            <ProtectedRoute>
              <Holdings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/analysis"
          element={
            <ProtectedRoute>
              <Analysis />
            </ProtectedRoute>
          }
        />

        <Route
          path="/checkin"
          element={
            <ProtectedRoute>
              <Checkin />
            </ProtectedRoute>
          }
        />

        {/* Protected */}
        <Route
          path="/logs"
          element={
            <ProtectedRoute>
              <Logs />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

// App.jsx
/*
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
import Checkin from "./pages/Checkin";

function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<Navigate to="/holdings" />} />
        <Route path="/holdings" element={<Holdings />} />
        <Route path="/analysis" element={<Analysis />} />
        <Route path="/checkin" element={<Checkin />} />
      </Routes>
    </Router>
  );
}

export default App;
*/
