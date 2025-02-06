"use client";
import dynamic from "next/dynamic";
import styles from "@/styles/components/richTextEditor/richTextEditor.module.css";
import { updateDescription } from "@/api/task";
import { instrumentSans } from "@/utils/font";
import { useRef, useState } from "react";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import "react-quill/dist/quill.snow.css";
import { saveMessage } from "@/api/message";
import { mutate } from "swr";

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

  function isQuillEmpty(value) {
    if (
      value?.replace(/<(.|\n)*?>/g, "")?.trim()?.length === 0 &&
      !value?.includes("<img")
    ) {
      return true;
    }
    return false;
  }

  async function handleSendContent() {
    const isEmpty = isQuillEmpty(content);

    setLoading(true);

    if (isDescription) {
      if (isEmpty) {
        await updateDescription(task?._id, task?.projectId, "");
      } else {
        console.log(content);
        await updateDescription(task?._id, task?.projectId, content);
      }
    }

    if (isConversation) {
      const res = await saveMessage(task?.projectId, task?._id, content, []);
      if (res?.success) {
        console.log("played");
        mutate(`/message?projectId=${task?.projectId}&taskId=${task?._id}`);
        setContent("");
      }
    }

    setLoading(false);
    setEditDescription(false);
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
        defaultValue={
          (isDescription && task?.description) || (isConversation && "")
        }
        value={content}
        onChange={(value) => {
          setContent(value);
        }}
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
