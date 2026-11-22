import React from "react";
//import NavBar from "./components/NavBar";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import Holdings from "./pages/Holdings";
import Analysis from "./pages/Analysis";
import Checkin from "./pages/Checkin";
import Auth from "./pages/Auth";
import ProtectedRoute from "./components/ProtectedRoute";
import Logs from "./pages/Logs";
import Insights from "./pages/Insights";
import Tabs from "./components/TabBar";
import Profile from "./pages/Profile";

import Eventcalendar from "./pages/Eventcalendar";
//import CafeNavBar from "./components/CafeNavBar";
import EventPage from "./pages/EventPage";
import CancelBooking from "./pages/CancelEventPage";
import CafeAnalytics from "./pages/CafeAnalytics";

import CVBuilder from "./pages/CVBuilder";
import CVAuth from "./pages/CVAuth";

function AppLayout() {
  const location = useLocation();

  return (
    <>
      {location.pathname !== "/cvbuilder" && <Tabs />}

      <Routes>
        {/* Public */}
        <Route path="/auth" element={<Auth />} />
        <Route path="/cvauth" element={<CVAuth />} />

        {/* Default */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Navigate to="/checkin" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/event-overview"
          element={
            <ProtectedRoute>
              <Eventcalendar />
            </ProtectedRoute>
          }
        />

        <Route path="/event/:eventId" element={<EventPage />} />
        <Route path="/cancel/:token" element={<CancelBooking />} />
        <Route path="/analytics" element={<CafeAnalytics />} />

        <Route
          path="/cvbuilder"
          element={
            <ProtectedRoute>
              <CVBuilder />
            </ProtectedRoute>
          }
        />

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

        <Route
          path="/logs"
          element={
            <ProtectedRoute>
              <Logs />
            </ProtectedRoute>
          }
        />

        <Route
          path="/insights"
          element={
            <ProtectedRoute>
              <Insights />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        {/* Keep ALL your other existing routes here */}
      </Routes>
    </>
  );
}
function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;

/*
function App() {
  const location = useLocation();

  return (
    <Router>
      {location.pathname !== "/cvbuilder" && <Tabs />}

      <Routes>
        <Route path="/auth" element={<Auth />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Navigate to="/checkin" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/event-overview"
          element={
            <ProtectedRoute>
              <Eventcalendar />
            </ProtectedRoute>
          }
        />

        <Route path="/event/:eventId" element={<EventPage />} />
        <Route path="/cancel/:token" element={<CancelBooking />} />
        <Route path="/analytics" element={<CafeAnalytics />} />

        <Route path="/cvbuilder" element={<CVBuilder />} />

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

        <Route
          path="/logs"
          element={
            <ProtectedRoute>
              <Logs />
            </ProtectedRoute>
          }
        />

        <Route
          path="/insights"
          element={
            <ProtectedRoute>
              <Insights />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
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
