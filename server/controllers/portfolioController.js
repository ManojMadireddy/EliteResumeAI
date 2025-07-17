// server/controllers/portfolioController.js
import axios from "axios";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Utility to save HTML to file
const saveHtmlToFile = (html, filename) => {
  const outputDir = path.join(__dirname, "..", "output");
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
  const filePath = path.join(outputDir, filename);
  fs.writeFileSync(filePath, html);
  return filePath;
};

export const generatePortfolio = async (req, res) => {
  try {
    const {
      name,
      role,
      summary,
      skills,
      projects,
      experience,
      education,
      linkedin,
      github,
      theme,
      template = "Professional"
    } = req.body;

    if (!name || !role || !summary || !skills || !projects) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const prompt = `
You are a powerful HTML portfolio generator. Use the "${template}" template style and generate a clean, professional HTML portfolio page.

Include sections: Home, About, Skills, Projects, Experience, Education, Contact.

Use this info:
- Name: ${name}
- Role: ${role}
- Summary: ${summary}
- Skills: ${skills}
- Projects: ${projects}
- Experience: ${experience}
- Education: ${education}
- LinkedIn: ${linkedin}
- GitHub: ${github}
- Theme: ${theme}

Return only a single full HTML file with inlined CSS and JS if needed.
    `;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: process.env.MODEL_ID,
        messages: [
          { role: "system", content: "You are a helpful portfolio generator." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const html =
      response.data?.choices?.[0]?.message?.content?.replace(/html|/g, "").trim() || "";

    const fileName = `${name.replace(/\s+/g, "_").toLowerCase()}_portfolio.html`;
    const filePath = saveHtmlToFile(html, fileName);

    return res.json({
      html,
      downloadLink: `http://localhost:7000/output/${fileName}`
    });
  } catch (err) {
    console.error("Portfolio Generation Failed:", err.message);
    res.status(500).json({ error: "Portfolio generation failed." });
  }
};