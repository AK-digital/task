"use client";
import dynamic from "next/dynamic";
import styles from "@/styles/components/richTextEditor/richTextEditor.module.css";
import { updateDescription } from "@/api/task";
import { instrumentSans } from "@/utils/font";
import { useState, useRef, useEffect } from "react";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import "react-quill/dist/quill.snow.css";
import { saveMessage, updateMessage } from "@/api/message";
import { mutate } from "swr";
import TaggedUsersModal from "../Modals/TaggedUsersModal";

export default function RichTextEditor({
  placeholder,
  type,
  task,
  project,
  message,
  edit,
  setEdit,
  setConvLoading,
  setEditDescription,
}) {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState(message ? message?.message : "");
  const [isTaggedUsers, setIsTaggedUsers] = useState(false);
  const [taggedUsers, setTaggedUsers] = useState([]);
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const quillRef = useRef(null);

  const isDescription = type === "description";
  const isConversation = type === "conversation";

  const btnMessage = isDescription
    ? "Enregistrer la description"
    : "Envoyer un message";

  function isQuillEmpty(value) {
    if (
      value?.replace(/<(.|\n)*?>/g, "")?.trim()?.length === 0 &&
      !value?.includes("<img")
    ) {
      return true;
    }
    return false;
  }

  function getMentionPosition() {
    if (!quillRef.current) return;

    const editor = quillRef.current.getEditor();
    const selection = editor.getSelection();

    if (selection) {
      const bounds = editor.getBounds(selection.index);

      setMentionPosition({
        top: bounds.top, // 10px de marge en dessous du curseur
        left: bounds.left + 20,
      });
    }
  }

  function handleKeydown(e) {
    if (!content.includes("@")) {
      setIsTaggedUsers(false);
    }
    if (e.key === "@") {
      setIsTaggedUsers(true);
      getMentionPosition();
    } else if (e.key === " ") {
      setIsTaggedUsers(false);
    }

    // Empêcher la saisie de texte si isTaggedUsers est true
    if (isTaggedUsers && e.key !== "Backspace" && e.key !== "Delete") {
      e.preventDefault();
    }
  }

  async function handleSendContent() {
    const isEmpty = isQuillEmpty(content);

    setLoading(true);

    if (isDescription) {
      if (isEmpty) {
        await updateDescription(task?._id, task?.projectId, "");
      } else {
        await updateDescription(task?._id, task?.projectId, content);
      }
      setEditDescription(false);
    }

    if (isConversation) {
      const res = await saveMessage(
        task?.projectId,
        task?._id,
        content,
        taggedUsers
      );
      if (res?.success) {
        await mutate(
          `/message?projectId=${task?.projectId}&taskId=${task?._id}`
        );
      }
    }

    if (isConversation && edit) {
      setConvLoading(true);
      setEdit(false);
      const res = await updateMessage(
        message?.projectId,
        message?._id,
        content,
        taggedUsers
      );
      if (res?.success) {
        await mutate(
          `/message?projectId=${message?.projectId}&taskId=${message?.taskId}`
        );
        setConvLoading(false);
      }
    }
    setContent("");
    setLoading(false);
  }

  function getWordBeforeCaret() {
    const editor = quillRef.current.getEditor();
    const selection = editor.getSelection();

    // Récupérer la position du caret
    const textBeforeCaret = editor.getText(0, selection.index);

    // Trouver le dernier mot avant le caret
    const words = textBeforeCaret.split(/\s+/); // Séparer le texte en mots en utilisant les espaces comme délimiteurs
    const lastWord = words[words.length - 1]; // Le dernier mot dans le tableau

    return lastWord;
  }

  // Fonction pour désactiver l'édition si isTaggedUsers est vrai
  useEffect(() => {
    const editor = quillRef.current?.getEditor();
    if (editor) {
      if (isTaggedUsers) {
        editor.disable(); // Désactive l'éditeur sauf la suppression
      } else {
        editor.enable(); // Réactive l'éditeur
      }
    }
  }, [isTaggedUsers]);

  const modules = {};

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "indent",
    "link",
    "image",
  ];

  return (
    <>
      {isDescription && (
        <div className={styles.reactQuill}>
          <ReactQuill
            ref={quillRef}
            theme="snow"
            modules={modules}
            formats={formats}
            placeholder={placeholder}
            defaultValue={isDescription && task?.description}
            onChange={(value) => {
              setContent(value);
              getWordBeforeCaret();
            }}
            onKeyDown={handleKeydown}
          />
          {isTaggedUsers && (
            <TaggedUsersModal
              project={project}
              mentionPosition={mentionPosition}
            />
          )}
        </div>
      )}
      {isConversation && (
        <div className={styles.reactQuill}>
          <ReactQuill
            ref={quillRef}
            theme="snow"
            modules={modules}
            formats={formats}
            placeholder={placeholder}
            value={content}
            onChange={(value) => {
              setContent(value);
              getWordBeforeCaret();
            }}
            onKeyDown={handleKeydown}
          />
          {isTaggedUsers && (
            <TaggedUsersModal
              project={project}
              mentionPosition={mentionPosition}
            />
          )}
        </div>
      )}

      <div className={styles.buttons}>
        <button
          className={instrumentSans.className}
          disabled={loading}
          data-disabled={loading}
          onClick={handleSendContent}
        >
          {btnMessage}
        </button>
        <button
          className={instrumentSans.className}
          onClick={() => {
            setEditDescription(false);
          }}
        >
          Annuler
        </button>
      </div>
    </>
  );
}
