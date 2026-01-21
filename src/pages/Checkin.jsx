import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "../components/supabaseClient";

const serverApi = "https://stonjarliserver.onrender.com";

export default function Home() {
  const [step, setStep] = useState("home");
  const [targets, setTargets] = useState([]);
  const [currentTargetIndex, setCurrentTargetIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  // home | training | protein | sleep

  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  //const [protein, setProtein] = useState(null); // less | equal | above
  //const [sleep, setSleep] = useState(null); // less | equal | above
  const [answer, setAnswer] = useState(null);

  // ===== Auto-start recording when entering training =====
  useEffect(() => {
    if (step === "training" && !recording) {
      const startRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: mediaRecorder.mimeType,
          });

          const formData = new FormData();
          formData.append("audio", audioBlob, "training.webm");

          const res = await fetch(serverApi + "/transcribe", {
            method: "POST",
            body: formData,
          });

          const data = await res.json();
          setAnswer(data);
          console.log(answer);
          setStep("home");
        };

        mediaRecorder.start();
        setRecording(true);
      };

      startRecording();
    }
  }, [step, recording]);

  // ===== Load targets from DB =====
  useEffect(() => {
    const fetchTargets = async () => {
      const { data, error } = await supabase.from("targets").select("*");
      if (error) {
        console.error(error);
      } else {
        console.log("logdata: " + data);

        setTargets(data);
      }
    };
    fetchTargets();
  }, []);

  const today = new Date().toLocaleDateString();

  // ===== Recording Logic =====
  /* const handleStart = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, {
        type: mediaRecorder.mimeType,
      });

      const formData = new FormData();
      formData.append("audio", audioBlob, "training.webm");

      const res = await fetch(serverApi + "/transcribe", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setAnswer(data);
      console.log(answer);
      setStep("home");
    };

    mediaRecorder.start();
    setRecording(true);
  };*/

  const handleStop = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
    setStep("home");
  };

  const saveDailyCheckin = async () => {
    const todayKey = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    console.log("Answers: " + JSON.stringify(answers));

    const payload = {
      date: todayKey,
      /* targets: [
        {
          protein: protein,
        },
        { sleep: sleep },
      ],*/
    };

    try {
      const res = await fetch(serverApi + "/targets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("Daily entry saved:", data);
    } catch (err) {
      console.error("Failed saving daily checkin:", err);
    }
  };

  const handleTargetAnswer = (value) => {
    const currentTarget = targets[currentTargetIndex];

    setAnswers((prev) => [...prev, { target_id: currentTarget.id, value }]);

    if (currentTargetIndex < targets.length - 1) {
      setCurrentTargetIndex((i) => i + 1);
    } else {
      saveDailyCheckin();
      setStep("home");
    }
  };

  // ===== UI Components =====
  const Card = ({ children, onClick }) => (
    <div onClick={onClick} style={cardStyle}>
      {children}
    </div>
  );

  /*
  const ChoiceCard = ({ title, value, setValue, onNext, onSubmit }) => (
    <div style={cardStyle}>
      <h3>{title}</h3>
      <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
        {["less", "equal", "above"].map((opt) => (
          <button
            key={opt}
            onClick={() => {
              setValue(opt);
              if (onSubmit) {
                saveDailyCheckin();
              }
              onNext();
            }}
            style={{
              ...choiceButton,
              background: value === opt ? "#ddb52f" : "#1a1a22",
              color: value === opt ? "#4e0329" : "#fff",
            }}
          >
            {opt.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );*/
  const ChoiceCard = ({ target }) => (
    <div style={cardStyle}>
      <h3>
        {target.icon} {target.name}
      </h3>
      <h4>
        Target: {target.target_value} {target.unit}
      </h4>
      <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
        {["less", "equal", "above"].map((opt) => (
          <button
            key={opt}
            onClick={() => handleTargetAnswer(opt)}
            style={{
              ...choiceButton,
              background: "#1a1a22",
              color: "#fff",
            }}
          >
            {opt.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );

  // ===== Render Logic =====
  return (
    <div style={styles.page}>
      {step === "home" && (
        <div style={cardContainer}>
          <Card onClick={() => setStep("training")}>🎤 Checkin Training</Card>

          <Card onClick={() => setStep("targets")}>📅 Checkin : {today}</Card>
        </div>
      )}

      {step === "training" && (
        <div style={cardContainer}>
          <div style={cardStyle}>
            <motion.div
              animate={
                recording
                  ? {
                      scale: [1, 1.4, 1],
                      rotate: [0, 180, 360],
                      borderRadius: ["20%", "50%", "20%"],
                    }
                  : {}
              }
              transition={{ duration: 1.5, repeat: Infinity }}
              style={orbStyle}
            />
            {recording && (
              <button onClick={handleStop} style={mainButton}>
                Finish
              </button>
            )}
          </div>
        </div>
      )}

      {step === "targets" && targets[currentTargetIndex] && (
        <div style={cardContainer}>
          <ChoiceCard target={targets[currentTargetIndex]} />
        </div>
      )}

      {/*  
      {step === "protein" && (
        <div style={cardContainer}>
          <ChoiceCard
            title="Protein intake goal?"
            value={protein}
            setValue={setProtein}
            onNext={() => setStep("sleep")}
          />
        </div>
      )}

      {step === "sleep" && (
        <div style={cardContainer}>
          <ChoiceCard
            title="Sleep goal?"
            value={sleep}
            setValue={setSleep}
            onNext={() => setStep("home")}
            onSubmit={true}
          />
        </div>
      )}
        */}
    </div>
  );
}

// ===== Styles =====

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #4e0329 0%, #0f0f14 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
};

const cardContainer = {
  width: "100%",
  maxWidth: 360,
  display: "flex",
  flexDirection: "column",
  gap: 20,
};

const cardStyle = {
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
};

const orbStyle = {
  width: 120,
  height: 120,
  borderRadius: "50%",
  background: "linear-gradient(180deg, #ddb52f 0%, #4e0329 100%)",
  marginBottom: 20,
};

const mainButton = {
  border: "none",
  borderRadius: 12,
  padding: "12px 20px",
  background: "#ddb52f",
  color: "#4e0329",
  fontWeight: "bold",
  fontSize: 16,
};

const choiceButton = {
  flex: 1,
  padding: "10px",
  border: "none",
  borderRadius: 10,
  fontWeight: "bold",
};
