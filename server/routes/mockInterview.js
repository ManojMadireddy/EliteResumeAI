import express from "express";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL_ID = process.env.MODEL_ID || "tencent/hunyuan-a13b-instruct:free";

router.post("/feedback", async (req, res) => {
  try {
    const userPrompt = req.body.prompt;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: MODEL_ID,
        messages: [
          { role: "system", content: "You are a mock interview coach." },
          { role: "user", content: userPrompt }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const feedback = response.data?.choices?.[0]?.message?.content?.trim();
    res.json({ reply: feedback });
  } catch (err) {
    res.status(500).json({ error: "AI failed", message: err.message });
  }
});

export default router;


