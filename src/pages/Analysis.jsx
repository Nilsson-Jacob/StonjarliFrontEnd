import React, { useState, useRef } from "react";

const serverApi = "https://stonjarliserver.onrender.com";

const Home = () => {
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const handleStart = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      /*const mimeType = MediaRecorder.isTypeSupported("audio/mp4")
        ? "audio/mp4"
        : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/ogg";*/

      //const mediaRecorder = new MediaRecorder(stream, { mimeType });

      const mediaRecorder = new MediaRecorder(stream); // 🔑 no mimeType

      /*const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/mp4",
      });*/

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

          console.log("Transcript:", data.text);
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
      <h3>maxHapp — Record your day 🎤</h3>

      <button onClick={recording ? handleStop : handleStart}>
        {recording ? "Stop Recording" : "Start Recording"}
      </button>
    </div>
  );
};

export default Home;
