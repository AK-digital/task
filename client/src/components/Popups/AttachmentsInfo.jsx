import styles from "@/styles/components/popups/attachmentsInfo.module.css";
import { useState, useEffect } from "react";
import Attachment from "../Attachment/Attachment";
import { Download, Trash2 } from "lucide-react";
import { BlobWriter, ZipWriter, BlobReader } from "@zip.js/zip.js";

export default function AttachmentsInfo({
  attachments,
  setAttachments = null,
  disable = true,
  type = "affichage",
}) {
  const [showAttachments, setShowAttachments] = useState(false);

  const attachmentsLength = [...attachments].length;

  const [checkedList, setCheckedList] = useState([]);

  const label = `${attachmentsLength} ${
    attachmentsLength > 1 ? "pièces jointes" : "pièce jointe"
  }`;

  const isAffichage = type === "affichage";

  const isAnyChecked = checkedList.some((v) => v); // au moins une cochée

  const toggleAll = () => {
    setCheckedList((prev) => {
      const isAnyChecked = prev.some((v) => v);
      return prev.map(() => !isAnyChecked);
    });
  };

  const toggleCheckbox = (index) => {
    setCheckedList((prev) => {
      const updated = [...prev];
      updated[index] = !updated[index];
      return updated;
    });
  };

  const getAttachmentsChecks = () => {
    return attachments.filter((attachment, index) => checkedList[index]);
  };

  const getDownloadUrl = (url) => {
    let parts = url.split("/");
    parts[6] = "fl_attachment";

    return parts.join("/");
  };

  const handleDelete = (type, indexToRemove = null) => {
    if (!setAttachments) return;

    let newAttachments;
    let newCheckedList;

    if (type == "delete") {
      newAttachments = attachments.filter((_, index) => !checkedList[index]);
      newCheckedList = checkedList.filter((checked) => !checked);
    } else {
      newAttachments = attachments.filter(
        (_, index) => index !== indexToRemove
      );
      newCheckedList = checkedList.filter(
        (_, index) => index !== indexToRemove
      );
    }

    setAttachments(newAttachments);
    setCheckedList(newCheckedList);
  };

  const handleDownload = async (downloadUrl, name) => {
    const response = await fetch(downloadUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleDownloadZip = async () => {
    const zipFileWriter = new BlobWriter();
    const zipWriter = new ZipWriter(zipFileWriter);

    const filesToDownload = getAttachmentsChecks();

    for (const file of filesToDownload) {
      const url = getDownloadUrl(file.url);
      const response = await fetch(url);
      const blob = await response.blob();
      await zipWriter.add(file.name, new BlobReader(blob));
    }
    await zipWriter.close();

    const zipFileBlob = await zipFileWriter.getData();
    const zipUrl = URL.createObjectURL(zipFileBlob);

    const a = document.createElement("a");
    a.href = zipUrl;
    a.download = "pièces jointes.zip";
    a.click();
    URL.revokeObjectURL(zipUrl);
  };

  useEffect(() => {
    // Synchroniser le tableau checkedList avec la taille de attachments
    setCheckedList((prev) => {
      const diff = attachments.length - prev.length;
      if (diff > 0) {
        // Ajoute des "false" pour les nouvelles pièces jointes
        return [...prev, ...Array(diff).fill(false)];
      } else if (diff < 0) {
        // Supprime les entrées en trop si on a supprimé des fichiers
        return prev.slice(0, attachments.length);
      }
      return prev;
    });
  }, [attachments]);

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
            {attachments.map(({ name, url }, index) => {
              const hasUrl = !!url;

              let downloadUrl;
              if (hasUrl) {
                downloadUrl = getDownloadUrl(url);
              }
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
                      onClick={() => handleDelete("deleteOne", index)}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}

                  {isAffichage && (
                    <button
                      className={styles.download}
                      data-has-background="false"
                      onClick={() => handleDownload(downloadUrl, name)}
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
              {!isAffichage && isAnyChecked && (
                <button
                  className={styles.delete}
                  data-has-background="true"
                  onClick={() => handleDelete("delete")}
                >
                  <Trash2 size={16} />
                </button>
              )}
              {isAffichage && isAnyChecked && (
                <button
                  className={styles.download}
                  data-has-background="true"
                  onClick={handleDownloadZip}
                >
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
