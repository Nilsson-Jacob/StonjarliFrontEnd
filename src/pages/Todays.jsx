import React, { useEffect, useState } from "react";
import EarningsGrid from "../components/EarningsGrid";
import axios from "axios";

const SERVER_URL = "https://stonjarliserver.onrender.com";

const Todays = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [triggerMsg, setTriggerMsg] = useState("");

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${SERVER_URL}/opportunities`);
      setOpportunities(res.data || []);
    } catch (err) {
      console.error("Failed to fetch opportunities:", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h1>🎣 PEAD Opportunities</h1>

      {loading ? (
        <p>Loading opportunities...</p>
      ) : (
        <EarningsGrid earnings={opportunities} />
      )}
    </div>
  );
};

export default Todays;
