
import React, { useState } from "react";

function MockInterview() {
  const [recording, setRecording] = useState(false);
  const [status, setStatus] = useState("Idle");

  const handleStart = async () => {
    setRecording(true);
    setStatus("Recording started...");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      const video = document.getElementById("mockVideo");
      video.srcObject = stream;
      video.play();
    } catch (err) {
      console.error("Permission denied or device error:", err);
      setStatus("Error accessing webcam/microphone.");
    }
  };

  const handleStop = () => {
    const video = document.getElementById("mockVideo");
    const stream = video.srcObject;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      video.srcObject = null;
    }
    setRecording(false);
    setStatus("Recording stopped.");
  };

  return (
    <div>
      <h2>Mock Interview AI</h2>
      <p>Status: {status}</p>
      <video id="mockVideo" width="500" height="350" autoPlay muted></video>
      <div style={{ marginTop: 10 }}>
        {!recording ? (
          <button onClick={handleStart}>Start Interview</button>
        ) : (
          <button onClick={handleStop}>Stop Interview</button>
        )}
      </div>
    </div>
  );
}

export default MockInterview;

