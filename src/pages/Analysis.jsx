import React, { useState, useEffect } from "react";

const Home = () => {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    // Check browser support
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.continuous = false; // stop automatically after speaking
      recog.interimResults = false;
      recog.lang = "en-US"; // change language if needed

      recog.onresult = (event) => {
        const spokenText = event.results[0][0].transcript;
        setTranscript(spokenText);
      };

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
    <div style={{ textAlign: "center", padding: "10px" }}>
      <h5>Hej</h5>
      <button onClick={handleMicClick}>
        {listening ? "Stop 🎙️" : "Start 🎙️"}
      </button>
      <div style={{ marginTop: "20px" }}>
        <strong>Transcript:</strong>
        <p>{transcript}</p>
      </div>
    </div>
  );
};

export default Home;
