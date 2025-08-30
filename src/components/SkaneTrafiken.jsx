let apiKey = "821864d533cb4b68ad210d32c564b400";

import React, { useEffect, useState } from "react";

function Skanetrafiken({ stopId }) {
  const [delays, setDelays] = useState([]);

  useEffect(() => {
    async function fetchDelays() {
      try {
        const response = await fetch(
          `https://api.trafiklab.se/v2/realtime/departures?stop_area=${stopId}&apiKey=YOUR_API_KEY`
        );
        const data = await response.json();

        // Extract departures
        const delayedTrains = data.departures.filter((dep) => {
          if (!dep.estimatedTimeAtLocation || !dep.advertisedTimeAtLocation)
            return false;

          const scheduled = new Date(dep.advertisedTimeAtLocation);
          const estimated = new Date(dep.estimatedTimeAtLocation);
          const delayMinutes = (estimated - scheduled) / 60000;

          return delayMinutes > 20 && !dep.canceled;
        });

        setDelays(delayedTrains);
      } catch (error) {
        console.error("Failed to fetch train delays:", error);
      }
    }

    fetchDelays();
    const interval = setInterval(fetchDelays, 60000); // refresh every 60 seconds
    return () => clearInterval(interval);
  }, [stopId]);

  return (
    <div className="p-4">
      {delays.length > 0 ? (
        <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded">
          <strong>Delays Detected!</strong>
          <ul>
            {delays.map((train, idx) => (
              <li key={idx}>
                Train to {train.direction} is delayed by over 20 min.
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="bg-green-100 border border-green-400 text-green-700 p-3 rounded">
          No major delays detected.
        </div>
      )}
    </div>
  );
}

export default Skanetrafiken;
