import { supabase } from "../components/CVsupabaseClient";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Typewriter from "typewriter-effect";
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

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

  const silenceTimerRef = useRef(null);
  const hasStartedSpeakingRef = useRef(false);

  console.log("text : " + text + step + recording);

  const detectSpeech = useCallback(() => {
    const analyser = analyserRef.current;

    if (!analyser) return;

    const buffer = new Uint8Array(analyser.fftSize);

    analyser.getByteTimeDomainData(buffer);

    // Beräkna ljudnivån (RMS)
    let sum = 0;

    for (let i = 0; i < buffer.length; i++) {
      const normalized = (buffer[i] - 128) / 128;
      sum += normalized * normalized;
    }

    const volume = Math.sqrt(sum / buffer.length);

    // Justera denna gräns om mikrofonen är känslig
    const threshold = 0.025;

    if (volume > threshold) {
      // Användaren har börjat prata
      if (!hasStartedSpeakingRef.current) {
        hasStartedSpeakingRef.current = true;
        setInputStatus("recording");
        console.log("Speech started");
      }

      // Nollställ tystnadstimern när ljud upptäcks
      clearTimeout(silenceTimerRef.current);
    } else if (hasStartedSpeakingRef.current) {
      console.log("L67");

      // Användaren har tidigare pratat men är nu tyst
      if (!silenceTimerRef.current) {
        console.log("L72");

        silenceTimerRef.current = setTimeout(() => {
          console.log("Speech ended");
          stopRecording();
        }, 1500);
      }
    }

    animationFrameRef.current = requestAnimationFrame(detectSpeech);
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      streamRef.current = stream;

      // Skapa AudioContext
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      // Koppla mikrofonen till ljudanalysatorn
      const source = audioContext.createMediaStreamSource(stream);

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;

      source.connect(analyser);

      analyserRef.current = analyser;

      // Skapa MediaRecorder
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      hasStartedSpeakingRef.current = false;

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

          console.log("Audio size:", audioBlob.size);

          if (audioBlob.size < 5000) {
            console.error("Recording too short");
            return;
          }

          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (!session?.access_token) {
            throw new Error("User not logged in");
          }

          const formData = new FormData();

          formData.append("audio", audioBlob, "training.webm");

          const res = await fetch(
            "https://ujecnfyfsuyjmzrjilba.supabase.co/functions/v1/hyper-action",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${session.access_token}`,
              },
              body: formData,
            }
          );

          if (!res.ok) {
            throw new Error("Transcription request failed");
          }

          const data = await res.json();

          console.log("Transcription:", data);

          setInputStatus("thinking");
        } catch (err) {
          console.error("Transcription error:", err);
          setInputStatus("waiting");
        } finally {
          cleanupRecording();
        }
      };

      mediaRecorder.start(1000);

      setRecording(true);
      setInputStatus("waiting");

      // Starta ljuddetektionen
      detectSpeech();
    } catch (err) {
      console.error("Recording error:", err);
    }
  }, [detectSpeech]);

  useEffect(() => {
    if (step === "session") {
      startRecording();
    }

    return () => {
      cleanupRecording();
    };
  }, [step, startRecording]);

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

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      cancelAnimationFrame(animationFrameRef.current);

      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;

      mediaRecorderRef.current.stop();

      setRecording(false);
      setInputStatus("processing");
    }
  };

  const cleanupRecording = () => {
    cancelAnimationFrame(animationFrameRef.current);

    clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = null;

    streamRef.current?.getTracks().forEach((track) => {
      track.stop();
    });

    streamRef.current = null;

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;
    mediaRecorderRef.current = null;

    setRecording(false);
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
                    .typeString("Välkommen, prata vilket språk du vill")
                    .pauseFor(500)
                    .typeString("<br></br" + cvQuestions[0])
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
                        : inputStatus === "thinking"
                        ? "#a78bfa"
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
