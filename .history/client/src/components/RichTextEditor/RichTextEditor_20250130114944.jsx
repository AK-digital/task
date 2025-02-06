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
        top: bounds.bottom - 15, // 10px de marge en dessous du curseur
        left: bounds.left + 15,
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

  console.log(project.guests);

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
            }}
            onKeyDown={handleKeydown}
          />
          {isTaggedUsers && (
            <div
              className={styles.taggedUsersModal}
              style={{
                position: "absolute",
                top: `${mentionPosition.top}px`,
                left: `${mentionPosition.left}px`,
                zIndex: 1000,
                backgroundColor: "white",
                border: "1px solid #ddd",
                borderRadius: "4px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                padding: "8px",
                minWidth: "200px",
                maxHeight: "300px",
                overflowY: "auto",
              }}
            >
              {/* Votre liste d'utilisateurs ici */}
              <ul>
                {project?.guests.map((guest) => {
                  return <li>{guest?.firstName}</li>;
                })}
              </ul>
            </div>
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
            }}
            onKeyDown={handleKeydown}
          />
          {isTaggedUsers && (
            <TaggedUsersModal project={project}/>
            <div
              className={styles.taggedUsersModal}
              style={{
                position: "absolute",
                top: `${mentionPosition.top}px`,
                left: `${mentionPosition.left}px`,
                zIndex: 1000,
                backgroundColor: "white",
                border: "1px solid #ddd",
                borderRadius: "4px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                padding: "8px",
              }}
            >
              {/* Votre liste d'utilisateurs ici */}
              <ul>
                {project?.guests.map((guest) => {
                  return <li>{guest?.firstName}</li>;
                })}
              </ul>
            </div>
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
