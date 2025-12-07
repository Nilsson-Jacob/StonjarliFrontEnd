import React, { useState, useEffect, useRef } from "react";
import { WhisperTranscriber } from "whisper-web-transcriber";

const Home = () => {
  const [loadingModel, setLoadingModel] = useState(true);
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const transcriberRef = useRef(null);

  useEffect(() => {
    async function init() {
      const transcriber = new WhisperTranscriber({
        modelSize: "tiny-en-q5_1", // light & faster model
        onTranscription: (text) => {
          console.log("Transcribed:", text);
          setTranscript((prev) => (prev + " " + text).trim());
        },
        debug: true,
      });
      await transcriber.loadModel();
      transcriberRef.current = transcriber;
      setLoadingModel(false);
    }
    init();
  }, []);

  const handleStart = async () => {
    if (!transcriberRef.current) return;
    await transcriberRef.current.startRecording();
    setRecording(true);
  };

  const handleStop = () => {
    if (!transcriberRef.current) return;
    transcriberRef.current.stopRecording();
    setRecording(false);
  };

  return (
    <div style={{ textAlign: "center", padding: "10px" }}>
      <h5>Hej</h5>

      {loadingModel ? (
        <p>Loading speech model ... please wait</p>
      ) : (
        <button onClick={recording ? handleStop : handleStart}>
          {recording ? "Stop 🎙️" : "Speak 🎤"}
        </button>
      )}

      <div style={{ marginTop: "20px" }}>
        <strong>Transcript:</strong>
        <p>{transcript}</p>
      </div>
    </div>
  );
};

export default Home;

/*import React, { useState, useEffect } from "react";

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
*/
