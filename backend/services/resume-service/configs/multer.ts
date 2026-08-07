import multer from "multer";
import path from "path";
import fs from "fs";

const uploadPath = "../uploads";

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

const storage = multer.diskStorage({
  destination: (_req: any, _file: any, cb: any) => {
    cb(null, uploadPath);
  },

  filename: (_req: any, file: any, cb: any) => {
    const fileName = Date.now() + path.extname(file.originalname);
    cb(null, fileName);
  },
});

const fileFilter = (_req: any, file: any, cb: any) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
  },
});

export default upload;
