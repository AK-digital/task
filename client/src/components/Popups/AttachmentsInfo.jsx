import { useState, useEffect, useCallback, useMemo } from "react";
import Attachment from "../Attachment/Attachment";
import { Download, LayoutList, ListChecks, Trash2 } from "lucide-react";
import { BlobWriter, ZipWriter, BlobReader } from "@zip.js/zip.js";

export default function AttachmentsInfo({
  attachments,
  setAttachments = null,
  disable = true,
  type = "affichage",
}) {
  const [showAttachments, setShowAttachments] = useState(false);
  const [checkedList, setCheckedList] = useState([]);

  const attachmentsLength = attachments?.length || 0;

  const label = useMemo(() => {
    return `${attachmentsLength} ${
      attachmentsLength > 1 ? "pièces jointes" : "pièce jointe"
    }`;
  }, [attachmentsLength]);

  const isAffichage = type === "affichage";
  const isAnyChecked = useMemo(() => checkedList.some((v) => v), [checkedList]);

  const toggleAll = useCallback(() => {
    setCheckedList((prev) => {
      const isAnyChecked = prev.some((v) => v);
      return prev.map(() => !isAnyChecked);
    });
  }, []);

  const toggleCheckbox = useCallback((index) => {
    setCheckedList((prev) => {
      const updated = [...prev];
      updated[index] = !updated[index];
      return updated;
    });
  }, []);

  const getAttachmentsChecks = useCallback(() => {
    return attachments.filter((attachment, index) => checkedList[index]);
  }, [attachments, checkedList]);

  const isDisplayableFile = useCallback((url) => {
    const blacklistedExtensions = ["tiff", "svg"];

    try {
      const parseUrl = new URL(url);
      const pathname = parseUrl.pathname;
      const lastSegment = pathname.split("/").pop();

      if (!lastSegment || !lastSegment.includes(".")) {
        return false;
      }

      const extension = lastSegment.split(".").pop().toLowerCase();

      if (blacklistedExtensions.includes(extension)) {
        return false;
      }

      return true;
    } catch (e) {
      return false;
    }
  }, []);

  const getDownloadUrl = useCallback((url) => {
    let parts = url.split("/");
    parts[6] = "fl_attachment";
    return parts.join("/");
  }, []);

  const handleDelete = useCallback(
    (type, indexToRemove = null) => {
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
    },
    [attachments, checkedList, setAttachments]
  );

  const handleDownload = useCallback(async (downloadUrl, name) => {
    try {
      let response;

      try {
        // Essayer d'abord avec l'URL de téléchargement
        response = await fetch(downloadUrl);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (error) {
        console.log(
          `Échec avec URL de téléchargement, essai avec URL originale pour ${name}`
        );

        // Fallback: utiliser l'URL originale (retirer fl_attachment)
        const originalUrl = downloadUrl.replace(/\/fl_attachment\//, "/");
        response = await fetch(originalUrl);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(`Erreur lors du téléchargement de ${name}:`, error);
      alert(`Erreur lors du téléchargement de ${name}. Veuillez réessayer.`);
    }
  }, []);

  const handleDownloadZip = useCallback(async () => {
    try {
      const zipFileWriter = new BlobWriter();
      const zipWriter = new ZipWriter(zipFileWriter);
      const filesToDownload = getAttachmentsChecks();

      for (const file of filesToDownload) {
        let response;
        let blob;

        try {
          // Essayer d'abord avec l'URL de téléchargement
          const downloadUrl = getDownloadUrl(file.url);
          response = await fetch(downloadUrl);

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          blob = await response.blob();
        } catch (error) {
          console.log(
            `Échec avec URL de téléchargement, essai avec URL originale pour ${file.name}`
          );

          try {
            // Fallback: utiliser l'URL originale
            response = await fetch(file.url);

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            blob = await response.blob();
          } catch (fallbackError) {
            console.error(
              `Impossible de télécharger ${file.name}:`,
              fallbackError
            );
            // Créer un blob vide avec un message d'erreur
            blob = new Blob(
              [`Erreur: Impossible de télécharger ${file.name}`],
              { type: "text/plain" }
            );
          }
        }

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
    } catch (error) {
      console.error("Erreur lors de la création du ZIP:", error);
      alert("Erreur lors de la création du fichier ZIP. Veuillez réessayer.");
    }
  }, [getAttachmentsChecks, getDownloadUrl]);

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
      className="relative"
      onMouseEnter={() => setShowAttachments(true)}
      onMouseLeave={() => setShowAttachments(false)}
    >
      <span className="text-accent-color-light text-small">
        {disable ? (
          <span className="cursor-pointer text-accent-color hover:text-accent-color-hover">
            {label}
          </span>
        ) : (
          <Attachment
            attachments={attachments}
            setAttachments={setAttachments}
            label={label}
          />
        )}
      </span>

      <div
        className={`absolute flex flex-col bottom-5.5 z-2001 shadow-small overflow-hidden transition-all duration-[350ms] ease-in-out ${
          showAttachments ? "max-h-96" : "max-h-0"
        }`}
      >
        <div className="infos_AttachmentsInfo flex flex-col bg-secondary max-h-[calc(4*22.86px)] overflow-y-auto p-2 gap-2 grow border border-color-border-color border-b-0 rounded-t-sm">
          {attachments.map(({ name, url }, index) => {
            const hasUrl = !!url && isDisplayableFile(url);

            let downloadUrl;
            if (hasUrl) {
              downloadUrl = getDownloadUrl(url);
            }
            return (
              <div
                key={index}
                className="flex items-center justify-between gap-2 h-5 "
              >
                <div className="flex gap-2">
                  <input
                    type="checkbox"
                    name="checkbox"
                    checked={checkedList[index] || false}
                    onChange={() => toggleCheckbox(index)}
                    className="cursor-pointer w-3 hover:border-inherit"
                  />

                  <a
                    className="text-[0.85rem] text-text-color-muted whitespace-nowrap data-[url=false]:no-underline data-[url=false]:cursor-default data-[url=false]:hover:text-text-color-muted"
                    data-url={hasUrl ? "true" : "false"}
                    target="_blank"
                    href={hasUrl ? url : undefined}
                    onClick={(e) => {
                      if (!hasUrl) {
                        e.preventDefault();
                      }
                    }}
                  >
                    {name}
                  </a>
                </div>

                {!isAffichage && (
                  <button
                    className="delete_AttachmentsInfo flex justify-center items-center h-3 w-auto"
                    data-has-background="false"
                    onClick={() => handleDelete("deleteOne", index)}
                  >
                    <Trash2 size={16} />
                  </button>
                )}

                {isAffichage && (
                  <button
                    className="download_AttachmentsInfo flex justify-center items-center h-3 w-auto"
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
        <div className="actions_AttachmentsInfo flex items-center justify-start gap-2 p-2 bg-secondary border border-color-border-color border-t-0 rounded-b-sm">
          <button
            className="cursor-pointer px-2 py-1 text-small flex justify-center items-center gap-[5px] bg-color-medium-color rounded-sm whitespace-nowrap hover:bg-color-medium-color/80"
            onClick={toggleAll}
          >
            {!isAnyChecked ? (
              <>
                <ListChecks size={16} />
                <span>Tout cocher</span>
              </>
            ) : (
              <>
                <LayoutList size={16} />
                <span>Tout décocher</span>
              </>
            )}
          </button>

          <div className="flex gap-1">
            {!isAffichage && isAnyChecked && (
              <button
                data-has-background="true"
                onClick={() => handleDelete("delete")}
                className="delete_AttachmentsInfo cursor-pointer px-2 py-1 text-small flex justify-center items-center gap-[5px] bg-danger-color whitespace-nowrap rounded-sm hover:bg-text-color-red"
              >
                <Trash2 size={16} />
                <span>Tout supprimer</span>
              </button>
            )}
            {isAffichage && isAnyChecked && (
              <button
                data-has-background="true"
                onClick={handleDownloadZip}
                className="download_AttachmentsInfo cursor-pointer px-2 py-1 text-small flex justify-center items-center gap-[5px] bg-color-medium-color whitespace-nowrap rounded-sm hover:bg-color-medium-color/80"
              >
                <Download size={16} />
                <span>Télécharge le dossier Zip</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
