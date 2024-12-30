import multer from "multer";

const allowedMimetypes = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/webp",
  "image/avif",
  "application/pdf",
  "image/docx",
  "image/pdf",
];

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../uploads");
  },
  fileFilter: function (req, file, cv) {
    if (allowedMimetypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      // Reject the file
      cb(new multer.MulterError("LIMIT_FILE_TYPE"), false);
    }
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname);
  },
});

export const upload = multer({ storage: storage });
