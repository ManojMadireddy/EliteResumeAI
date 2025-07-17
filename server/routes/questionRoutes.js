// server/routes/questionRoutes.js
import { Router } from "express";
import multer from "multer";
import { generateQuestions } from "../controllers/questionController.js";

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

const router = Router();

router.post("/generate", upload.single("resume"), generateQuestions);

export default router;

