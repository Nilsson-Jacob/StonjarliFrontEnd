import { supabase } from "../components/CVsupabaseClient";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Typewriter from "typewriter-effect";
//import { useRef } from "react";
const cvQuestions = ["Tell me about your education"];

const statusText = {
  waiting: "Väntar på input...",
  recording: "Noterar input...",
  processing: "Väntar på...",
  thinking: "AI tänker...",
};

export default function Home() {
  const [text, setText] = useState("");
  const [step, setStep] = useState("home");

  const [inputStatus, setInputStatus] = useState("waiting");
  const [recording, setRecording] = useState(false);

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const audioChunksRef = useRef([]);

  console.log("text : " + text + step + recording);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setInputStatus("processing");

        try {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: mediaRecorder.mimeType,
          });

          if (audioBlob.size < 5000) {
            console.log("Recording too short");
            return;
          }

          // Här återanvänder du din befintliga
          // FormData och fetch till Supabase Edge Function.
        } catch (err) {
          console.error("Transcription error:", err);
        } finally {
          streamRef.current?.getTracks().forEach((track) => track.stop());
          audioChunksRef.current = [];
        }
      };

      mediaRecorder.start(1000);
      setRecording(true);
      setInputStatus("waiting");
    } catch (err) {
      console.error("Could not start recording:", err);
    }
  };

  //const typewriterRef = useRef(null);

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
    startRecording();
  };

  return (
    <div style={styles.page}>
      <AnimatePresence mode="wait">
        <motion.div
          style={styles.cardContainer}
          initial={false}
          animate={{
            width: step === "session" ? "90vw" : "100%",
            height: step === "session" ? "85vh" : "140px",
            maxWidth: step === "session" ? "1200px" : "360px",
          }}
          transition={{
            duration: 0.8,
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
              <Typewriter
                options={{
                  delay: 45,
                  cursor: "|",
                  loop: false,
                }}
                onInit={(typewriter) => {
                  typewriter
                    .typeString("Pågående Session")
                    .pauseFor(500)
                    .typeString(cvQuestions[0])
                    .start();
                }}
              />{" "}
              <div style={styles.inputStatus}>
                <span
                  style={{
                    ...styles.statusDot,
                    background:
                      inputStatus === "recording"
                        ? "#4ade80"
                        : inputStatus === "processing"
                        ? "#facc15"
                        : "#999",
                  }}
                />

                {statusText[inputStatus]}
              </div>
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
    height: 140,
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
    height: "100%",
    boxSizing: "border-box",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    fontSize: 18,
    fontWeight: "bold",
    boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
  },
  inputStatus: {
    marginTop: 30,
    alignSelf: "flex-end",
    display: "flex",
    alignItems: "center",
    gap: 10,
    color: "#aaa",
    fontSize: 14,
    fontWeight: "normal",
  },

  statusDot: {
    width: 9,
    height: 9,
    borderRadius: "50%",
  },
};
