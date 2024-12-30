import multer from "multer";

const allowedMimetypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

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
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const upload = multer({ storage: storage });
