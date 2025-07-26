// client/src/components/OneClickPortfolio.js
import React, { useState, useEffect } from "react";
// No need for axios anymore
// import axios from "axios";
import "./PageBackground.css"; // 💡 Make sure this file contains .bg-portfolio class
import { supabase } from "../supabaseClient"; // Import Supabase client

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
  const [loading, setLoading] = useState(false); // New loading state
  const [userId, setUserId] = useState(null); // To store the current user's ID

  useEffect(() => {
    // Get the current authenticated user's ID from Supabase
    const getSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      } else {
        console.warn("User not authenticated in OneClickPortfolio.");
      }
    };
    getSession();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setPortfolioHtml(null);

    if (!userId) {
      setError("Error: User not authenticated. Cannot generate portfolio.");
      setLoading(false);
      return;
    }

    try {
      // --- IMPORTANT: This now calls a Vercel Serverless Function ---
      // You MUST create a serverless function (e.g., in api/generate-portfolio.js)
      // that handles the portfolio generation logic.
      const res = await fetch("/api/generate-portfolio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // You might send an authorization header if your serverless function requires it
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData), // Send all form data to the serverless function
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to generate portfolio from serverless function.");
      }

      const data = await res.json();
      const generatedHtml = data.html || "";
      setPortfolioHtml(generatedHtml);

      // --- Save portfolio data to Supabase ---
      const { error: dbError } = await supabase
        .from('user_portfolios') // Ensure you have this table in Supabase
        .insert([
          {
            user_id: userId,
            portfolio_data: formData, // Save the form data as JSONB
            generated_html: generatedHtml, // Save the generated HTML
            generated_at: new Date().toISOString(),
          },
        ]);

      if (dbError) {
        console.error("Error saving portfolio data to DB:", dbError.message);
        // You might want to show a message to the user that saving failed
      }

    } catch (err) {
      console.error("Portfolio Generation Error:", err);
      setError("❌ Failed to generate portfolio: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!portfolioHtml) return; // Prevent download if no HTML is generated
    const blob = new Blob([portfolioHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${formData.name || "portfolio"}_template-${formData.template}.html`;
    document.body.appendChild(link); // Append to body for Firefox compatibility
    link.click();
    document.body.removeChild(link); // Clean up
    URL.revokeObjectURL(url); // Release the object URL
  };

  return (
    <div className="page-wrapper bg-portfolio">
      <div className="form-container">
        <h1 className="section-title">📄 One-Click Portfolio Generator</h1>

        <form onSubmit={handleSubmit} className="styled-form">
          <input type="text" name="name" placeholder="Name" onChange={handleChange} value={formData.name} required />
          <input type="text" name="role" placeholder="Role" onChange={handleChange} value={formData.role} required />
          <textarea name="summary" placeholder="Summary" onChange={handleChange} value={formData.summary} required />
          <input type="text" name="skills" placeholder="Skills (comma separated)" onChange={handleChange} value={formData.skills} />
          <input type="text" name="projects" placeholder="Projects" onChange={handleChange} value={formData.projects} />
          <input type="text" name="experience" placeholder="Experience" onChange={handleChange} value={formData.experience} />
          <input type="text" name="education" placeholder="Education" onChange={handleChange} value={formData.education} />
          <input type="text" name="linkedin" placeholder="LinkedIn URL" onChange={handleChange} value={formData.linkedin} />
          <input type="text" name="github" placeholder="GitHub URL" onChange={handleChange} value={formData.github} />

          <select name="theme" onChange={handleChange} value={formData.theme}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>

          <select name="template" value={formData.template} onChange={handleChange}>
            <option value="professional">Professional</option>
            <option value="creative">Creative</option>
            <option value="minimal">Minimal</option>
            <option value="modern">Modern</option>
          </select>

          <button type="submit" className="generate-btn" disabled={loading}>
            {loading ? "Generating..." : "Generate Portfolio"}
          </button>
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