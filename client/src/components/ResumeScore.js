import React, { useState } from "react";
import axios from "axios";
import "./PageBackground.css"; // make sure this includes your .glass-container etc.

function ResumeScore() {
  const [file, setFile] = useState(null);
  const [role, setRole] = useState("");
  const [msg, setMsg] = useState("");

  const handleUpload = async () => {
    if (!file || !role) {
      setMsg("❌ Please choose a PDF and a role first.");
      return;
    }

    const data = new FormData();
    data.append("resume", file);
    data.append("role", role);

    try {
      const res = await axios.post("https://eliteresumeai-1.onrender.com/api/resume/upload", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const txt = `✅ Match for "${res.data.role}": ${res.data.score}%\n📝 Reason: ${res.data.reason}`;
      setMsg(txt);
    } catch (err) {
      const detail =
        err.response?.data
          ? JSON.stringify(err.response.data, null, 2)
          : err.message;

      setMsg("❌ Upload failed:\n" + detail);
    }
  };

  return (
    <div className="page-wrapper bg-resumescore">
      <div className="glass-container">
        <h2>📄 Resume Upload + AI Score</h2>

        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">-- Select Role --</option>
          <option>Frontend Developer</option>
          <option>Software Engineer</option>
          <option>Data Scientist</option>
        </select>

        <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} />

        <button onClick={handleUpload}>🚀 Upload & Get AI Score</button>

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