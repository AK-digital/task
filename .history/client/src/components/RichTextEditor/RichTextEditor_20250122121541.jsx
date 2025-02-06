"use client";
import styles from "@/styles/components/richTextEditor/richTextEditor.module.css";
import { updateDescription } from "@/api/task";
import { instrumentSans } from "@/utils/font";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useState } from "react";

export default function RichTextEditor({
  placeholder,
  type,
  task,
  setEditDescription,
}) {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState(task?.description || "");
  const isDescription = type === "description";

  const btnMessage = isDescription
    ? "Enregistrer la description"
    : "Envoyer un message";

  const modules = {
    toolbar: [["bold", "italic", "underline", "strike", "image"]],
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
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "link",
    "image",
  ];

  async function handleSendContent() {
    setLoading(true);
    if (isDescription) {
      try {
        await updateDescription(task?._id, task?.projectId, content);
        setEditDescription(false);
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <div>
      <ReactQuill
        theme="snow"
        value={content}
        onChange={setContent}
        placeholder={placeholder}
        modules={modules}
        formats={formats}
      />
      <div className={styles.buttons}>
        <button
          className={instrumentSans.className}
          disabled={loading}
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
    </div>
  );
}
