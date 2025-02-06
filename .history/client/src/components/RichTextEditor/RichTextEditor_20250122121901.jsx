"use client";
import { useState, useEffect } from "react";
import { updateDescription } from "@/api/task";
import { instrumentSans } from "@/utils/font";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import styles from "@/styles/components/richTextEditor/richTextEditor.module.css";

// Import ReactQuill dynamically with ssr disabled
const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import("react-quill");
    return function comp({ forwardedRef, ...props }) {
      return <RQ ref={forwardedRef} {...props} />;
    };
  },
  { ssr: false }
);

export default function RichTextEditor({
  placeholder,
  type,
  task,
  setEditDescription,
}) {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState(task?.description || "");
  const [mounted, setMounted] = useState(false);

  const isDescription = type === "description";
  const isConversation = type === "conversation";

  const btnMessage = isDescription
    ? "Enregistrer la description"
    : "Envoyer un message";

  useEffect(() => {
    setMounted(true);
  }, []);

  const modules = {
    toolbar: [["bold", "italic", "image"]],
    imageUploader: {
      upload: (file) => {
        return new Promise((resolve, reject) => {
          const formData = new FormData();
          formData.append("image", file);

          fetch(
            "https://api.imgbb.com/1/upload?key=d36eb6591370ae7f9089d85875e56b22",
            {
              method: "POST",
              body: formData,
            }
          )
            .then((response) => response.json())
            .then((result) => {
              resolve(result.data.url);
            })
            .catch((error) => {
              reject("Upload failed");
              console.error("Error:", error);
            });
        });
      },
    },
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
    "imageBlot",
  ];

  async function handleSendContent() {
    setLoading(true);
    if (isDescription) {
      await updateDescription(task?._id, task?.projectId, content);
      setLoading(false);
      setEditDescription(false);
      return;
    }
  }

  if (!mounted) {
    return null;
  }

  return (
    <>
      <ReactQuill
        theme="snow"
        modules={modules}
        formats={formats}
        value={content}
        onChange={setContent}
        placeholder={placeholder}
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
          onClick={() => setEditDescription(false)}
        >
          Annuler
        </button>
      </div>
    </>
  );
}
