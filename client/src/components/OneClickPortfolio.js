import React, { useState } from "react";
import axios from "axios";
import "./PageBackground.css"; // 💡 Make sure this file contains .bg-portfolio class

const OneClickPortfolio = () => {
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    summary: "",
    skills: "",
    projects: "",
    experience: "",
    education: "",
    linkedin: "",
    github: "",
    theme: "light",
    template: "professional",
  });

  const [portfolioHtml, setPortfolioHtml] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post("http://localhost:7000/api/portfolio/generate", formData);
      setPortfolioHtml(res.data.html || "");
    } catch (err) {
      console.error("Portfolio Error:", err);
      setError("❌ Failed to generate portfolio. Please check inputs.");
    }
  };

  const handleDownload = () => {
    const blob = new Blob([portfolioHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${formData.name || "portfolio"}_template-${formData.template}.html`;
    link.click();
  };

  return (
    <div className="page-wrapper bg-portfolio">
      <div className="form-container">
        <h1 className="section-title">📄 One-Click Portfolio Generator</h1>

        <form onSubmit={handleSubmit} className="styled-form">
          <input type="text" name="name" placeholder="Name" onChange={handleChange} required />
          <input type="text" name="role" placeholder="Role" onChange={handleChange} required />
          <textarea name="summary" placeholder="Summary" onChange={handleChange} required />
          <input type="text" name="skills" placeholder="Skills (comma separated)" onChange={handleChange} />
          <input type="text" name="projects" placeholder="Projects" onChange={handleChange} />
          <input type="text" name="experience" placeholder="Experience" onChange={handleChange} />
          <input type="text" name="education" placeholder="Education" onChange={handleChange} />
          <input type="text" name="linkedin" placeholder="LinkedIn URL" onChange={handleChange} />
          <input type="text" name="github" placeholder="GitHub URL" onChange={handleChange} />

          <select name="theme" onChange={handleChange}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>

          <select name="template" value={formData.template} onChange={handleChange}>
            <option value="professional">Professional</option>
            <option value="creative">Creative</option>
            <option value="minimal">Minimal</option>
            <option value="modern">Modern</option>
          </select>

          <button type="submit" className="generate-btn">Generate Portfolio</button>
        </form>

        {error && <p className="error-text">{error}</p>}

        {portfolioHtml && (
          <div className="preview-section">
            <h2 className="preview-title">🖥️ Portfolio Preview</h2>
            <iframe
              title="portfolio"
              srcDoc={portfolioHtml}
              style={{ width: "100%", height: "600px", border: "1px solid #ccc", borderRadius: "10px" }}
            />
            <button onClick={handleDownload} className="download-btn">
              ⬇️ Download Portfolio
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OneClickPortfolio;