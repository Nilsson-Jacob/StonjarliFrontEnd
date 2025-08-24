import React, { /*useEffect,*/ useState } from "react";
//import axios from "axios";
import imgFinn from "../images/Finn20.png";
import imgFinnStill from "../images/testv2.png";

//const SERVER_URL = "https://stonjarliserver.onrender.com";

const Todays = () => {
  //const [opportunities, setOpportunities] = useState([]);
  //const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(true);

  //useEffect(() => {
  //fetchOpportunities();
  //}, []);

  /*const fetchOpportunities = async () => {
    try {
      //setLoading(true);
      const res = await axios.get(`${SERVER_URL}/opportunities`);
      //setOpportunities(res.data || []);
    } catch (err) {
      console.error("Failed to fetch opportunities:", err.message);
    }
  };*/

  return (
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "10px",
          gap: "40px",
          //marginTop: "-100px",
          position: "relative", // important since button uses absolute
        }}
      >
        {/* Always the same wrapper */}
        <div
          style={{
            position: "relative",
            display: "inline-block",
            //overflow: "hidden",
            width: "300px",
            height: "300px",
          }}
        >
          {active ? (
            <img src={imgFinnStill} alt="Trading Bot" width={"300px"} />
          ) : (
            <>
              <img src={imgFinn} alt="Trading Bot" width={"300px"} />
              <div
                style={{
                  position: "absolute",
                  top: "210px",
                  right: "0px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: "10px 20px",
                  border: "2px solid #ccc",
                  borderRadius: "8px",
                  backgroundColor: "#f9f9f9",
                  minWidth: "40px",
                  height: "70px",
                }}
              >
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "#555",
                    position: "absolute",
                    bottom: "5px",
                    right: "10px",
                  }}
                >
                  Start at ($100) - 2025-08-25
                </span>
                <h3 style={{ margin: 0 }}>${"TEST"}</h3>
              </div>
            </>
          )}
        </div>

        {/* Button stays put */}
        <button
          style={{
            padding: "10px 20px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            height: "50px",
          }}
          onClick={() => setActive(false)}
        >
          Reel in 💵
        </button>
      </div>
    </div>
  );
};

export default Todays;
