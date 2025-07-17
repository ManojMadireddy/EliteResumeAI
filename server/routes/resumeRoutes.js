// server/routes/resumeRoutes.js
import { Router } from "express";
import multer from "multer";
import { uploadResume } from "../controllers/resumeController.js";

/* store uploads in /uploads */
const storage = multer.diskStorage({
  destination: (req,file, cb) => cb(null, "uploads/"),
  filename:    (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

const router = Router();

/* POST /api/resume/upload */
router.post("/upload", upload.single("resume"), uploadResume);

export default router;