
// middleware/uploadPortfolioFields.js
import multer from "multer";

const storage = multer.memoryStorage(); // we’ll use file buffer

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("profilePic");

export { upload };