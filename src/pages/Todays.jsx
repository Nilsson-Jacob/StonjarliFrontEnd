import React, { /*useEffect,*/ useEffect, useState } from "react";
//import axios from "axios";
import imgFinn from "../images/Finn20.png";
import imgFinnStill from "../images/testv2.png";
import axios from "axios";

//const SERVER_URL = "https://stonjarliserver.onrender.com";

const Todays = () => {
  //const [opportunities, setOpportunities] = useState([]);
  //const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(true);
  const [daily, setDaily] = useState({});

  async function fetchDaily() {
    const serverApi = "https://stonjarliserver.onrender.com";
    try {
      const response = await axios.get(serverApi + "/daily");

      setDaily(response.data || []);
    } catch (e) {
      console.error("Error fetching positions:", e.message);
      setDaily(e);
    }
  }

  useEffect(() => {
    fetchDaily();
  }, []);

  async function handleActive() {
    await fetchDaily();
    setActive(false);
  }

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
            //width: "300px",
            //height: "300px",
            width: "100%",
            height: "230px" /* fixed height or use aspect-ratio */,
            overflow: "hidden",
          }}
        >
          {active ? (
            <img
              src={imgFinnStill}
              alt="Trading Bot"
              width={"300px"}
              style={{
                height: "100%",
                objectFit: "cover" /* crop instead of stretch */,
                objectPosition: "center",
              }}
            />
          ) : (
            <>
              <img
                src={imgFinn}
                alt="Trading Bot"
                width={"300px"}
                style={{
                  height: "100%",
                  objectFit: "cover" /* crop instead of stretch */,
                  objectPosition: "center",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "110px",
                  left: "59%",
                  width: "100px",
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
                ></span>
                <h3 style={{ margin: 0 }}>{JSON.stringify(daily)}</h3>
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
          onClick={() => handleActive()}
        >
          Reel in 💵
        </button>
      </div>
    </div>
  );
};

export default Todays;
