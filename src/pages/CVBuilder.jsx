import { supabase } from "../components/CVsupabaseClient";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [text, setText] = useState("");
  const [step, setStep] = useState("home");

  console.log("text : " + text + step);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.from("cv").select("*");

      if (error) {
        console.error("Supabase error:", error);
        return;
      }

      setText(data);
      console.log("data:" + data);

      // Insert test data if needed
      const insert = false;

      if (insert) {
        const { data: dataCV, error: insertError } = await supabase
          .from("cv")
          .insert({
            cv_text_swedish: { test: "newCVdata" },
          })
          .select();

        if (insertError) {
          console.error("Insert error:", insertError);
        } else {
          console.log("cv text:", dataCV);
        }
      }
    };

    fetchUser();
  }, []);

  const initiateSession = function () {
    setStep("session");
  };

  return (
    <div style={styles.page}>
      <AnimatePresence mode="wait">
        <motion.div
          style={styles.cardContainer}
          key={step}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{
            opacity: 1,
            scale: 1,
            //width: step === "session" ? "95vw" : "100%",
            height: step === "session" ? "90vh" : "140px",
          }}
          // exit={{ opacity: 0, scale: 0.9 }}
          transition={{
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {step === "home" && (
            <div style={styles.cardStyle} onClick={initiateSession}>
              <h5 style={{ fontSize: "1.2rem" }}>Klicka för att skapa CV</h5>
            </div>
          )}
          {step === "session" && (
            <div style={styles.sessionCardStyle}>
              <h5 style={{ fontSize: "1.2rem" }}>Pågående Session</h5>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
// ===== STYLES =====
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
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  cardStyle: {
    background: "#1a1a22",
    borderRadius: 20,
    padding: 24,
    minHeight: 140,
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
    color: "#fff",
    display: "flex",
    width: "80vh",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
    fontWeight: "bold",
    boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
  },
};
