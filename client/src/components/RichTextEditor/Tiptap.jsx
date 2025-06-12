"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { useContext, useEffect, useRef, useState } from "react";
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
import { isMeaningfulContent, isNotEmpty } from "@/utils/utils";
import AttachmentsInfo from "../Popups/AttachmentsInfo";
import { useTranslation } from "react-i18next";
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
  editMessage,
  mutateMessage,
  draft,
  mutateDraft,
  handleDeleteMessage,
  handleRemoveDescription,
  setIsMessagePending,
  setMessage,
}) {
  const { t } = useTranslation();
  const [isSent, setIsSent] = useState(false);
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  const [isLoadingDraft, setIsLoadingDraft] = useState(false);
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
            await updateDraft(response?.data?._id, project?._id, htmlContent);
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
      await deleteDraft(draft?.data?._id, project?._id);
      await mutateDraft();
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
      if (!hasImg && !editor.getText()) {
        await deleteDraft(draft?.data?._id, project?._id);
        setIsSent(true);
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

    // Vérifier si il y a un @ suivi de caractères avant le curseur
    const mentionRegex = /@(\w*)$/;
    const match = mentionRegex.exec(textBeforeCursor);

    if (match) {
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
      setIsTaggedUsers(false);
    }
  };

  const editor = useEditor(
    tiptapOptions(t, value, isTaggedUsers, handleChange)
  );

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

    let finalText = plainText?.trim();

    const isAutoGeneratedText =
      finalText === t("editor.see_attachment") ||
      finalText === t("editor.see_attachments");

    const hasImg = imgRegex.test(editor.getHTML());
    let descriptionDeleted = false;
    if (!isMeaningfulContent(finalText) || isAutoGeneratedText) {
      if (attachments.length > 1) {
        finalText = t("editor.see_attachments");
      } else if (attachments.length === 1) {
        finalText = t("editor.see_attachment");
      } else if (!hasImg) {
        descriptionDeleted = true;
        handleRemoveDescription();
      }

      setPlainText(finalText);
    }

    setPending(true);
    setOptimisticDescription(finalText); // Optimistic update

    if (draft?.success) {
      await deleteDraft(draft?.data?._id, project?._id);
    }

    let response;
    if (!descriptionDeleted) {
      response = await updateTaskDescription(
        task?._id,
        task?.projectId?._id,
        finalText,
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

    const messageNotif = {
      type: "mention",
      params: {
        projectName: project?.name,
      },
    };
    const link = `/projects/${response?.data?.projectId}/task/${task?._id}`;

    for (const taggedUser of taggedUsers) {
      socket.emit("create notification", user, taggedUser, messageNotif, link);
    }

    // Reset editor
    setPlainText("");
    setEditDescription(false);
    setPending(false);
  };

  const handleMessage = async () => {
    setIsMessagePending(true);
    setPending(true);
    setConvOpen(false);

    if (draft?.success) {
      await deleteDraft(draft?.data?._id, project?._id);
      await mutateDraft();
    }

    let response;
    let finalText = plainText?.trim();

    setMessage(finalText);

    const isAutoGeneratedText =
      finalText === t("editor.see_attachment") ||
      finalText === t("editor.see_attachments");

    const hasImg = imgRegex.test(editor.getHTML());
    let messageDeleted = false;
    if (!isMeaningfulContent(finalText) || isAutoGeneratedText) {
      if (attachments.length > 1) {
        finalText = t("editor.see_attachments");
      } else if (attachments.length === 1) {
        finalText = t("editor.see_attachment");
      } else if (!hasImg) {
        messageDeleted = true;
        handleDeleteMessage();
      }
      setPlainText(finalText);
    }

    if (!editMessage) {
      response = await saveMessage(
        task?.projectId?._id,
        task?._id,
        finalText,
        taggedUsers,
        attachments
      );
    } else if (!messageDeleted) {
      response = await updateMessage(
        task?.projectId?._id,
        message?._id,
        finalText,
        taggedUsers,
        attachments
      );
    }

    if (!response?.success) {
      setPlainText("");
      setValue("");
      setPending(false);
      setConvOpen(false);
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

    setIsMessagePending(false);

    await mutate(`/task?projectId=${project?._id}&archived=false`);

    socket.emit("update message", task?.projectId?._id);
    socket.emit("update task", task?.projectId?._id);

    const messageNotif = {
      type: "mention",
      params: {
        projectName: project?.name,
      },
    };

    const link = `/projects/${task?.projectId?._id}/task/${task?._id}`;

    for (const taggedUser of taggedUsers) {
      socket.emit("create notification", user, taggedUser, messageNotif, link);
    }

    setPlainText("");
    setValue("");
    setMessage("");
    setPending(false);
  };

  const handleCancel = (e) => {
    e.preventDefault();

    setConvOpen(false);
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

    if (attachments && attachments.length > 0) {
      return false;
    }

    if (plainText && imgRegex.test(plainText)) {
      return false;
    }

    if (!plainText && !value) {
      return true;
    }

    if (value?.length <= 0) {
      return true;
    }

    return false;
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
            <span>{t("editor.draft_saving")}</span>
          </div>
        )}
        {isDraftSaved && !isLoadingDraft && (
          <div className="absolute right-2.5 bottom-1 text-small text-text-color-muted">
            <span>{t("editor.draft_saved")}</span>
          </div>
        )}
        <div className="relative flex items-center gap-2 ml-2 mb-2 mt-auto">
          <Attachment
            attachments={attachments}
            setAttachments={setAttachments}
          />
          {isNotEmpty([...attachments]) && (
            <AttachmentsInfo
              attachments={attachments}
              setAttachments={setAttachments}
              disable={false}
              type="edition"
            />
          )}
          {!isNotEmpty([...attachments]) && (
            <Attachment
              attachments={attachments}
              setAttachments={setAttachments}
              label={t("editor.add_attachment")}
              className="cursor-pointer"
            />
          )}
          <Reactions
            element={message}
            project={project}
            task={task}
            mutateMessage={mutateMessage}
            type={"editor"}
            editor={editor}
          />
        </div>
      </div>
      <div className="actions_Tiptap flex items-center gap-2 ml-auto">
        {type === "description" && (
          <button
            className="font-bricolage"
            data-disabled={checkIfDisabled()}
            disabled={checkIfDisabled()}
            onClick={handleSaveDescription}
          >
            {t("editor.save_description")}
          </button>
        )}
        {type === "message" && (
          <>
            <button
              className="font-bricolage p-0 bg-transparent border-none text-text-dark-color font-normal text-normal mr-3 hover:text-accent-color-light hover:bg-transparent shadow-none"
              onClick={handleCancel}
            >
              {t("editor.cancel")}
            </button>
            <button
              className="font-bricolage"
              data-disabled={checkIfDisabled()}
              disabled={checkIfDisabled()}
              onClick={handleMessage}
            >
              {editMessage ? t("editor.edit") : t("editor.send")}{" "}
              {t("editor.message")}
            </button>
          </>
        )}
      </div>
    </>
  );
}
