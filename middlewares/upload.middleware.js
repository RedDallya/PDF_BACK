import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, "../uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const prefix = file.fieldname === "cover" ? "cover" : "logo";
    const safeExt = ext || ".png";
    cb(null, `${prefix}_${Date.now()}${safeExt}`);
  }
});

const upload = multer({ storage });

export default upload;