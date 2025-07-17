import React, { useRef, useState, useEffect } from "react";
import { Holistic } from "@mediapipe/holistic";
import { Camera } from "@mediapipe/camera_utils";
import "./PageBackground.css"; // ✅ Make sure this CSS file exists
 // ✅ Import your page background styles

const QUESTIONS = [
  "Tell me about a project you're most proud of.",
  "How do you prioritize tasks in a tight deadline project?",
  "Describe a time when you faced a major challenge during a project. How did you overcome it?",
  "How do you manage your time across multiple projects?",
  "Have you ever had a project that failed? What did you learn from it?",
  "Explain your role in your most recent team project.",
  "How do you handle project changes mid-development?",
  "Describe how you resolved a conflict with a team member during a project.",
  "How do you make sure a project stays on schedule?",
  "How do you track project progress and ensure quality?",
  "What tools or methods do you use to manage your projects?",
  "Tell me about a project where you had to learn something new quickly.",
  "Describe a time you had to take the lead on a project unexpectedly.",
  "How do you stay organized when juggling multiple deadlines?",
  "What’s your strategy for delegating tasks during a team project?",
  "How do you deal with team members who are not contributing enough?",
  "Tell me about a time when your project idea was rejected.",
  "Describe how you collect and incorporate feedback in your work.",
  "What’s the biggest risk you’ve taken on a project?",
  "Have you ever worked on a project you didn’t believe in? How did you handle it?",
  "How do you ensure transparency and communication in your team?",
  "Describe a project that went better than expected. Why?",
  "How do you define success at the end of a project?",
  "Have you ever had to work outside your comfort zone?",
  "Tell me about a time you handled a last-minute change in a project.",
  "How do you prepare for project presentations or demos?",
  "How do you handle overlapping responsibilities in a team?",
  "Tell me about a project you worked on under pressure.",
  "How do you manage stakeholder expectations?",
  "How do you divide work fairly in team projects?",
  "Describe how you balance speed and quality in projects.",
  "What do you do when you hit a creative block?",
  "Tell me about a time you had to say no during a project.",
  "How do you stay motivated during long projects?",
  "What’s your personal method for planning a new project?",
  "Describe a time when you surprised your team with a solution.",
  "How do you make sure your work aligns with the team goal?",
  "Tell me how you adapt when priorities shift.",
  "How do you handle unclear requirements at the start of a project?",
  "How do you maintain work-life balance during demanding projects?",
  "What’s one mistake you made in a project, and what did you learn?",
  "Have you mentored anyone during a project? How did it go?",
  "How do you ensure accountability in your team?",
  "What motivates you to complete a tough project?",
  "How do you handle burnout or stress while working on projects?",
  "What do you do if you're stuck and no one is available to help?",
  "Describe a project you collaborated on across departments or teams.",
  "Tell me about a project where communication was a challenge.",
  "What is your approach to managing documentation in a project?",
  "How do you track and reflect on your project performance after completion?"
];
function MockInterviewAnalyzer() {
  const videoRef = useRef(null);
  const recognitionRef = useRef(null);
  const cameraRef = useRef(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const [question, setQuestion] = useState("");
  const [transcript, setTranscript] = useState("");
  const [poseFeedback, setPoseFeedback] = useState("Waiting...");
  const [aiFeedback, setAiFeedback] = useState("");

  const askNewQuestion = () => {
    setTranscript("");
    setAiFeedback("");
    const randomQ = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
    setQuestion(randomQ);
  };

  const toggleCamera = () => {
    if (isCameraOn && cameraRef.current) {
      cameraRef.current.stop();
      setIsCameraOn(false);
    } else {
      const holistic = new Holistic({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`,
      });

      holistic.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        refineFaceLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      holistic.onResults((results) => {
        const fb = analyzeHolistic(results);
        setPoseFeedback(fb);
      });

      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          await holistic.send({ image: videoRef.current });
        },
        width: 640,
        height: 480,
      });

      camera.start();
      cameraRef.current = camera;
      setIsCameraOn(true);
    }
  };

  const analyzeHolistic = (landmarks) => {
    let feedback = [];
    const pose = landmarks.poseLandmarks;
    const face = landmarks.faceLandmarks;
    const hands = landmarks.rightHandLandmarks || landmarks.leftHandLandmarks;

    if (pose?.length > 12) {
      const ls = pose[11], rs = pose[12];
      const tilt = Math.abs(ls.y - rs.y);
      feedback.push(tilt > 0.05 ? "⚠️ Posture tilt detected." : "✅ Shoulders look aligned.");
    }

    if (face?.length > 1) {
      const nose = face[1];
      if (nose.x < 0.4) feedback.push("👀 You're looking left.");
      else if (nose.x > 0.6) feedback.push("👀 You're looking right.");
      else feedback.push("✅ Good eye contact maintained.");
    }

    if (hands?.length > 0) {
      feedback.push("🙌 Hands detected. Try using open gestures.");
    } else {
      feedback.push("✋ No hand movement detected.");
    }

    return feedback.join(" ");
  };

  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Speech recognition not supported.");

    if (!isListening) {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.continuous = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);

      recognition.onresult = (e) => {
        const result = e.results[0][0].transcript;
        setTranscript(result);
      };

      recognition.onerror = (e) => {
        alert("Mic error: " + e.error);
      };

      recognition.start();
    } else {
      recognitionRef.current?.stop();
      setIsListening(false);
    }
  };

  const getAIFeedback = async () => {
    const prompt = `
### Content Analysis
- Review: "${transcript}"
- Relevant to: "${question}"

### Body Language Feedback
- Summary: "${poseFeedback}"

### Tips for Improvement
- Improve content and non-verbal delivery

### Final Note
- Encourage improvement with next steps
    `;

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer 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`, // Replace with your key
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tencent/hunyuan-a13b-instruct:free",
        messages: [
          { role: "system", content: "You are an expert interview coach." },
          { role: "user", content: prompt },
        ],
      }),
    });

    const data = await res.json();
    setAiFeedback(data.choices?.[0]?.message?.content || "No feedback.");
  };

  useEffect(() => {
    askNewQuestion();
  }, []);

  return (
    <div className="page-wrapper bg-mockinterview">
      <div className="inner-container">
        <h2 style={{ textAlign: "center", marginBottom: 20 }}>🎤 Mock Interview AI Analyzer</h2>

        <video
          ref={videoRef}
          autoPlay
          width="640"
          height="480"
          style={{
            borderRadius: 10,
            border: "2px solid #ccc",
            marginBottom: 20,
            display: isCameraOn ? "block" : "none"
          }}
        />

        <div style={{ marginBottom: 20 }}>
          <h3>🗨️ Interview Question:</h3>
          <p style={{ fontSize: 18 }}>{question}</p>
          <button onClick={askNewQuestion} style={{ marginRight: 10 }}>🔁 New Question</button>
        </div>

        <div style={{ marginBottom: 20 }}>
          <button onClick={toggleCamera} style={{ marginRight: 10 }}>
            {isCameraOn ? "📷 Stop Camera" : "📸 Start Camera"}
          </button>
          <button onClick={toggleListening} style={{ marginRight: 10 }}>
            {isListening ? "🛑 Stop Voice Answer" : "🎙 Start Voice Answer"}
          </button>
          <button onClick={getAIFeedback}>🚀 Get AI Feedback</button>
        </div>

        <div style={{ background: "#222", padding: 15, borderRadius: 8, marginBottom: 20 }}>
          <h4>📝 Your Answer:</h4>
          <p>{transcript || "No response yet."}</p>

          <h4>🕺 Body Language:</h4>
          <p>{poseFeedback}</p>
        </div>

        {aiFeedback && (
          <div style={{ background: "#1a1a1a", padding: 20, borderRadius: 10, whiteSpace: "pre-wrap" }}>
            <h4>🧠 AI Feedback:</h4>
            <p>{aiFeedback}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MockInterviewAnalyzer;