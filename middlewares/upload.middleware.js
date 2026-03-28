import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `logo_${Date.now()}${ext}`;
    cb(null, name);
  }
});

const upload = multer({ storage });

export default upload;