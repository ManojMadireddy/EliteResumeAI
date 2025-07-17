import React, { useState } from "react";
import "./PageBackground.css"; // ✅ Make sure this CSS file exists

function QuestionGenerator() {
  const [file, setFile] = useState(null);
  const [role, setRole] = useState("");
  const [questions, setQuestions] = useState([]);
  const [msg, setMsg] = useState("");

  const handleGenerate = async () => {
    if (!file || !role) {
      setMsg("❌ Please upload a resume and choose a role.");
      return;
    }

    const data = new FormData();
    data.append("resume", file);
    data.append("role", role);

    try {
      const res = await fetch("http://localhost:7000/api/questions/generate", {
        method: "POST",
        body: data,
      });

      const result = await res.json();
      setQuestions(result.questions || []);
      setMsg(`✅ Generated ${result.questions?.length || 0} questions.`);
    } catch (err) {
      console.error(err);
      setMsg("❌ Failed to generate questions.");
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
        />

        <label>Select Role:</label>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">-- Select Role --</option>
          <option>Frontend Developer</option>
          <option>Backend Developer</option>
          <option>Data Scientist</option>
          <option>Fullstack Developer</option>
        </select>

        <button onClick={handleGenerate} style={{ marginBottom: 16 }}>
          🚀 Generate Questions
        </button>

        {msg && <p>{msg}</p>}

        <div style={{ marginTop: 20 }}>
          {questions.map((q, idx) => (
            <div key={idx} className="question-card">
              <strong>Q{idx + 1} ({q.category}):</strong> {q.question}
              <details>
                <summary style={{ cursor: "pointer", marginTop: 8 }}>
                  Show Answer
                </summary>
                <p style={{ marginTop: 5 }}>{q.answer}</p>
              </details>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default QuestionGenerator;