import React from "react";
import { useNavigate } from "react-router-dom";

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", marginTop: "20vh" }}>
      <h1 style={{ fontSize: 40 }}>EliteResumeAI</h1>
      <button
        onClick={() => navigate("/auth")}
        style={{ marginTop: 20, padding: "12px 24px", fontSize: 18 }}
      >
        Start Your Journey
      </button>
    </div>
  );
}

export default LandingPage;