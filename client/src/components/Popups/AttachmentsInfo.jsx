import styles from "@/styles/components/popups/attachmentsInfo.module.css";
import { useState } from "react";
import Attachment from "../Attachment/Attachment";
import { Download, Trash2 } from "lucide-react";

export default function AttachmentsInfo({
  attachments,
  setAttachments = null,
  disable = true,
  type = "affichage",
}) {
  const [showAttachments, setShowAttachments] = useState(false);

  const attachmentsLength = [...attachments].length;
  const attachmentsArray = Array.from(attachments);

  const [checkedList, setCheckedList] = useState(
    attachmentsArray.map(() => false)
  );

  const label = `${attachmentsLength} ${
    attachmentsLength > 1 ? "pièces jointes" : "pièce jointe"
  }`;

  const isAffichage = type === "affichage";

  const isAnyChecked = checkedList.some((v) => v); // au moins une cochée

  const toggleAll = () => {
    setCheckedList(checkedList.map(() => !isAnyChecked));
  };

  const toggleCheckbox = (index) => {
    const updated = [...checkedList];
    updated[index] = !updated[index];
    setCheckedList(updated);
  };

  const handleDelete = () => {
    if (!setAttachments) return;

    const newAttachments = attachmentsArray.filter(
      (_, index) => !checkedList[index]
    );
    const newCheckedList = checkedList.filter((checked) => !checked);

    setAttachments(newAttachments);
    setCheckedList(newCheckedList);
  };

  const handleDeleteOne = (indexToRemove) => {
    if (!setAttachments) return;

    const newAttachments = attachmentsArray.filter(
      (_, index) => index !== indexToRemove
    );
    const newCheckedList = checkedList.filter(
      (_, index) => index !== indexToRemove
    );

    setAttachments(newAttachments);
    setCheckedList(newCheckedList);
  };

  return (
    <div
      className={styles.container}
      onMouseEnter={() => setShowAttachments(true)}
      onMouseLeave={() => setShowAttachments(false)}
    >
      <span className={styles.attachments}>
        {disable ? (
          <span className={styles.readonlyLabel}>{label}</span>
        ) : (
          <Attachment
            attachments={attachments}
            setAttachments={setAttachments}
            label={label}
          />
        )}
      </span>

      {showAttachments && (
        <div className={styles.infosWrapper}>
          <div className={styles.infos}>
            {attachmentsArray.map(({ name, url }, index) => {
              const hasUrl = !!url;
              return (
                <div key={index} className={styles.infoAttachment}>
                  <div className={styles.file}>
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      name="checkbox"
                      checked={checkedList[index]}
                      onChange={() => toggleCheckbox(index)}
                    />

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

                  {!isAffichage && (
                    <button
                      className={styles.delete}
                      data-has-background="false"
                      onClick={() => handleDeleteOne(index)}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}

                  {isAffichage && (
                    <button
                      className={styles.download}
                      data-has-background="false"
                    >
                      <Download size={16} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          <div className={styles.actions}>
            <span className={styles.allCheck} onClick={toggleAll}>
              {isAnyChecked ? "Tout décocher" : "Tout cocher"}
            </span>

            <div className={styles.actionsButtons}>
              {!isAffichage && (
                <button
                  className={styles.delete}
                  data-has-background="true"
                  onClick={handleDelete}
                >
                  <Trash2 size={16} />
                </button>
              )}
              {isAffichage && (
                <button className={styles.download} data-has-background="true">
                  <Download size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
