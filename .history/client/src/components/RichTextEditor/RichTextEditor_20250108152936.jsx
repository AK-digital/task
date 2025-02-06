"use client";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { useEffect, useRef, useState } from "react";

export default function RichTextEditor({ placeholder }) {
  const [writting, setWritting] = useState(false);
  const options = {
    placeholder: placeholder,
    theme: "snow",
  };
  const containerRef = useRef(null);
  const quillRef = useRef(null); // Pour stocker l'instance de Quill

  useEffect(() => {
    if (containerRef.current && !quillRef.current) {
      // Initialiser Quill uniquement si non encore initialisé
      quillRef.current = new Quill(containerRef.current, options);

      quillRef.current.on("text-change", () => {
        const htmlContent = quillRef.current.root.textContent; // Obtenir le contenu HTML

        if (htmlContent.length <= 0) {
          setWritting(false);
        } else {
          setWritting(true);
        }
      });
    }
  }, []);

  return (
    <>
      <div ref={containerRef}></div>{" "}
      {writting && (
        <div
          style={{
            display: "flex",
          }}
        >
          <div>
            <button>Envoyer</button>
            <button>Annuler</button>
          </div>
          <div>
            <button>Joindre des fichiers</button>
          </div>
        </div>
      )}
    </>
  );
}
