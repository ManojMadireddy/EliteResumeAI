// client/src/components/QuestionGenerator.js
import React, { useState, useEffect } from "react";
import "./PageBackground.css"; // ✅ Make sure this CSS file exists
import { supabase } from "../supabaseClient"; // Import Supabase client

function QuestionGenerator() {
  const [file, setFile] = useState(null);
  const [role, setRole] = useState("");
  const [questions, setQuestions] = useState([]);
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
        console.warn("User not authenticated in QuestionGenerator.");
      }
    };
    getSession();
  }, []);

  const handleGenerate = async () => {
    setMsg("");
    setQuestions([]);
    setLoading(true);

    if (!file || !role) {
      setMsg("❌ Please upload a resume and choose a role.");
      setLoading(false);
      return;
    }

    if (!userId) {
      setMsg("Error: User not authenticated. Cannot generate questions.");
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
      // You MUST create a serverless function (e.g., in api/generate-questions.js)
      // that handles resume parsing and AI question generation.
      const res = await fetch("/api/generate-questions", {
        method: "POST",
        body: data, // FormData is used directly here
        // No 'Content-Type' header needed for FormData; browser sets it automatically
        // You might send an authorization header if your serverless function requires it
        // headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to generate questions from serverless function.");
      }

      const result = await res.json();
      const generatedQuestions = result.questions || [];
      setQuestions(generatedQuestions);
      setMsg(`✅ Generated ${generatedQuestions.length} questions.`);

      // --- Save generated questions to Supabase ---
      const { error: dbError } = await supabase
        .from('generated_questions') // Ensure you have this table in Supabase
        .insert([
          {
            user_id: userId,
            resume_filename: file.name,
            selected_role: role,
            generated_questions: generatedQuestions, // Store as JSONB
            generated_at: new Date().toISOString(),
          },
        ]);

      if (dbError) {
        console.error("Error saving generated questions to DB:", dbError.message);
        // You might want to show a message to the user that saving failed
      }

    } catch (err) {
      console.error("Question Generation Error:", err);
      setMsg("❌ Failed to generate questions: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper bg-mockinterview">
      <div className="glass-container">
        <h2 style={{ textAlign: "center", marginBottom: 20 }}>
          🧠 AI Question Generator
        </h2>

        <label>Upload Resume (PDF):</label>
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => setFile(e.target.files[0])}
          style={{ marginBottom: 10 }}
        />

        <label>Select Role:</label>
        <select value={role} onChange={(e) => setRole(e.target.value)} style={{ marginBottom: 10 }}>
          <option value="">-- Select Role --</option>
          <option>Frontend Developer</option>
          <option>Backend Developer</option>
          <option>Data Scientist</option>
          <option>Fullstack Developer</option>
        </select>

        <button onClick={handleGenerate} style={{ marginBottom: 16 }} disabled={loading || !file || !role}>
          {loading ? "Generating..." : "🚀 Generate Questions"}
        </button>

        {msg && <p style={{ color: msg.startsWith("❌") ? "red" : "green" }}>{msg}</p>}

        <div style={{ marginTop: 20 }}>
          {questions.map((q, idx) => (
            <div key={idx} className="question-card" style={{
              background: "#333", padding: 15, borderRadius: 8, marginBottom: 10, border: "1px solid #555"
            }}>
              <strong>Q{idx + 1} ({q.category}):</strong> {q.question}
              <details>
                <summary style={{ cursor: "pointer", marginTop: 8, color: "#88f" }}>
                  Show Answer
                </summary>
                <p style={{ marginTop: 5, color: "#bbb" }}>{q.answer}</p>
              </details>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default QuestionGenerator;
