"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { useContext, useEffect, useRef, useState, useCallback } from "react";
import { updateTaskDescription } from "@/api/task";
import socket from "@/utils/socket";
import { saveMessage, updateMessage } from "@/api/message";
import { mutate } from "swr";
import MentionsList from "./MentionsList";
import { AuthContext } from "@/context/auth";
import { deleteDraft, saveDraft, updateDraft } from "@/api/draft";
import { useDebouncedCallback } from "use-debounce";
import Attachment from "../Attachment/Attachment";
import Reactions from "../Reactions/Reactions";
import { isMeaningfulContent, isNotEmpty, isStringPlural } from "@/utils/utils";
import AttachmentsInfo from "../Popups/AttachmentsInfo";
import { tiptapOptions } from "@/utils/tiptapOptions";
import Toolbar from "./Toolbar";

export default function Tiptap({
  project,
  task,
  type,
  setEditDescription,
  description,
  setOptimisticDescription,
  setConvOpen,
  message,
  editMessage = false,
  mutateMessage,
  draft,
  mutateDraft,
  handleDeleteMessage,
  handleRemoveDescription,
  setIsMessagePending,
  setMessage,
  showPreviewImageMessage,
  setShowPreviewImageMessage,
}) {
  const [isSent, setIsSent] = useState(false);
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  const [isLoadingDraft, setIsLoadingDraft] = useState(false);
  const [isLoadingDraftInEditor, setIsLoadingDraftInEditor] = useState(false);
  const [tooMuchAttachments, setTooMuchAttachments] = useState(false);
  const [tooHeavyAttachments, setTooHeavyAttachments] = useState(false);
  const isMessage = type === "message";
  const [attachments, setAttachments] = useState(
    isMessage ? message?.files || [] : task?.description?.files || []
  );

  const imgRegex = /<img[^>]*>/i;

  // Utilisation de useDebouncedCallback pour sauvegarder le draft avec un délai
  const debouncedHandleDraft = useDebouncedCallback(async (htmlContent) => {
    if (isSent === false) {
      setIsLoadingDraft(true);
      const response = await saveDraft(
        project?._id,
        task?._id,
        type,
        htmlContent
      );

      // Handle error
      if (!response?.success) {
        // If the draft already exists, update it
        if (response?.message === "Draft already exists") {
          if (value?.length <= 0) {
            setPlainText("");
            setValue("");
            await deleteDraft(response?.data?._id, project?._id);
            await mutateDraft();
          } else {
            const updateResponse = await updateDraft(
              response?.data?._id,
              project?._id,
              htmlContent
            );

            // Si la mise à jour échoue car le draft n'existe plus, essayer de le recréer
            if (
              !updateResponse?.success &&
              updateResponse?.message === "Draft not found"
            ) {
              const recreateResponse = await saveDraft(
                project?._id,
                task?._id,
                type,
                htmlContent
              );
            }

            await mutateDraft();
          }
        } else {
          setPlainText("");
          setValue("");
          return;
        }
      }

      // If the draft is created successfully, we mutate it
      await mutateDraft();
      setIsLoadingDraft(false);
      setIsDraftSaved(true);
    }
  }, 3000); // Délai de 3 secondes

  useEffect(() => {
    async function deleteDraftIfSent() {
      if (isSent && draft?.data?._id) {
        await deleteDraft(draft?.data?._id, project?._id);
        await mutateDraft();
      }
    }

    deleteDraftIfSent();
  }, [isSent]);

  const containerRef = useRef(null);
  const { user, uid } = useContext(AuthContext);
  const [pending, setPending] = useState(false);
  const [plainText, setPlainText] = useState(
    message
      ? message?.message || message
      : type === "description"
      ? description
      : ""
  );
  const [isTaggedUsers, setIsTaggedUsers] = useState(false);

  // Debug: Log when isTaggedUsers changes
  useEffect(() => {
    console.log("🏷️ isTaggedUsers state changed to:", isTaggedUsers);
  }, [isTaggedUsers]);
  const [taggedUsers, setTaggedUsers] = useState([]);
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const [value, setValue] = useState(
    message
      ? message?.message || message
      : type === "description"
      ? description
      : ""
  );

  useEffect(() => {
    if (isDraftSaved) {
      const timer = setTimeout(() => {
        setIsDraftSaved(false);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [isDraftSaved]);

  const handleChange = async (editor) => {
    setPlainText(editor.getHTML());
    setValue(editor.getText());
    setIsSent(false);

    const hasImg = imgRegex.test(editor.getHTML());
    if (draft) {
      if (!hasImg && !editor.getText() && !isLoadingDraftInEditor) {
        await deleteDraft(draft?.data?._id, project?._id);
        setIsSent(true);
      } else if (isLoadingDraftInEditor) {
      } else {
        debouncedHandleDraft(editor.getHTML());
      }
    }

    // Gérer les mentions - Utiliser la position du curseur pour détecter les mentions
    const { from } = editor.state.selection;

    // Récupérer le texte autour de la position du curseur
    const textBeforeCursor = editor.state.doc.textBetween(
      Math.max(0, from - 20), // Limiter à 20 caractères avant le curseur
      from
    );

    console.log("🔤 Mention detection:", {
      textBeforeCursor: textBeforeCursor,
      cursorPosition: from,
      wasTaggedUsers: isTaggedUsers,
    });

    // Vérifier si il y a un @ suivi de caractères avant le curseur
    const mentionRegex = /@(\w*)$/;
    const match = mentionRegex.exec(textBeforeCursor);

    if (match) {
      console.log("📍 Mention detected, setting isTaggedUsers to TRUE");
      setIsTaggedUsers(true);

      // Récupérer la position du caret
      const coords = editor.view.coordsAtPos(from);

      // Récupérer la position de l'éditeur
      const editorElement = containerRef.current;
      const editorRect = editorElement.getBoundingClientRect();

      // Calculer la position relative à l'éditeur
      setMentionPosition({
        top: coords.top - editorRect.top, // Ajouter un petit décalage pour un meilleur affichage
        left: coords.left - editorRect.left,
      });
    } else {
      console.log("🚫 No mention detected, setting isTaggedUsers to FALSE");
      setIsTaggedUsers(false);
    }
  };

  const editor = useEditor(
    tiptapOptions(type, value, isTaggedUsers, handleChange)
  );

  // Effet pour charger le draft dans l'éditeur une fois qu'il est prêt
  useEffect(() => {
    if (
      editor &&
      !editor.isDestroyed &&
      draft?.success &&
      draft?.data?.content &&
      !isSent
    ) {
      setIsLoadingDraftInEditor(true);
      editor.commands.setContent(draft.data.content);

      // SYNCHRONISER LES STATES avec le contenu de l'éditeur SEULEMENT si différent
      const newHTML = editor.getHTML();
      const newText = editor.getText();

      if (plainText !== newHTML) {
        setPlainText(newHTML);
      }

      if (value !== newText) {
        setValue(newText);
      }

      // Empêcher la suppression automatique pendant 1 seconde
      setTimeout(() => {
        setIsLoadingDraftInEditor(false);
      }, 1000);
    }
  }, [editor, draft?.success, draft?.data?.content, isSent]);

  useEffect(() => {
    // Regex to match all span tags with data-id attribute
    const regex = /<span[^>]*data-id="([^"]*)"[^>]*>.*?<\/span>/g;

    if (plainText) {
      const matchAll = plainText?.matchAll(regex); // Get all matches
      const matches = Array?.from(matchAll); // Set all matches to an array

      setTaggedUsers([]); // Reset taggedUsers

      matches.forEach((match) => {
        const dataId = match[1]; // match[1] is the data-id attribute

        // Checks if the dataId is already in the taggedUsers array
        setTaggedUsers((prev) => {
          if (!prev.includes(dataId)) {
            return [...prev, dataId]; // If not, we add it
          }
          return prev; // Else we return the previous state
        });
      });
    }
  }, [plainText]);

  if (!editor) {
    return null;
  }

  const handleSaveDescription = async () => {
    const currentAuthor = task?.description?.author;
    const isAuthor = currentAuthor?._id === uid;

    if (currentAuthor && !isAuthor && task?.description?.text) {
      return;
    }

    let finalHTML = editor.getHTML();
    let finalText = editor.getText()?.trim(); // Texte brut, pas HTML

    const isAutoGeneratedText =
      finalText === "Voir pièce jointe" || finalText === "Voir pièces jointes";

    const hasImg = imgRegex.test(finalHTML);
    let descriptionDeleted = false;

    // Si il n'y a pas de texte significatif ET pas d'images dans l'éditeur ET il y a des attachments
    if (!finalText && !hasImg && attachments.length > 0) {
      if (attachments.length > 1) {
        finalText = "Voir pièces jointes";
        finalHTML = "Voir pièces jointes";
      } else if (attachments.length === 1) {
        finalText = "Voir pièce jointe";
        finalHTML = "Voir pièce jointe";
      } else {
        descriptionDeleted = true;
        handleRemoveDescription();
      }

      setPlainText(finalText);
    }

    setPending(true);
    setOptimisticDescription(hasImg ? finalHTML : finalText); // Optimistic update

    if (draft?.success) {
      await deleteDraft(draft?.data?._id, project?._id);
    }

    // Déterminer le contenu à envoyer
    const contentToSend =
      hasImg || finalText ? finalHTML : finalText || "Voir pièce jointe";

    let response;
    if (!descriptionDeleted) {
      response = await updateTaskDescription(
        task?._id,
        task?.projectId?._id,
        contentToSend,
        taggedUsers,
        attachments
      );
    }

    // Handle error
    if (!response?.success) {
      setPlainText("");
      setPending(false);
      return;
    }

    setIsSent(true);
    await mutate(`/task?projectId=${project?._id}&archived=false`);

    // Update description for every guests
    socket.emit("update task", task?.projectId?._id);

    const message = {
      title: `${user?.firstName} vous a mentionné(e) dans une description`,
      content: `Vous venez d'être mentionné(e) dans une description "${project?.name}".`,
    };
    const link = `/projects/${response?.data?.projectId}/task/${task?._id}`;

    for (const taggedUser of taggedUsers) {
      socket.emit("create notification", user, taggedUser, message, link);
    }

    // Reset editor
    setPlainText("");
    setEditDescription(false);
    setPending(false);
  };

  const handleMessage = async () => {
    if (editMessage === false) {
      setIsMessagePending(true);
    }
    setPending(true);

    if (draft?.success) {
      await deleteDraft(draft?.data?._id, project?._id);
      await mutateDraft();
    }

    let response;
    let finalHTML = editor.getHTML();
    let finalText = editor.getText()?.trim(); // Texte brut, pas HTML

    if (editMessage === false) {
      setMessage(finalHTML); // On stocke le HTML complet pour l'affichage pending
    }

    const isAutoGeneratedText =
      finalText === "Voir pièce jointe" || finalText === "Voir pièces jointes";

    const hasImg = imgRegex.test(finalHTML);
    let messageDeleted = false;

    // Si il n'y a pas de texte significatif ET pas d'images dans l'éditeur ET il y a des attachments
    if (!finalText && !hasImg && attachments.length > 0) {
      if (attachments.length > 1) {
        finalText = "Voir pièces jointes";
        finalHTML = "Voir pièces jointes";
      } else if (attachments.length === 1) {
        finalText = "Voir pièce jointe";
        finalHTML = "Voir pièce jointe";
      } else {
        messageDeleted = true;
        handleDeleteMessage();
      }
      setPlainText(finalText);
    }

    // Déterminer le contenu à envoyer
    const contentToSend =
      hasImg || finalText ? finalHTML : finalText || "Voir pièce jointe";

    if (!editMessage) {
      response = await saveMessage(
        task?.projectId?._id,
        task?._id,
        contentToSend,
        taggedUsers,
        attachments
      );
    } else if (!messageDeleted) {
      response = await updateMessage(
        task?.projectId?._id,
        message?._id,
        contentToSend,
        taggedUsers,
        attachments
      );
    }

    if (!response?.success) {
      setPlainText("");
      setValue("");
      setPending(false);
      setConvOpen("");
      return;
    }

    setIsSent(true);

    if (!editMessage) {
      await mutate(
        `/message?projectId=${task?.projectId?._id}&taskId=${task?._id}`
      );
    } else {
      await mutateMessage();
    }

    if (editMessage === false) {
      setIsMessagePending(false);
    }

    await mutate(`/task?projectId=${project?._id}&archived=false`);

    socket.emit("update message", task?.projectId?._id);
    socket.emit("update task", task?.projectId?._id);

    const messageNotif = {
      title: `${user?.firstName} vous a mentionné(e) dans une conversation`,
      content: `Vous venez d'être mentionné(e) dans une conversation "${project?.name}".`,
    };

    const link = `/projects/${task?.projectId?._id}/task/${task?._id}`;

    for (const taggedUser of taggedUsers) {
      socket.emit("create notification", user, taggedUser, messageNotif, link);
    }

    setPlainText("");
    setValue("");
    if (editMessage === false) {
      setMessage("");
    }
    setPending(false);
    setConvOpen("");
  };

  const handleCancel = (e) => {
    e.preventDefault();

    if (type === "description") {
      // Fermer l'édition de la description et nettoyer les champs
      setEditDescription("");
      setPlainText("");
      setValue("");

      if (setOptimisticDescription) {
        setOptimisticDescription(task?.description?.text || "");
      }
    } else {
      // Comportement par défaut pour les messages
      setConvOpen("");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();

    if (!editor) return;

    const files = e.dataTransfer?.files;
    if (!files || files.length === 0) return;

    // Lire chaque fichier image et l'ajouter à l'éditeur
    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();

        reader.onload = () => {
          const url = reader.result;
          editor.chain().focus().setImage({ src: url }).run();
        };

        reader.readAsDataURL(file);
      }
    });
  };

  const checkIfDisabled = () => {
    if (pending) return true;

    const hasAttachments = attachments && attachments.length > 0;
    const hasImages = editor && imgRegex.test(editor.getHTML());
    const hasText = editor && editor.getText().trim().length > 0;

    // On peut envoyer s'il y a des attachments, des images, ou du texte
    return !(hasAttachments || hasImages || hasText);
  };

  return (
    <>
      <div
        className="relative flex flex-col resize-none w-full border border-[#ddd] rounded-lg bg-third min-w-full max-w-full min-h-[250px]"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        ref={containerRef}
      >
        {/* Barre d'outils */}
        <Toolbar editor={editor} />
        {/* Contenu de l'éditeur */}
        <EditorContent
          editor={editor}
          className="content_Tiptap flex-1 min-h-[150px] p-[15px] text-[16px] outline-none rounded-t-none rounded-b-lg cursor-text"
        />
        {isNotEmpty([...attachments]) && (
          <Reactions
            element={message}
            project={project}
            task={task}
            mutateMessage={mutateMessage}
            type={"editor"}
            editor={editor}
          />
        )}
        {isTaggedUsers && (
          <MentionsList
            project={project}
            mentionPosition={mentionPosition}
            editor={editor}
            setIsTaggedUsers={setIsTaggedUsers}
          />
        )}
        {isLoadingDraft && (
          <div className="absolute right-2.5 bottom-1 text-small text-text-color-muted">
            <span>Brouillon en cours d'enregistrement...</span>
          </div>
        )}
        {isDraftSaved && !isLoadingDraft && (
          <div className="absolute right-2.5 bottom-1 text-small text-text-color-muted">
            <span>Brouillon enregistré</span>
          </div>
        )}
        <div className="relative flex items-center gap-2 p-2">
          {isNotEmpty([...attachments]) && (
            <div className="w-full min-w-0 h-full">
              <AttachmentsInfo
                attachments={attachments}
                setAttachments={setAttachments}
                disable={false}
                type="edition"
                showPreviewImageMessage={showPreviewImageMessage}
                setShowPreviewImageMessage={setShowPreviewImageMessage}
                isUploading={pending}
                tooMuchAttachments={tooMuchAttachments}
                setTooMuchAttachments={setTooMuchAttachments}
                tooHeavyAttachments={tooHeavyAttachments}
                setTooHeavyAttachments={setTooHeavyAttachments}
                attachmentSize={25}
              />
              <p className="text-sm text-gray-600">
                {attachments.length} {isStringPlural("fichier", attachments)}{" "}
                {isStringPlural("ajouté", attachments)}
              </p>
            </div>
          )}
          {!isNotEmpty([...attachments]) && (
            <div className="flex items-center gap-2">
              <Attachment
                attachments={attachments}
                setAttachments={setAttachments}
                editor={editor}
                label="Ajouter une pièce jointe"
                className="group cursor-pointer"
                setTooMuchAttachments={setTooMuchAttachments}
                setTooHeavyAttachments={setTooHeavyAttachments}
                size={18}
              />
              <Reactions
                element={message}
                project={project}
                task={task}
                mutateMessage={mutateMessage}
                type={"editor"}
                editor={editor}
              />
            </div>
          )}
        </div>
      </div>
      <div className="actions_Tiptap flex items-center gap-2 ml-auto">
        {type === "description" && (
          <>
            <button
              className="font-bricolage p-0 bg-transparent border-none text-text-dark-color font-normal text-normal mr-3 hover:text-accent-color-light hover:bg-transparent shadow-none"
              onClick={handleCancel}
            >
              Annuler
            </button>
            <button
              className="font-bricolage"
              data-disabled={checkIfDisabled()}
              disabled={checkIfDisabled()}
              onClick={handleSaveDescription}
            >
              Enregistrer la description
            </button>
          </>
        )}
        {type === "message" && (
          <>
            <button
              className="font-bricolage p-0 bg-transparent border-none text-text-dark-color font-normal text-normal mr-3 hover:text-accent-color-light hover:bg-transparent shadow-none"
              onClick={handleCancel}
            >
              Annuler
            </button>
            <button
              className="font-bricolage"
              data-disabled={checkIfDisabled()}
              disabled={checkIfDisabled()}
              onClick={handleMessage}
            >
              {editMessage ? "Modifier" : "Envoyer"} le message
            </button>
          </>
        )}
      </div>
    </>
  );
}
