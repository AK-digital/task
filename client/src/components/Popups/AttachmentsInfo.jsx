import { useState, useEffect, useCallback, useMemo } from "react";
import Attachment from "../Attachment/Attachment";
import { Download, Trash, X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw, Maximize, Minimize } from "lucide-react";
import { BlobWriter, ZipWriter, BlobReader } from "@zip.js/zip.js";
import Image from "next/image";
import Reactions from "../Reactions/Reactions";
import { createPortal } from "react-dom";

export default function AttachmentsInfo({
  attachments,
  setAttachments = null,
  disable = true,
  type = "affichage",
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
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
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

  const isViewableFile = useCallback((file) => {
    const isLocalFile = file instanceof File;
    const fileName = isLocalFile ? file.name : file.name || "";
    const extension = fileName.split(".").pop()?.toLowerCase();
    
    const viewableExtensions = [
      // Images
      "png", "jpg", "jpeg", "gif", "webp", "bmp", "ico", "heic", "heif", "avif",
      // PDFs
      "pdf"
    ];

    return viewableExtensions.includes(extension);
  }, []);

  const openLightbox = useCallback((fileIndex) => {
    const file = attachments[fileIndex];
    if (isViewableFile(file)) {
      setCurrentFileIndex(fileIndex);
      setLightboxOpen(true);
      setZoom(1);
      setRotation(0);
    }
  }, [attachments, isViewableFile]);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
    setCurrentFileIndex(0);
    setZoom(1);
    setRotation(0);
    setIsFullscreen(false);
  }, []);

  const navigateLightbox = useCallback((direction) => {
    const viewableFiles = attachments.map((file, index) => ({ file, index }))
      .filter(({ file }) => isViewableFile(file));
    
    const currentViewableIndex = viewableFiles.findIndex(({ index }) => index === currentFileIndex);
    
    let newIndex;
    if (direction === 'next') {
      newIndex = currentViewableIndex < viewableFiles.length - 1 ? currentViewableIndex + 1 : 0;
    } else {
      newIndex = currentViewableIndex > 0 ? currentViewableIndex - 1 : viewableFiles.length - 1;
    }
    
    setCurrentFileIndex(viewableFiles[newIndex].index);
    setZoom(1);
    setRotation(0);
  }, [attachments, currentFileIndex, isViewableFile]);

  const handleZoom = useCallback((direction) => {
    setZoom(prev => {
      if (direction === 'in') {
        return Math.min(prev * 1.2, 3);
      } else {
        return Math.max(prev / 1.2, 0.5);
      }
    });
  }, []);

  const handleRotate = useCallback(() => {
    setRotation(prev => (prev + 90) % 360);
  }, []);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  const getCurrentFileUrl = useCallback(() => {
    const file = attachments[currentFileIndex];
    if (!file) return null;
    
    if (file instanceof File) {
      return URL.createObjectURL(file);
    } else {
      return file.url;
    }
  }, [attachments, currentFileIndex]);

  const getCurrentFileType = useCallback(() => {
    const file = attachments[currentFileIndex];
    if (!file) return null;
    
    const isLocalFile = file instanceof File;
    const fileName = isLocalFile ? file.name : file.name || "";
    const extension = fileName.split(".").pop()?.toLowerCase();
    
    if (["png", "jpg", "jpeg", "gif", "webp", "bmp", "ico", "heic", "heif", "avif"].includes(extension)) {
      return 'image';
    } else if (extension === 'pdf') {
      return 'pdf';
    }
    
    return null;
  }, [attachments, currentFileIndex]);

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

  // Gestion des touches clavier et du scroll pour la lightbox
  useEffect(() => {
    if (!lightboxOpen) return;

    // Empêcher le scroll du body
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'Escape':
          closeLightbox();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          navigateLightbox('prev');
          break;
        case 'ArrowRight':
          e.preventDefault();
          navigateLightbox('next');
          break;
        case '+':
        case '=':
          e.preventDefault();
          handleZoom('in');
          break;
        case '-':
          e.preventDefault();
          handleZoom('out');
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          if (getCurrentFileType() === 'image') {
            handleRotate();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Restaurer le scroll du body
      document.body.style.overflow = originalOverflow;
    };
  }, [lightboxOpen, closeLightbox, navigateLightbox, handleZoom, handleRotate, getCurrentFileType]);

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
                <Trash
                  size={16}
                  onClick={handleDeleteAll}
                  className="cursor-pointer text-accent-color-dark group-hover:text-danger-color"
                />
              </span>
            </>
          ) : (
            <span className="group flex justify-center items-center rounded-sm w-11 h-11 mt-4 cursor-pointer bg-primary">
              <Download
                size={16}
                className="cursor-pointer text-accent-color-dark group-hover:text-accent-color"
                onClick={handleDownloadZip}
              />
            </span>
          )}

      
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
                  if (isViewableFile(file)) {
                    openLightbox(index);
                  }
                }}
                title={isViewableFile(file) ? "Cliquer pour ouvrir dans la lightbox" : file?.name}
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
                    <Trash
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

        {/* Lightbox pour images et PDFs - Utilise un portail pour être au niveau du document */}
        {lightboxOpen && typeof window !== 'undefined' && createPortal(
          <div
            className={`fixed inset-0 w-screen h-screen flex items-center justify-center ${
              isFullscreen ? 'bg-black' : ''
            }`}
            style={{ 
              zIndex: 999999,
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100vw',
              height: '100vh'
            }}
            onClick={isFullscreen ? undefined : closeLightbox}
          >
            <div 
              className={`relative flex items-center justify-center transition-all duration-300 ${
                isFullscreen 
                  ? 'w-full h-full' 
                  : 'w-[85vw] h-[85vh] bg-black bg-opacity-60 rounded-[10px] shadow-2xl'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Bouton plein écran / mode fenêtre */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFullscreen();
                }}
                className="absolute top-6 left-6 p-3 bg-black bg-opacity-70 backdrop-blur-sm rounded-full hover:bg-opacity-90 transition-all shadow-2xl"
                style={{ zIndex: 1000001 }}
                title={isFullscreen ? "Mode fenêtre" : "Plein écran"}
              >
                {isFullscreen ? (
                  <Minimize size={20} className="text-white" />
                ) : (
                  <Maximize size={20} className="text-white" />
                )}
              </button>

              {/* Barre d'outils */}
              <div 
                className="fixed top-6 left-1/2 transform -translate-x-1/2 flex items-center gap-3 bg-primary bg-opacity-70 backdrop-blur-sm rounded-[10px] p-3 shadow-2xl" 
                style={{ zIndex: 1000001 }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleZoom('out');
                  }}
                  className="p-2 text-white hover:bg-white hover:bg-opacity-20 hover:text-accent-color rounded-lg transition-all"
                  title="Zoom arrière"
                >
                  <ZoomOut size={18} />
                </button>
                <span className="text-sm font-medium px-2 min-w-[50px] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleZoom('in');
                  }}
                  className="p-2 text-white hover:bg-white hover:bg-opacity-20 hover:text-accent-color rounded-lg transition-all"
                  title="Zoom avant"
                >
                  <ZoomIn size={18} />
                </button>
                {getCurrentFileType() === 'image' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRotate();
                    }}
                    className="p-2 text-white hover:bg-white hover:bg-opacity-20 hover:text-accent-color rounded-lg transition-all"
                    title="Rotation"
                  >
                    <RotateCw size={18} />
                  </button>
                )}
                <div className="w-px h-6 bg-white bg-opacity-30"></div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const file = attachments[currentFileIndex];
                    handleDownloadSingle(file, currentFileIndex);
                  }}
                  className="p-2 text-white hover:bg-white hover:bg-opacity-20 hover:text-accent-color rounded-lg transition-all"
                  title="Télécharger"
                >
                  <Download size={18} />
                </button>
              </div>

              {/* Bouton fermer */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeLightbox();
                }}
                className="absolute top-6 right-6 p-3 bg-black bg-opacity-70 backdrop-blur-sm rounded-full hover:bg-opacity-90 transition-all shadow-2xl"
                style={{ zIndex: 1000001 }}
              >
                <X size={24} className="text-white" />
              </button>

              {/* Navigation */}
              {attachments.filter(file => isViewableFile(file)).length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateLightbox('prev');
                    }}
                    className={`absolute top-1/2 transform -translate-y-1/2 p-3 bg-primary  bg-opacity-70 backdrop-blur-sm rounded-full hover:bg-opacity-90 transition-all shadow-2xl ${
                      isFullscreen ? 'left-6' : 'left-4'
                    }`}
                    style={{ zIndex: 1000001 }}
                    title="Image précédente"
                  >
                    <ChevronLeft size={28} className="text-accent-color-dark" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateLightbox('next');
                    }}
                    className={`absolute top-1/2 transform -translate-y-1/2 p-3 bg-primary  backdrop-blur-sm rounded-full hover:bg-opacity-90 transition-all ${
                      isFullscreen ? 'right-6' : 'right-4'
                    }`}
                    style={{ zIndex: 1000001 }}
                    title="Image suivante"
                  >
                    <ChevronRight size={28} className="text-accent-color-dark" />
                  </button>
                </>
              )}

              {/* Contenu */}
              <div 
                className={`flex items-center justify-center w-full h-full ${
                  isFullscreen ? 'p-12' : 'p-8'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                {getCurrentFileType() === 'image' && (
                  <Image
                    src={getCurrentFileUrl()}
                    alt={attachments[currentFileIndex]?.name || "Image"}
                    width={1920}
                    height={1080}
                    className="max-w-full max-h-full object-contain transition-transform duration-300 ease-out shadow-2xl"
                    style={{
                      transform: `scale(${zoom}) rotate(${rotation}deg)`,
                    }}
                    unoptimized
                    priority
                  />
                )}
                {getCurrentFileType() === 'pdf' && (
                  <iframe
                    src={getCurrentFileUrl()}
                    className={`w-full h-full border-none shadow-2xl ${
                      isFullscreen ? 'rounded-none' : 'rounded-lg'
                    }`}
                    style={{
                      transform: `scale(${zoom})`,
                      transformOrigin: 'center center',
                      maxWidth: isFullscreen ? '100%' : '90%',
                      maxHeight: isFullscreen ? '100%' : '90%',
                    }}
                    title={attachments[currentFileIndex]?.name || "PDF"}
                  />
                )}
              </div>

              {/* Informations du fichier */}
              <div 
                className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 backdrop-blur-sm rounded-xl p-4 text-white text-center shadow-2xl" 
                style={{ zIndex: 1000001 }}
              >
                <div className="text-sm font-medium mb-1">
                  {attachments[currentFileIndex]?.name}
                </div>
                <div className="text-xs text-gray-300">
                  {attachments.filter(file => isViewableFile(file)).findIndex(file => 
                    attachments.indexOf(file) === currentFileIndex
                  ) + 1} / {attachments.filter(file => isViewableFile(file)).length}
                </div>
              </div>
            </div>
          </div>,
          document.body
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
