import styles from "@/styles/components/popups/attachmentsInfo.module.css";
import { useState } from "react";

export default function AttachmentsInfo({ attachments }) {
  const [showAttachments, setShowAttachments] = useState(false);

  const attachmentsLength = [...attachments].length;
  const attachmentsArray = Array.from(attachments);

  return (
    <div
      className={styles.container}
      onMouseEnter={() => setShowAttachments(true)}
      onMouseLeave={() => setShowAttachments(false)}
    >
      <span className={styles.attachments}>
        {attachmentsLength + " "}
        {attachmentsLength > 1 ? "pièces jointes" : "pièce jointe"}
      </span>

      {showAttachments && (
        <div className={styles.infos}>
          {attachmentsArray.map(({ name, url }, index) => {
            const hasUrl = !!url;
            return (
              <div key={index} className={styles.infoAttachment}>
                <a
                  className={styles.attachmentName}
                  data-url={hasUrl ? "true" : "false"}
                  target="_blank"
                  href={url}
                  disabled={!hasUrl}
                >
                  {name}
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
