import express from "express";
import multer from "multer";
import { getScore } from "../controllers/scoreController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/score", upload.single("resume"), getScore); // ✅ Just "/"

export default router;