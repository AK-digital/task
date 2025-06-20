import { useState, useEffect, useCallback, useMemo } from "react";
import Attachment from "../Attachment/Attachment";
import { Download, LayoutList, ListChecks, Trash2, X } from "lucide-react";
import { BlobWriter, ZipWriter, BlobReader } from "@zip.js/zip.js";
import Image from "next/image";
import Reactions from "../Reactions/Reactions";

export default function AttachmentsInfo({
  attachments,
  setAttachments = null,
  disable = true,
  type = "affichage",
  showPreviewImageMessage,
  setShowPreviewImageMessage,
  isUploading: externalIsUploading = false,
  tooMuchAttachments = false,
  setTooMuchAttachments = null,
  tooHeavyAttachments = false,
  setTooHeavyAttachments = null,
  attachmentSize,
}) {
  const [showAttachments, setShowAttachments] = useState(false);
  const [checkedList, setCheckedList] = useState([]);
  const [fileSizes, setFileSizes] = useState({});
  const [previewImage, setPreviewImage] = useState(null);
  const isUploading = externalIsUploading;

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

  const getFileIcon = useCallback((file) => {
    // Vérifier si c'est un objet File (fichier local) ou une string (URL)
    const isLocalFile = file instanceof File;
    const fileName = isLocalFile ? file.name : file.name || "";
    const fileUrl = isLocalFile ? null : file.url;

    const extension = fileName.split(".").pop()?.toLowerCase();

    // Pour les images, traitement spécial
    const imageExtensions = [
      "png",
      "jpg",
      "jpeg",
      "gif",
      "webp",
      "svg",
      "bmp",
      "ico",
      "heic",
      "heif",
      "avif",
    ];

    if (imageExtensions.includes(extension)) {
      if (isLocalFile) {
        // Pour les fichiers locaux, créer un object URL
        return URL.createObjectURL(file);
      } else {
        // Pour les fichiers distants, utiliser l'URL
        return fileUrl;
      }
    }

    // Pour les autres types de fichiers
    switch (extension) {
      case "pdf":
        return "/icons/icon-PDF.svg";
      case "txt":
        return "/icons/icon-TXT.svg";
      case "doc":
      case "docx":
        return "/icons/icon-word.svg";
      case "xls":
      case "xlsx":
        return "/icons/icon-excel.svg";
      case "ppt":
      case "pptx":
        return "/icons/icon-powerpoint.svg";
      case "zip":
      case "rar":
      case "7z":
        return "/icons/icon-ZIP.svg";
      default:
        return "/icons/file.svg"; // Icône générique
    }
  }, []);

  const getFileSize = useCallback(
    (file) => {
      // Si c'est un objet File (fichier local), utiliser file.size directement
      if (file instanceof File) {
        return file.size;
      }

      // Sinon, c'est un fichier distant, utiliser fileSizes du state
      return fileSizes[file.name] || null;
    },
    [fileSizes]
  );

  const formatFileSize = useCallback((bytes) => {
    if (!bytes && bytes !== 0) return "Taille inconnue";

    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));

    if (i === 0) return `${bytes} ${sizes[i]}`;
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  }, []);

  const getFileSizeFromUrl = useCallback(async (url, fileName) => {
    try {
      const response = await fetch(url, { method: "HEAD" });
      const contentLength = response.headers.get("content-length");

      if (contentLength) {
        const sizeInBytes = parseInt(contentLength, 10);
        setFileSizes((prev) => ({
          ...prev,
          [fileName]: sizeInBytes,
        }));
        return sizeInBytes;
      }
    } catch (error) {
      console.error(
        `Erreur lors de la récupération de la taille de ${fileName}:`,
        error
      );
      setFileSizes((prev) => ({
        ...prev,
        [fileName]: null,
      }));
    }
    return null;
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
      const usedNames = new Set(); // Pour éviter les doublons de noms

      for (let index = 0; index < attachments.length; index++) {
        const file = attachments[index];
        let response;
        let blob;

        try {
          if (file instanceof File) {
            // Pour les fichiers locaux, utiliser directement le fichier
            blob = file;
          } else {
            // Pour les fichiers distants, essayer de les télécharger
            const downloadUrl = getDownloadUrl(file.url);
            response = await fetch(downloadUrl);

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            blob = await response.blob();
          }
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

        // Générer un nom unique pour éviter les conflits
        let fileName = file.name || `file-${Date.now()}-${index}`;
        let uniqueFileName = fileName;
        let counter = 1;

        // Si le nom existe déjà, ajouter un suffixe
        while (usedNames.has(uniqueFileName)) {
          const nameWithoutExt =
            fileName.substring(0, fileName.lastIndexOf(".")) || fileName;
          const extension = fileName.includes(".")
            ? fileName.substring(fileName.lastIndexOf("."))
            : "";
          uniqueFileName = `${nameWithoutExt} (${counter})${extension}`;
          counter++;
        }

        usedNames.add(uniqueFileName);

        await zipWriter.add(uniqueFileName, new BlobReader(blob));
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
  }, [attachments, getDownloadUrl]);

  const handleDeleteAll = useCallback(() => {
    if (!setAttachments) return;
    setAttachments([]);
    setCheckedList([]);
    if (setTooMuchAttachments) {
      setTooMuchAttachments(false); // Réinitialiser l'erreur
    }
  }, [setAttachments]);

  const handleDeleteSingle = useCallback(
    (indexToRemove) => {
      if (!setAttachments) return;

      const newAttachments = attachments.filter(
        (_, index) => index !== indexToRemove
      );
      const newCheckedList = checkedList.filter(
        (_, index) => index !== indexToRemove
      );

      setAttachments(newAttachments);
      setCheckedList(newCheckedList);

      // Réinitialiser l'erreur si on a moins de 10 fichiers après suppression
      if (newAttachments.length < 10 && setTooMuchAttachments) {
        setTooMuchAttachments(false);
      }
    },
    [attachments, checkedList, setAttachments]
  );

  const handleDownloadSingle = useCallback(
    async (file, index) => {
      try {
        if (file instanceof File) {
          // Pour les fichiers locaux, créer un object URL et télécharger
          const url = URL.createObjectURL(file);
          const a = document.createElement("a");
          a.href = url;
          a.download = file.name || `file-${Date.now()}`;
          a.click();
          URL.revokeObjectURL(url);
        } else {
          // Pour les fichiers distants
          const downloadUrl = getDownloadUrl(file.url);
          await handleDownload(downloadUrl, file.name);
        }
      } catch (error) {
        console.error(`Erreur lors du téléchargement de ${file.name}:`, error);
        alert(
          `Erreur lors du téléchargement de ${file.name}. Veuillez réessayer.`
        );
      }
    },
    [getDownloadUrl, handleDownload]
  );

  const openImagePreview = useCallback(
    (file) => {
      // Vérifier si c'est une image
      const isLocalFile = file instanceof File;
      const fileName = isLocalFile ? file.name : file.name || "";
      const extension = fileName.split(".").pop()?.toLowerCase();
      const imageExtensions = [
        "png",
        "jpg",
        "jpeg",
        "gif",
        "webp",
        "bmp",
        "ico",
        "heic",
        "heif",
        "avif",
      ];

      if (imageExtensions.includes(extension)) {
        const iconSrc = getFileIcon(file);
        setPreviewImage(iconSrc);
        setShowPreviewImageMessage(true);
      }
    },
    [getFileIcon]
  );

  const closeImagePreview = useCallback(() => {
    setShowPreviewImageMessage(false);
    setPreviewImage(null);
  }, []);

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

  useEffect(() => {
    // Récupérer les tailles des fichiers distants
    attachments.forEach((file) => {
      if (file.url && file.name && !fileSizes[file.name]) {
        getFileSizeFromUrl(file.url, file.name);
      }
    });
  }, [attachments, fileSizes, getFileSizeFromUrl]);

  // Cleanup des object URLs pour éviter les fuites mémoire
  useEffect(() => {
    return () => {
      attachments.forEach((file) => {
        if (file instanceof File) {
          const objectUrl = getFileIcon(file);
          if (objectUrl && objectUrl.startsWith("blob:")) {
            URL.revokeObjectURL(objectUrl);
          }
        }
      });
    };
  }, [attachments, getFileIcon]);

  return (
    <div
      className="relative flex justify-start flex-col gap-2 border-t border-color-border-color w-full min-w-0"
      // onMouseEnter={() => setShowAttachments(true)}
      // onMouseLeave={() => setShowAttachments(false)}
    >
      <div className="flex items-start gap-2 flex-shrink-0">
        <div className="flex items-start gap-2 ">
          {!disable ? (
            <>
              <span className="group flex justify-center items-center rounded-sm w-11 h-11 mt-4 cursor-pointer bg-primary">
                <Attachment
                  attachments={attachments}
                  setAttachments={setAttachments}
                  label={label}
                  setTooMuchAttachments={setTooMuchAttachments}
                  setTooHeavyAttachments={setTooHeavyAttachments}
                  size={attachmentSize}
                />
              </span>
              <span className="group flex justify-center items-center rounded-sm w-11 h-11 mt-4 cursor-pointer bg-primary">
                <Trash2
                  size={25}
                  onClick={handleDeleteAll}
                  className="cursor-pointer text-accent-color-dark group-hover:text-danger-color"
                />
              </span>
            </>
          ) : (
            <span className="group flex justify-center items-center rounded-sm w-11 h-11 mt-4 cursor-pointer bg-primary">
              <Download
                size={25}
                className="cursor-pointer text-accent-color-dark group-hover:text-accent-color"
                onClick={handleDownloadZip}
              />
            </span>
          )}

          {/* Bouton TOUT pour supprimer ou télécharger toutes les pièces jointes */}
          {/* {attachments.length > 1 && (
          <button
            onClick={isAffichage ? handleDownloadZip : handleDeleteAll}
            className={`flex justify-center items-center gap-1 px-2 py-1 rounded-sm text-xs font-medium transition-colors cursor-pointer ${
              isAffichage
                ? "bg-accent-color text-white hover:bg-accent-color-hover"
                : "bg-danger-color text-white hover:bg-text-color-red"
            }`}
          >
            {isAffichage ? <Download size={14} /> : <Trash2 size={14} />}
            <span>TOUT</span>
          </button>
        )} */}
        </div>
        <div className="items_AttachmentsInfo flex items-center gap-2 overflow-x-auto flex-1 min-w-0 pt-4 pb-1">
          {attachments.map((file, index) => {
            const hasUrl = !!file?.url && isDisplayableFile(file?.url);
            const iconSrc = getFileIcon(file);
            const validIconSrc =
              iconSrc && iconSrc.trim() !== "" ? iconSrc : "/icons/file.svg";

            let downloadUrl;
            if (hasUrl) {
              downloadUrl = getDownloadUrl(file?.url);
            }
            return (
              <div
                key={index}
                className={`relative flex justify-center items-center gap-2 cursor-pointer bg-primary/80 rounded-sm p-1 transition-all duration-200 h-11 hover:translate-y-[-2px] ${
                  !isAffichage ? "hover:bg-secondary" : "hover:bg-third"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  openImagePreview(file);
                }}
              >
                {validIconSrc && (
                  <Image
                    src={validIconSrc}
                    alt={file?.name || "File"}
                    width={35}
                    height={35}
                    className="rounded-sm object-contain aspect-square select-none"
                    unoptimized={validIconSrc.endsWith(".svg")}
                  />
                )}
                <div className="flex flex-col justify-between items-start gap-1 w-25">
                  <span
                    title={file?.name}
                    className="w-25 truncate text-xs text-left"
                  >
                    {file?.name}
                  </span>
                  <span className="text-text-color-muted text-[11px]">
                    {formatFileSize(getFileSize(file))}
                  </span>
                </div>
                <div className="flex flex-col justify-start h-full">
                  {isAffichage ? (
                    <Download
                      size={16}
                      className="text-accent-color-dark hover:text-accent-color cursor-pointer transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadSingle(file, index);
                      }}
                    />
                  ) : (
                    <Trash2
                      size={16}
                      className="text-accent-color-dark hover:text-danger-color cursor-pointer transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSingle(index);
                      }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {isUploading && (
          <div className="flex items-center justify-center min-h-[44px] h-auto z-1000 p-2 mt-4 border-l-2 border-color-border-color">
            <div className="flex items-center gap-2 text-xs text-text-color-muted">
              <div className="w-3 h-3 border-2 border-accent-color border-t-transparent rounded-full animate-spin"></div>
              <span>Envoi en cours...</span>
            </div>
          </div>
        )}

        {/* Preview d'image en plein écran */}
        {showPreviewImageMessage && previewImage && (
          <div
            className="absolute inset-0 w-screen h-screen bg-black bg-opacity-75 flex items-center justify-center"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 99999,
            }}
            onClick={closeImagePreview}
          >
            <div className="relative w-full h-full flex items-center justify-center">
              <button
                onClick={closeImagePreview}
                className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 rounded-full hover:bg-opacity-75 transition-all"
                style={{ zIndex: 100000 }}
              >
                <X size={24} className="text-white" />
              </button>
              <Image
                src={previewImage}
                alt="Preview"
                width={1200}
                height={800}
                className="max-w-[95vw] max-h-[95vh] object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )}
      </div>
      {tooMuchAttachments && (
        <span className="text-xs text-danger-color">
          Vous ne pouvez pas ajouter plus de 10 pièces jointes.
        </span>
      )}
      {tooHeavyAttachments && (
        <span className="text-xs text-danger-color">
          Vous ne pouvez pas ajouter de pièces jointes trop lourdes au delà de
          5MB.
        </span>
      )}
    </div>
  );
}
