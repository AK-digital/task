import { Paperclip } from "lucide-react";
import styles from "@/styles/components/attachment/attachment.module.css";

export default function Attachment({
  attachments,
  setAttachments,
  label = <Paperclip size={16} />,
}) {
  const isPaperclip = label?.type === Paperclip;

  function handleAttachments(e) {
    const newFiles = Array.from(e.target.files);
    setAttachments((prev) => [...prev, ...newFiles]);
  }

  return (
    <div>
      <label
        className={styles.label}
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
        accept="application/pdf"
        multiple
        hidden
      />
    </div>
  );
}
