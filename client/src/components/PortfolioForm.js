import React, { useState } from "react";
import axios from "axios";

const PortfolioForm = () => {
  const [form, setForm] = useState({
    name: "",
    role: "",
    summary: "",
    skills: "",
    projects: "",
    contact: ""
  });

  const [html, setHtml] = useState("");
  const [msg, setMsg] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleGenerate = async () => {
    try {
      const res = await axios.post("http://localhost:3000/api/portfolio/generate", form);
      setHtml(res.data.html);
      setMsg("✅ Portfolio generated!");
    } catch (err) {
      console.error("Portfolio Error:", err.message);
      setMsg("❌ Error generating portfolio.");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>🧩 Custom Portfolio Generator</h2>

      {["name", "role", "summary", "skills", "projects", "contact"].map((field) => (
        <div key={field}>
          <label>{field.charAt(0).toUpperCase() + field.slice(1)}:</label>
          <textarea
            name={field}
            value={form[field]}
            onChange={handleChange}
            rows={field === "summary" || field === "projects" ? 4 : 2}
            style={{ width: "100%", marginBottom: 10 }}
          />
        </div>
      ))}

      <button onClick={handleGenerate}>Generate Portfolio</button>
      {msg && <p>{msg}</p>}

      {html && (
        <div style={{ marginTop: 30 }}>
          <h3>Preview</h3>
          <iframe title="Portfolio" srcDoc={html} style={{ width: "100%", height: 600 }} />
        </div>
      )}
    </div>
  );
};

export default PortfolioForm;