import fs from "fs";
import pdf from "pdf-parse";
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_KEY);

export const getScore = async (req, res) => {
  try {
    if (!req.file || !req.body.role) {
      return res.status(400).json({ error: "Resume and role are required" });
    }

    const fileData = fs.readFileSync(req.file.path);
    const { text: resumeTextRaw } = await pdf(fileData);
    const resumeText = resumeTextRaw.slice(0, 4000);
    const role = req.body.role;

    const prompt = `
You are a professional resume reviewer AI.
ROLE: ${role}
RESUME: ${resumeText}

Give a score out of 100 and 3 feedback points to improve the resume.

Return JSON like:
{
  "score": 85,
  "feedback": [
    "Include more measurable results",
    "Highlight leadership roles",
    "Add a summary section"
  ]
}
`;

    const model = genAI.getGenerativeModel({ model: "gemini-pro" }); // Make sure "gemini-pro" is supported
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const geminiText = response.text();

    let jsonResult;
    try {
      jsonResult = JSON.parse(geminiText);
    } catch (e) {
      console.error("❌ JSON Parse Failed:", e.message);
      console.log("⚠️ AI returned:", geminiText);
      return res.status(500).json({ error: "Invalid JSON from Gemini" });
    }

    return res.json(jsonResult);
  } catch (err) {
    console.error("❌ Resume Scoring Error:", err.message);
    console.error("📄 Full error:", err);
    return res.status(500).json({ error: "Failed to score resume" });
  }
};