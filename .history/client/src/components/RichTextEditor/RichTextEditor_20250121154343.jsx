"use client";
import { instrumentSans } from "@/utils/font";
import "quill/dist/quill.snow.css";
import { useEffect, useRef, useState } from "react";

export default function RichTextEditor({ placeholder, type }) {
  const [writting, setWritting] = useState(false);
  const btnMessage = placeholder.includes("description")
    ? "Enregistrer la description"
    : "Envoyer un message";

  const editorRef = useRef(null);
  const quillRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const init = async () => {
      // Si Quill est déjà initialisé, on ne fait rien
      if (quillRef.current) return;

      // On s'assure que l'élément existe
      if (!editorRef.current) return;

      try {
        // Import dynamique de Quill
        const Quill = (await import('quill')).default;

        // Création d'un nouveau div pour l'éditeur
        const editor = document.createElement('div');
        editorRef.current.innerHTML = ''; // On vide le conteneur
        editorRef.current.appendChild(editor);

        // Configuration de Quill
        const options = {
          placeholder: placeholder,
          theme: "snow",
          modules: {
            toolbar: [
              ['bold', 'italic', 'underline'],
              [{ 'list': 'ordered'}, { 'list': 'bullet' }],
              ['clean']
            ]
          }
        };

        // Initialisation de Quill
        quillRef.current = new Quill(editor, options);

        // Event listener
        quillRef.current.on("text-change", () => {
          const htmlContent = quillRef.current.root.innerHTML;
          setWritting(htmlContent.trim().length > 0);
        });
      } catch (error) {
        console.error('Erreur lors de l'initialisation de Quill:', error);
      }
    };

    init();

    // Cleanup
    return () => {
      if (quillRef.current) {
        quillRef.current = null;
        if (editorRef.current) {
          editorRef.current.innerHTML = '';
        }
      }
    };
  }, [placeholder]);

  return (
    <div className="rich-text-container">
      <div ref={editorRef} />
      
      {writting && (
        <div className="mt-4 flex gap-2">
          <button className={`${instrumentSans.className} bg-blue-500 text-white px-4 py-2 rounded`}>
            {btnMessage}
          </button>
          <button className={`${instrumentSans.className} border border-gray-300 px-4 py-2 rounded`}>
            Annuler
          </button>
        </div>
      )}
    </div>
  );
}