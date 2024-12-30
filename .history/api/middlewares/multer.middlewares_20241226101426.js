import multer from "multer";

const allowedExtension = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/webp",
  "image/avif",
];

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../uploads");
  },
  fileFilter: function (req, file, cv) {
    if (allowedExtension.includes(file.mimetype)) {
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
