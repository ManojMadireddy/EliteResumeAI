// client/src/components/MockInterviewAnalyzer.js
import React, { useRef, useState, useEffect } from "react";
import { Holistic } from "@mediapipe/holistic";
import { Camera } from "@mediapipe/camera_utils";
import "./PageBackground.css"; // ✅ Make sure this CSS file exists
import { supabase } from "../supabaseClient"; // Import Supabase client

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
  const [loadingAi, setLoadingAi] = useState(false); // New loading state for AI feedback
  const [userId, setUserId] = useState(null); // To store the current user's ID

  useEffect(() => {
    // Get the current authenticated user's ID from Supabase
    const getSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      } else {
        // This case should ideally be handled by RouteProtect, but good to have a fallback
        console.warn("User not authenticated in MockInterviewAnalyzer.");
      }
    };
    getSession();
    askNewQuestion(); // Ask initial question on component mount
  }, []);

  const askNewQuestion = () => {
    setTranscript("");
    setAiFeedback("");
    setPoseFeedback("Waiting..."); // Reset pose feedback for new question
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
    if (!SpeechRecognition) {
      // Using a custom modal/message box instead of alert()
      // You'll need to implement a modal component for this
      console.error("Speech recognition not supported in this browser.");
      return;
    }

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
        console.error("Mic error:", e.error);
        // Using a custom modal/message box instead of alert()
        // You'll need to implement a modal component for this
      };

      recognition.start();
    } else {
      recognitionRef.current?.stop();
      setIsListening(false);
    }
  };

  const getAIFeedback = async () => {
    setLoadingAi(true);
    setAiFeedback("");

    if (!userId) {
      setAiFeedback("Error: User not authenticated. Cannot get AI feedback.");
      setLoadingAi(false);
      return;
    }

    try {
      // --- IMPORTANT: This now calls a Vercel Serverless Function ---
      // You MUST create a serverless function (e.g., in api/ai-feedback.js)
      // that securely calls the OpenRouter API with your API key.
      const res = await fetch("/api/ai-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // You might send an authorization header if your serverless function requires it
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          question: question,
          answer: transcript || "No answer provided.",
          bodyLanguage: poseFeedback,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to get AI feedback from serverless function.");
      }

      const data = await res.json();
      const generatedFeedback = data.feedback || "No feedback.";
      setAiFeedback(generatedFeedback);

      // --- Save the interview session to Supabase ---
      const { error: dbError } = await supabase
        .from('mock_interview_sessions') // Ensure you have this table in Supabase
        .insert([
          {
            user_id: userId,
            question_asked: question,
            user_answer: transcript,
            body_language_feedback: poseFeedback,
            ai_feedback: generatedFeedback,
            session_date: new Date().toISOString(),
          },
        ]);

      if (dbError) {
        console.error("Error saving mock interview session to DB:", dbError.message);
        // You might want to show a message to the user that session saving failed
      }

    } catch (err) {
      console.error("Error getting AI feedback:", err);
      setAiFeedback("❌ Error getting AI feedback: " + err.message);
    } finally {
      setLoadingAi(false);
    }
  };

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
          <button onClick={getAIFeedback} disabled={loadingAi || !question || (!transcript && !poseFeedback)}>
            {loadingAi ? "Analyzing..." : "🚀 Get AI Feedback"}
          </button>
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
