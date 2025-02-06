"use client";
import styles from "@/styles/components/richTextEditor/richTextEditor.module.css";
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
  const isDescription = type === "description";
  const isConversation = type === "conversation";

  const btnMessage = isDescription
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
          const initialContent = isDescription && task?.description;

          quillRef.current.clipboard.dangerouslyPasteHTML(initialContent);

          quillRef.current.on("text-change", () => {
            const htmlContent = quillRef.current.root.innerHTML;

            setContent(htmlContent);
          });
        }
      });
    }
    // Fonction de nettoyage
    return () => {
      if (quillRef.current) {
        // Supprimer tous les event listeners
        quillRef.current.off("text-change");

        // Détruire l'instance de Quill
        const editor = quillRef.current.container;
        if (editor && editor.parentNode) {
          editor.parentNode.removeChild(editor);
        }

        // Réinitialiser la référence
        quillRef.current = null;
      }
    };
  }, []);

  async function handleSendContent() {
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
