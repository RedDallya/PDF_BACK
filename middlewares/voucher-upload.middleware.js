import fs from "fs";
import path from "path";
import multer from "multer";

const uploadDir = path.join("uploads", "vouchers");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (_req, file, cb) => {
  const allowed = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp"
  ];

  if (allowed.includes(file.mimetype)) {
    return cb(null, true);
  }

  cb(new Error("Tipo de archivo no permitido"));
};

const voucherUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

export default voucherUpload;