import { Paperclip } from "lucide-react";

export default function Attachment({
  attachments,
  setAttachments,
  label = <Paperclip size={16} />,
  editor = null, // Ajouter l'éditeur pour pouvoir y insérer des images
  setTooMuchAttachments,
  setTooHeavyAttachments,
  size = 18,
}) {
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
  ].join(", ");

  const isPaperclip = label?.type === Paperclip;

  function handleAttachments(e) {
    const newFiles = Array.from(e.target.files);
    console.log("newFiles", newFiles);
    const authorizedFiles = [];
    for (const file of newFiles) {
      if (file.size > 5 * 1024 * 1024) {
        setTooHeavyAttachments(true);
        return;
      } else {
        authorizedFiles.push(file);
      }
    }
    // Vérifier si l'ajout des nouveaux fichiers dépasserait la limite de 10
    if (attachments.length + newFiles.length > 10) {
      setTooMuchAttachments(true);
      return;
    }

    // Réinitialiser l'état d'erreur si tout va bien
    if (setTooMuchAttachments) {
      setTooMuchAttachments(false);
    }

    if (setTooHeavyAttachments) {
      setTooHeavyAttachments(false);
    }

    // Ajouter tous les fichiers aux attachments (images ET autres fichiers)
    setAttachments((prev) => [...prev, ...authorizedFiles]);
  }

  return (
    <div>
      <label className={``} data-label={isPaperclip} htmlFor="attachment">
        <Paperclip
          size={size}
          className="cursor-pointer text-accent-color-dark hover:text-accent-color group-hover:text-accent-color"
        />
      </label>
      <input
        type="file"
        name="attachment"
        id="attachment"
        onChange={handleAttachments}
        accept={allowedMimetypes}
        multiple
        hidden
      />
    </div>
  );
}
