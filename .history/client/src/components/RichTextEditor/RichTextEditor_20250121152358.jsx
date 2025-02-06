"use client";

import { instrumentSans } from "@/utils/font";
import "quill/dist/quill.snow.css";
import { useEffect, useRef, useState } from "react";

export default function RichTextEditor({ placeholder, type }) {
  const [writting, setWritting] = useState(false);
  const [quill, setQuill] = useState(null);

  const btnMessage = placeholder?.includes("description")
    ? "Enregistrer la description"
    : "Envoyer un message";

  const options = {
    placeholder: placeholder,
    theme: "snow",
    modules: {
      toolbar: [
        ["bold", "italic", "underline"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["clean"],
      ],
    },
  };

  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current && !quill) {
      // Importation dynamique de Quill
      import("quill").then((Quill) => {
        const quillInstance = new Quill.default(containerRef.current, options);
        setQuill(quillInstance);

        quillInstance.on("text-change", () => {
          const htmlContent = quillInstance.root.innerHTML;
          setWritting(htmlContent.trim().length > 0);
        });
      });
    }

    // Nettoyage lors du démontage du composant
    return () => {
      if (quill) {
        quill.off("text-change");
      }
    };
  }, []);

  const handleSave = () => {
    if (quill) {
      const content = quill.root.innerHTML;
      console.log("Contenu sauvegardé:", content);
      // Ajoutez ici votre logique de sauvegarde
    }
  };

  const handleCancel = () => {
    if (quill) {
      quill.setText("");
      setWritting(false);
    }
  };

  return (
    <div className="quill-editor-container">
      <div ref={containerRef} className="mb-4"></div>

      {writting && (
        <div className="flex gap-4">
          <button
            onClick={handleSave}
            className={`${instrumentSans.className} px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600`}
          >
            {btnMessage}
          </button>
          <button
            onClick={handleCancel}
            className={`${instrumentSans.className} px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400`}
          >
            Annuler
          </button>
        </div>
      )}
    </div>
  );
}
