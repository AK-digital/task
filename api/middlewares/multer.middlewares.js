import multer from "multer";

const allowedMimetypes = [
  // Images déjà présentes
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/webp",
  "image/avif",

  // Documents
  "application/pdf",
  "application/msword", // .doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/vnd.ms-excel", // .xls
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/vnd.ms-powerpoint", // .ppt
  "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
  "text/plain", // .txt
  "application/rtf", // .rtf

  // Documents OpenDocument
  "application/vnd.oasis.opendocument.text", // .odt
  "application/vnd.oasis.opendocument.spreadsheet", // .ods
  "application/vnd.oasis.opendocument.presentation", // .odp

  // Images additionnelles
  "image/gif",
  "image/svg+xml", // .svg
  "image/bmp",
  "image/tiff",

  // Archives
  "application/zip",
  "application/x-zip",
  "application/x-zip-compressed",
  "application/octet-stream",
  "application/x-rar-compressed", // .rar
  "application/x-7z-compressed", // .7z
  "application/x-tar", // .tar
  "application/gzip", // .gz

  // Autres formats
  "text/csv",
  "application/json",
  "text/xml",
  "application/xml",
  "text/markdown", // .md
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
