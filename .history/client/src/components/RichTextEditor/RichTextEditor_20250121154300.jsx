"use client";
import { instrumentSans } from "@/utils/font";
import "quill/dist/quill.snow.css";
import { useEffect, useRef, useState } from "react";

export default function RichTextEditor({ placeholder, type }) {
  const [writting, setWritting] = useState(false);
  const btnMessage = placeholder.includes("description")
    ? "Enregistrer la description"
    : "Envoyer un message";

  const containerRef = useRef(null);
  const quillRef = useRef(null);
  const [isQuillReady, setIsQuillReady] = useState(false);

  useEffect(() => {
    // Nettoyage du conteneur au démontage
    return () => {
      if (quillRef.current) {
        quillRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      containerRef.current &&
      !quillRef.current &&
      !isQuillReady
    ) {
      // Vider le conteneur avant l'initialisation
      containerRef.current.innerHTML = "";

      import("quill").then((Quill) => {
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

        quillRef.current = new Quill.default(containerRef.current, options);
        setIsQuillReady(true);

        quillRef.current.on("text-change", () => {
          const htmlContent = quillRef.current.root.innerHTML;
          console.log(htmlContent);
          setWritting(htmlContent.trim().length > 0);
        });
      });
    }
  }, [placeholder, isQuillReady]);

  return (
    <div className="rich-text-container">
      <div ref={containerRef}></div>

      {writting && (
        <div className="mt-4 flex gap-2">
          <button
            className={`${instrumentSans.className} bg-blue-500 text-white px-4 py-2 rounded`}
          >
            {btnMessage}
          </button>
          <button
            className={`${instrumentSans.className} border border-gray-300 px-4 py-2 rounded`}
          >
            Annuler
          </button>
        </div>
      )}
    </div>
  );
}
