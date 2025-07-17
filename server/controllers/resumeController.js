/**
 *  Resume Controller – OpenRouter AI (Free GPT) *
 **/

import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import pdf from "pdf-parse";
import axios from "axios";

// OpenRouter API
const OR_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const OR_KEY = process.env.OPENROUTER_API_KEY;
const MODEL_ID = process.env.MODEL_ID || "tencent/hunyuan-a13b-instruct:free"; // ✅ FREE MODEL (change if needed)

console.log("🔐 OR key starts:", OR_KEY?.slice(0, 12));
console.log("🤖 Model:", MODEL_ID);

export const uploadResume = async (req, res) => {
  try {
    // 1. Validate file
    if (!req.file?.path) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const fileData = fs.readFileSync(req.file.path);

    // 2. Extract text (max 4000 chars)
    let resumeText = "";
    try {
      const { text } = await pdf(fileData);
      resumeText = text.trim().slice(0, 4000);
    } catch {
      resumeText = "(resume text could not be extracted)";
    }

    // 3. Validate role
    const { role } = req.body;
    if (!role) return res.status(400).json({ error: "Role is required" });

    // 4. Build prompt
    const prompt = `
You are an expert recruiter.
Return ONLY valid JSON:
{ "score": 0-100, "reason": "short reason" }

ROLE:
${role}

RESUME:
${resumeText}
    `.trim();

    // 5. Call OpenRouter
    const orResponse = await axios.post(
      OR_API_URL,
      {
        model: MODEL_ID,
        messages: [
          { role: "system", content: "You are a helpful recruiter AI." },
          { role: "user", content: prompt }
        ],
        temperature: 0.2
      },
      {
        headers: {
          Authorization: `Bearer ${OR_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 120000
      }
    );

    // 6. Parse AI response
    const raw = orResponse.data?.choices?.[0]?.message?.content?.trim() || "";
    console.log("🟡 AI raw reply:", raw);

    let parsed;
    try {
      const cleaned = raw
        .replace(/<answer>/gi, "")
        .replace(/<\/answer>/gi, "")
        .trim();

      parsed = JSON.parse(cleaned);
    } catch {
      return res.status(500).json({
        error: "AI did not return JSON",
        rawReply: raw
      });
    }

    // 7. Respond
    return res.json({
      role,
      score: parsed.score,
      reason: parsed.reason
    });

  } catch (err) {
    const detail =
      err.response?.data?.error || err.response?.statusText || err.message;
    console.error("❌ AI processing error:", detail);
    return res.status(500).json({ error: "AI processing failed", detail });
  }
};