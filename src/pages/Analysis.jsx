/*import React, { useState, useRef } from "react";

const serverApi = "https://stonjarliserver.onrender.com";

const Home = () => {
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
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
/*   const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const mimeType = mediaRecorder.mimeType;
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        //const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        //const formData = new FormData();
        //formData.append("audio", audioBlob, "day-recording.webm");

        const formData = new FormData();
        formData.append("audio", audioBlob, "day-recording.webm");

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

      {audioURL && (
        <div style={{ marginTop: 20 }}>
          <strong>Playback:</strong>
          <audio controls src={audioURL}></audio>
        </div>
      )}
    </div>
  );
};

export default Home;

*/

import React, { useState, useEffect } from "react";

const Home = () => {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    // Detect browser support
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.continuous = false; // stops automatically after user stops talking
      recog.interimResults = false; // we only want final transcript
      recog.lang = "sv-SE"; // Swedish (change if needed)

      // Event: user finished speaking
      recog.onresult = (event) => {
        const spokenText = event.results[0][0].transcript;
        setTranscript(spokenText);
      };

      // Event: recognition ended
      recog.onend = () => {
        setListening(false);
      };

      setRecognition(recog);
    } else {
      alert("Sorry, your browser does not support the Web Speech API.");
    }
  }, []);

  const handleMicClick = () => {
    if (!recognition) return;
    if (!listening) {
      recognition.start();
      setListening(true);
    } else {
      recognition.stop();
      setListening(false);
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h3>maxHapp — Record your day 🎤</h3>

      <button onClick={handleMicClick}>
        {listening ? "Stop 🎙️" : "Start 🎙️"}
      </button>

      <div style={{ marginTop: 20 }}>
        <strong>Transcript:</strong>
        <p>{transcript}</p>
      </div>
    </div>
  );
};

export default Home;
