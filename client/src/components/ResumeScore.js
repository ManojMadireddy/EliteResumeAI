// client/src/components/ResumeScore.js
import React, { useState, useEffect } from "react";
// No need for axios anymore if all API calls are handled by Supabase
// import axios from "axios";
import "./PageBackground.css"; // make sure this includes your .glass-container etc.
import { supabase } from "../supabaseClient"; // Import your Supabase client

function ResumeScore() {
  const [file, setFile] = useState(null);
  const [role, setRole] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false); // New loading state
  const [userId, setUserId] = useState(null); // To store the current user's ID

  useEffect(() => {
    // Get the current authenticated user's ID from Supabase
    const getSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      } else {
        console.warn("User not authenticated in ResumeScore.");
      }
    };
    getSession();
  }, []);

  const handleUpload = async () => {
    setMsg("");
    setLoading(true);

    if (!file || !role) {
      setMsg("❌ Please choose a PDF and a role first.");
      setLoading(false);
      return;
    }

    if (!userId) {
      setMsg("Error: User not authenticated. Cannot process resume.");
      setLoading(false);
      return;
    }

    const data = new FormData();
    data.append("resume", file);
    data.append("role", role);
    // You might also append userId if your serverless function needs it for logging/auth
    // data.append("userId", userId);

    try {
      // --- IMPORTANT: This now calls a Vercel Serverless Function ---
      // You MUST create a serverless function (e.g., in api/resume-score.js)
      // that handles PDF parsing and AI scoring.
      const res = await fetch("/api/resume-score", {
        method: "POST",
        body: data, // FormData is used directly here
        // No 'Content-Type' header needed for FormData; browser sets it automatically
        // You might send an authorization header if your serverless function requires it
        // headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to get resume score from serverless function.");
      }

      const result = await res.json();
      const score = result.score;
      const reason = result.reason;

      const txt = `✅ Match for "${role}": ${score}%\n📝 Reason: ${reason}`;
      setMsg(txt);

      // --- Save resume score data to Supabase ---
      const { error: dbError } = await supabase
        .from('user_resume_scores') // Ensure you have this table in Supabase
        .insert([
          {
            user_id: userId,
            resume_filename: file.name,
            selected_role: role,
            score: score,
            reason: reason,
            processed_at: new Date().toISOString(),
          },
        ]);

      if (dbError) {
        console.error("Error saving resume score to DB:", dbError.message);
        // You might want to show a message to the user that saving failed
      }

    } catch (err) {
      console.error("Resume Score Error:", err);
      const detail = err.message || "Unknown error";
      setMsg("❌ Upload failed:\n" + detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper bg-resumescore">
      <div className="glass-container">
        <h2>📄 Resume Upload + AI Score</h2>

        <select value={role} onChange={(e) => setRole(e.target.value)} style={{ marginBottom: 10 }}>
          <option value="">-- Select Role --</option>
          <option>Frontend Developer</option>
          <option>Software Engineer</option>
          <option>Data Scientist</option>
        </select>

        <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} style={{ marginBottom: 10 }} />

        <button onClick={handleUpload} disabled={loading || !file || !role}>
          {loading ? "Analyzing..." : "🚀 Upload & Get AI Score"}
        </button>

        {msg && (
          <div
            style={{
              backgroundColor: "#ffffffdd",
              padding: "15px",
              marginTop: "20px",
              borderRadius: "10px",
              color: "#333",
              whiteSpace: "pre-wrap", // ensures \n works
              wordWrap: "break-word", // break long lines
              maxWidth: "100%",
              overflowX: "auto"
            }}
          >
            {msg}
          </div>
        )}
      </div>
    </div>
  );
}

export default ResumeScore;
