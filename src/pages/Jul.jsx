import { motion, AnimatePresence } from "framer-motion";
import Typewriter from "typewriter-effect";
import React, { useState } from "react";

export default function Home() {
  const [step, setStep] = useState("home");

  const initiateSession = function () {
    setStep("session");
  };

  return (
    <div style={styles.page}>
      <AnimatePresence mode="wait">
        <motion.div
          style={styles.cardContainer}
          initial={false}
          animate={{
            width: step === "session" ? "90vw" : "100%",
            height: step === "session" ? "85vh" : "240px",
            maxWidth: step === "session" ? "1200px" : "360px",
          }}
          transition={{
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {step === "home" && (
            <div style={styles.cardStyle}>
              <h5 style={{ fontSize: "1.2rem" }}>Skriv in kod</h5>
              <input style={styles.input} placeholder="kod"></input>
              <button style={styles.submitbutton} onClick={initiateSession}>
                submit
              </button>
            </div>
          )}

          {step === "session" && (
            <div style={styles.sessionCardStyle}>
              <Typewriter
                options={{
                  delay: 45,
                  cursor: "|",
                  loop: false,
                }}
                onInit={(typewriter) => {
                  typewriter
                    .typeString("Hej NAMN<br></br")
                    .pauseFor(500)
                    .typeString("Du ska ge julklapp till : X <br></br")
                    .pauseFor(500)
                    .typeString("Budget är 400kr")
                    .start();
                }}
              />{" "}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(180deg,rgba(57,13,35,0.9) 0%,rgb(29,29,58) 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  cardContainer: {
    width: "100%",
    maxWidth: 360,
    height: 240,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    borderRadius: 20,
  },
  cardStyle: {
    background: "#1a1a22",
    borderRadius: 20,
    padding: 24,
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
    fontWeight: "bold",
    boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
  },
  sessionCardStyle: {
    background: "#1a1a22",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    height: "50%",
    boxSizing: "border-box",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    fontSize: 18,
    fontWeight: "bold",
    boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
  },
  submitbutton: {
    marginTop: 20,
    width: "100%",
    padding: 14,
    borderRadius: 12,
    border: "none",
    background: "#ddb52f",
    color: "#111",
    fontWeight: "bold",
    cursor: "pointer",
  },
  input: {
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #444",
    background: "#111",
    color: "#fff",
    fontSize: "15px",
    outline: "none",
  },
};
