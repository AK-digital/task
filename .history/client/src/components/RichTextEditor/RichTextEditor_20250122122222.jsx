"use client";
import styles from "@/styles/components/richTextEditor/richTextEditor.module.css";
import { updateDescription } from "@/api/task";
import { instrumentSans } from "@/utils/font";
import ReactQuill, { Quill } from "react-quill-new";
import ImageUploader from "quill-image-uploader";
import "react-quill/dist/quill.snow.css";
import "quill/dist/quill.snow.css";
import { useState } from "react";

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

  // #2 register module
  Quill.register("modules/imageUploader", ImageUploader);

  // useEffect(() => {
  //   // On vérifie si nous sommes côté client
  //   if (
  //     typeof window !== "undefined" &&
  //     containerRef?.current &&
  //     !quillRef.current
  //   ) {
  //     // Import dynamique de Quill uniquement côté client
  //     import("quill").then((Quill) => {
  //       if (containerRef.current && !quillRef.current) {
  //         quillRef.current = new Quill.default(containerRef.current, options);
  //         const initialContent = isDescription && task?.description;

  //         quillRef.current.clipboard.dangerouslyPasteHTML(initialContent);

  //         quillRef.current.on("text-change", () => {
  //           const htmlContent = quillRef.current.root.innerHTML;
  //           console.log(htmlContent);
  //           setContent(htmlContent);
  //         });
  //       }
  //     });
  //   }
  // }, []);

  async function handleSendContent() {
    setLoading(true);
    if (isDescription) {
      await updateDescription(task?._id, task?.projectId, content);
      setLoading(false);
      setEditDescription(false);
      return;
    }
  }

  const modules = {
    // #3 Add "image" to the toolbar
    toolbar: [["bold", "italic", "image"]],
    // # 4 Add module and upload function
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
              console.log(result);
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
    "imageBlot", // #5 Optinal if using custom formats
  ];

  return (
    <>
      <ReactQuill theme="snow" modules={modules} formats={formats}>
        <div></div>
      </ReactQuill>
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
          onClick={(e) => {
            setEditDescription(false);
          }}
        >
          Annuler
        </button>
      </div>
    </>
  );
}
