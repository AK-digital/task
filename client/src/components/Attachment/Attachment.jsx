import { Paperclip } from "lucide-react";

export default function Attachment({
  attachments,
  setAttachments,
  label = <Paperclip size={16} />,
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
    setAttachments((prev) => [...prev, ...newFiles]);
  }

  return (
    <div>
      <label
        className="text-small data-[label=false]:text-text-accent-color cursor-pointer"
        data-label={isPaperclip}
        htmlFor="attachment"
      >
        {label}
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
