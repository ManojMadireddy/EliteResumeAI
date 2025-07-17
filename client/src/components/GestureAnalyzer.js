
import React, { useRef, useEffect } from "react";
import * as cam from "@mediapipe/camera_utils";
import { Pose } from "@mediapipe/pose";

function GestureAnalyzer() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const pose = new Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    pose.onResults((results) => {
      const canvasCtx = canvasRef.current.getContext("2d");
      canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      canvasCtx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);

      // Basic alerting on posture slouch
      const leftShoulder = results.poseLandmarks?.[11];
      const rightShoulder = results.poseLandmarks?.[12];

      if (leftShoulder && rightShoulder) {
        const shoulderTilt = Math.abs(leftShoulder.y - rightShoulder.y);
        if (shoulderTilt > 0.1) {
          canvasCtx.fillStyle = "red";
          canvasCtx.font = "20px Arial";
          canvasCtx.fillText("Posture Alert: Straighten up!", 10, 30);
        }
      }
    });

    const camera = new cam.Camera(videoRef.current, {
      onFrame: async () => {
        await pose.send({ image: videoRef.current });
      },
      width: 640,
      height: 480,
    });

    camera.start();
  }, []);

  return (
    <div>
      <video ref={videoRef} style={{ display: "none" }} />
      <canvas ref={canvasRef} width="640" height="480" style={{ border: "1px solid gray" }} />
    </div>
  );
}

export default GestureAnalyzer;