"use client";
import { updateDescription } from "@/api/task";
import { instrumentSans } from "@/utils/font";
import "quill/dist/quill.snow.css";
import { useEffect, useRef, useState } from "react";

export default function RichTextEditor({
  placeholder,
  type,
  task,
  setEditDescription,
}) {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState(null);
  const [writting, setWritting] = useState(false);
  const btnMessage = placeholder.includes("description")
    ? "Enregistrer la description"
    : "Envoyer un message";

  const options = {
    placeholder: placeholder,
    theme: "snow",
  };

  const containerRef = useRef(null);
  const quillRef = useRef(null);

  useEffect(() => {
    // On vérifie si nous sommes côté client
    if (
      typeof window !== "undefined" &&
      containerRef?.current &&
      !quillRef.current
    ) {
      // Import dynamique de Quill uniquement côté client
      import("quill").then((Quill) => {
        if (containerRef.current && !quillRef.current) {
          quillRef.current = new Quill.default(containerRef.current, options);

          quillRef.current.on("text-change", () => {
            const htmlContent = quillRef.current.root.innerHTML;

            setContent(htmlContent);
            setWritting(htmlContent.trim().length > 0);
          });
        }
      });
    }
  }, []);

  async function handleSendContent() {
    console.log(content);
    setLoading(true);
    if (placeholder.includes("description")) {
      await updateDescription(task?._id, task?.projectId, content);
      setLoading(false);
      setEditDescription(false);
      return;
    }
  }

  return (
    <>
      <div ref={containerRef}></div>

      {writting && (
        <div>
          <button
            className={instrumentSans.className}
            disabled={loading}
            data-disabled={loading}
            onClick={handleSendContent}
          >
            {btnMessage}
          </button>
          <button className={instrumentSans.className}>Annuler</button>
        </div>
      )}
    </>
  );
}
