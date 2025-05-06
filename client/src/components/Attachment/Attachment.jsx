import { Paperclip } from "lucide-react";
import styles from "@/styles/components/attachment/attachment.module.css";

export default function Attachment({
  setAttachments,
  label = <Paperclip size={16} />,
}) {
  const isPaperclip = label?.type === Paperclip;

  function handleAttachments(e) {
    const files = e.target.files;
    setAttachments(files);
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
