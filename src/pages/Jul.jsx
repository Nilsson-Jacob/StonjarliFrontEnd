import { motion, AnimatePresence } from "framer-motion";
import Typewriter from "typewriter-effect";
import React, { useState } from "react";
//import { supabase } from "../components/supabaseClient";

export default function Home() {
  const [step, setStep] = useState("home");

  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /*
  const initiateSession = function () {
    setStep("session");
  };*/

  const lottning = async function name(params) {
    const response = await fetch(
      "https://agbtomavehebxbmzzziy.supabase.co/functions/v1/dynamic-service",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": "12345",
          apikey: process.env.REACT_APP_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
        },
        body: JSON.stringify({
          action: "generate",
        }),
      }
    );

    const result = await response.json();
    console.log(result);
  };

  const checkCode = async () => {
    setError("");
    setLoading(true);

    //              Authorization: `Bearer ${currentSession.access_token}`,
    //78818c3a343f086d7a7554464068bb6aae54f5435484515275f723d9b8c6c893

    try {
      const { data } = await fetch(
        "https://agbtomavehebxbmzzziy.supabase.co/functions/v1/dynamic-service",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-admin-secret": "12345",
            apikey: process.env.REACT_APP_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
          },
          body: JSON.stringify({
            action: "lookup",
            code: code,
          }),
        }
      );
      /*

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }*/

      setResult(data);
      setStep("session");
    } catch (err) {
      console.error(err);
      setError("Koden är ogiltig. Försök igen.");
    } finally {
      setLoading(false);
    }
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
              <input
                style={styles.input}
                placeholder="Ange kod"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
              />{" "}
              <button
                style={styles.submitbutton}
                onClick={checkCode}
                disabled={loading || !code.trim()}
              >
                {loading ? "Kontrollerar..." : "OK"}
              </button>
              {error && (
                <p style={{ color: "#ff7777", fontSize: 14 }}>{error}</p>
              )}
            </div>
          )}

          <button onClick={lottning}>meister</button>

          {step === "session" && (
            <div style={styles.sessionCardStyle}>
              {/*<Typewriter
                options={{
                  delay: 45,
                  cursor: "|",
                  loop: false,new
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
              />{" "}  new */}
              <Typewriter
                key={result?.participantName}
                options={{
                  delay: 45,
                  cursor: "|",
                  loop: false,
                }}
                onInit={(typewriter) => {
                  if (!result) return;

                  typewriter
                    .typeString(`Hej ${result.participantName}!`)
                    .pauseFor(700)
                    .typeString(
                      `<br/><br/>Du ska köpa julklapp till: ${result.receiverName}`
                    )
                    .pauseFor(700)
                    .typeString("<br/><br/>Budget: 400 kr")
                    .start();
                }}
              />
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
      "linear-gradient(180deg,rgba(106, 19, 19, 0.9) 0%,rgb(33, 76, 35) 100%)",
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
