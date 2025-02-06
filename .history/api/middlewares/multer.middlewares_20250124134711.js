import multer from "multer";
import path from "path";
const allowedMimetypes = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/webp",
  "image/avif",
  "application/pdf",
  "image/docx",
];

const storage = multer.memoryStorage({
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now());
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

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter, // Ajout du filtre ici
  limits: { fileSize: 5 * 1024 * 1024 }, // Limite de taille du fichier à 5MB (optionnel)
});
