// server/controllers/questionController.js
import fs from "fs";
import pdf from "pdf-parse";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL_ID = process.env.MODEL_ID || "tencent/hunyuan-a13b-instruct:free";

export const generateQuestions = async (req, res) => {
  try {
    if (!req.file || !req.body.role) {
      return res.status(400).json({ error: "Resume file and role required" });
    }

    const fileData = fs.readFileSync(req.file.path);
    const { text } = await pdf(fileData);
    const resumeText = text.trim().slice(0, 4000);
    const role = req.body.role;

    const prompt = `
You are a technical recruiter AI.

Given the following resume and role, generate 5 interview questions with answers.
Return JSON like this:
[
  {
    "category": "HTML",
    "question": "What is a semantic tag in HTML?",
    "answer": "Semantic tags clearly describe their meaning in a human- and machine-readable way."
  },
  ...
]

RESUME:
${resumeText}

ROLE:
${role}
    `.trim();

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: MODEL_ID,
        messages: [
          { role: "system", content: "You are a helpful recruiter AI." },
          { role: "user", content: prompt }
        ],
        temperature: 0.5
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const raw = response.data?.choices?.[0]?.message?.content?.trim() || "";
    console.log("🟢 AI Raw Reply:", raw);

    let parsed;
    try {
      const cleaned = raw
        .replace(/<answer>/gi, "")
        .replace(/<\/answer>/gi, "")
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      parsed = JSON.parse(cleaned);
    } catch (err) {
      console.error("❌ Question Gen Error:", err.message);
      return res.status(500).json({
        error: "Failed to parse AI response",
        rawReply: raw,
        message: err.message
      });
    }

    return res.json({ questions: parsed });

  } catch (err) {
    console.error("❌ AI generation error:", err.message);
    return res.status(500).json({ error: "AI generation failed", detail: err.message });
  }
};