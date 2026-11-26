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

  const [messageFinished, setMessageFinished] = useState(false);

  const particles = React.useMemo(
    () =>
      Array.from({ length: 70 }, (_, i) => {
        const angle = (Math.PI * 2 * i) / 70 + (Math.random() - 0.5) * 0.4;

        const distance = 180 + Math.random() * 550;

        return {
          id: i,
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance,
          rotate: Math.random() * 1080 - 540,
          size: Math.random() * 9 + 3,
          duration: 0.8 + Math.random() * 1.1,
          delay: Math.random() * 0.18,
          color: [
            "#FFD700",
            "#FFFFFF",
            "#FF4444",
            "#00E676",
            "#FFA500",
            "#FFF2B2",
          ][Math.floor(Math.random() * 6)],
          shape: Math.random() > 0.5 ? "50%" : "2px",
        };
      }),
    []
  );

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
      const data = await response.json();

      console.log("STATUS:", response.status);
      console.log("DATA:", data);

      if (!response.ok) {
        throw new Error(data.error || "Request failed");
      }

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

          <button onClick={lottning} style={{ display: "none" }}>
            meister
          </button>

          {step === "session" && !messageFinished && (
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

              <motion.div
                animate={
                  messageFinished
                    ? {
                        scale: [1, 1.04, 0.95, 1.2, 0],
                        rotate: [0, -2, 2, -5, 12],
                        opacity: [1, 1, 1, 0.8, 0],
                        filter: [
                          "blur(0px)",
                          "blur(0px)",
                          "blur(1px)",
                          "blur(5px)",
                          "blur(15px)",
                        ],
                      }
                    : {}
                }
                transition={{
                  duration: 0.85,
                  times: [0, 0.15, 0.3, 0.55, 1],
                  ease: "easeInOut",
                }}
              >
                <Typewriter
                  key={result?.participantName}
                  options={{
                    delay: 45,
                    cursor: "|",
                    loop: false,
                  }}
                  onInit={(typewriter) => {
                    console.log("INIT: " + result);
                    if (!result) return;

                    typewriter
                      .typeString(`Hej ${result.participantName}!`)
                      .pauseFor(700)
                      .typeString(
                        `<br/><br/>Du ska köpa julklapp till...<br/><br/>`
                      )
                      .pauseFor(700)
                      .typeString(`<p>${result.receiverName}</p>`)
                      .typeString("<br/><br/>Budget: 400 kr")
                      .typeString(
                        "<br/><br/>Detta meddelande kommer självförstöras om"
                      )
                      .typeString("<br/><br/>3")
                      .pauseFor(200)
                      .typeString("2")
                      .pauseFor(200)
                      .typeString("<br/><br/>1")
                      .pauseFor(200)
                      .callFunction(() => {
                        setMessageFinished(true);
                      })
                      .start();
                  }}
                />
              </motion.div>
            </div>
          )}

          <AnimatePresence>
            {messageFinished && (
              <motion.div
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  position: "fixed",
                  inset: 0,
                  zIndex: 99999,
                  pointerEvents: "none",
                  overflow: "hidden",
                }}
              >
                {/* Central ljusblixt */}
                <motion.div
                  initial={{
                    scale: 0,
                    opacity: 1,
                  }}
                  animate={{
                    scale: [0, 3, 5],
                    opacity: [1, 0.8, 0],
                  }}
                  transition={{
                    duration: 0.65,
                    ease: "easeOut",
                  }}
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    width: 100,
                    height: 100,
                    borderRadius: "50%",
                    background:
                      "radial-gradient(circle, white 0%, #FFD700 20%, rgba(255,215,0,0) 70%)",
                    transform: "translate(-50%, -50%)",
                  }}
                />

                {/* Partiklar */}
                {particles.map((p) => (
                  <motion.div
                    key={p.id}
                    initial={{
                      x: 0,
                      y: 0,
                      scale: 0,
                      opacity: 1,
                      rotate: 0,
                    }}
                    animate={{
                      x: p.x,
                      y: p.y,
                      scale: [0, 1.4, 0.7, 0],
                      opacity: [0, 1, 1, 0],
                      rotate: p.rotate,
                    }}
                    transition={{
                      duration: p.duration,
                      delay: p.delay,
                      ease: [0.12, 0.8, 0.25, 1],
                    }}
                    style={{
                      position: "absolute",
                      left: "50%",
                      top: "50%",
                      width: p.size,
                      height: p.size,
                      borderRadius: p.shape,
                      background: p.color,
                      boxShadow: `0 0 15px ${p.color}, 0 0 30px ${p.color}`,
                    }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
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
