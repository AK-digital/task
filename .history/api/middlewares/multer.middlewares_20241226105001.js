import multer from "multer";

const allowedMimetypes = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/webp",
  "image/avif",
  "application/pdf",
  "image/docx",
];

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../uploads");
  },
  filename: function (req, file, cb) {
    // Ajout d'un nom unique pour éviter les collisions de fichiers
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + "-" + file.originalname);
  },
});

const fileFilter = function (req, file, cb) {
  if (allowedMimetypes.includes(file.mimetype)) {
    cb(null, true); // Accepter le fichier
  } else {
    // Rejeter le fichier avec une erreur
    cb(
      new multer.MulterError("LIMIT_FILE_TYPE", "File type not allowed"),
      false
    );
  }
};

export const upload = multer({ storage: storage });
