import React, { useState, useRef } from "react";

const serverApi = "https://stonjarliserver.onrender.com";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function testLogin() {
  const { error } = await supabase.auth.signInWithOtp({
    email: "idrinkwater1015@gmail.com",
  });

  if (error) {
    console.error(error);
    alert("Error sending magic link");
  } else {
    alert("Magic link sent — check your email");
  }
}

const Home = () => {
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [answer, setAnswer] = useState("");

  const handleStart = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const mimeType = mediaRecorder.mimeType;
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });

        const extension = mimeType.includes("webm")
          ? "webm"
          : mimeType.includes("ogg")
          ? "ogg"
          : mimeType.includes("mp4")
          ? "mp4"
          : "audio";

        const formData = new FormData();

        formData.append("audio", audioBlob, `day-recording.${extension}`);

        try {
          const res = await fetch(serverApi + "/transcribe", {
            method: "POST",
            body: formData,
          });

          const data = await res.json();
          console.log("data " + JSON.stringify(data));
          setAnswer(data);
        } catch (err) {
          console.error("Upload failed", err);
        }
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone");
    }
  };

  const handleStop = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <button onClick={testLogin}>Test Email Login</button>

      <h3>maxHapp — Record your day 🎤</h3>
      <button onClick={recording ? handleStop : handleStart}>
        {recording ? "Stop Recording" : "Start Recording"}
      </button>
      {answer && (
        <div style={{ marginTop: 20, textAlign: "left" }}>
          <h4>Transcript</h4>
          <p>{answer.transcript}</p>

          <h4>Structured data</h4>
          <pre>{JSON.stringify(answer.structured, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default Home;
