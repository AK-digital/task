"use client";
import dynamic from "next/dynamic";
import styles from "@/styles/components/richTextEditor/richTextEditor.module.css";
import { updateDescription } from "@/api/task";
import { instrumentSans } from "@/utils/font";
import { useState } from "react";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import "react-quill/dist/quill.snow.css";

export default function RichTextEditor({
  placeholder,
  type,
  task,
  setEditDescription,
}) {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState(null);
  const isDescription = type === "description";
  const isConversation = type === "conversation";

  const btnMessage = isDescription
    ? "Enregistrer la description"
    : "Envoyer un message";

  async function handleSendContent() {
    setLoading(true);
    if (isDescription) {
      await updateDescription(task?._id, task?.projectId, content);
      setLoading(false);
      setEditDescription(false);
      return;
    }
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

  return (
    <>
      <ReactQuill
        theme="snow"
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        defaultValue={task?.description}
        onChange={(value) => setContent(value)}
      />

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
