import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import resumeRoutes from "./routes/resumeRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import portfolioRoutes from "./routes/portfolioRoutes.js";
import connectDB from "./db.js";
import authRoutes from "./routes/authRoutes.js"
import mockInterviewRoutes from "./routes/mockInterview.js";



dotenv.config();
const app = express();
const PORT = process.env.PORT || 7000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://elite-resume-ai.vercel.app"
  ],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/mock-interview", mockInterviewRoutes);
// Static route to serve downloadable portfolios
app.use("/output", express.static(path.join(__dirname, "output")));


// Connect to DB
connectDB();

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});