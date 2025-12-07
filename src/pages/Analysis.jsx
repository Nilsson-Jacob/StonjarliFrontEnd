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
