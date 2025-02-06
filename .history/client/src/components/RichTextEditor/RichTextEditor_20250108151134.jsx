"use client";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { useEffect, useRef } from "react";

export default function RichTextEditor({ placeholder, writting, setWritting }) {
  const options = {
    placeholder: placeholder,
    theme: "snow",
  };
  const containerRef = useRef(null);
  const quillRef = useRef(null); // Pour stocker l'instance de Quill

  useEffect(() => {
    // Initialiser Quill uniquement si non encore initialisé
    quillRef.current = new Quill(containerRef.current, options);

    quillRef.current.on("text-change", () => {
      const htmlContent = quillRef.current.root.innerHTML; // Obtenir le contenu HTML

      if (htmlContent.trim === "") {
        setWritting("");
      }

      if (quillRef.current.options.placeholder === "Écrire un message") {
        setWritting("message");
      }
      if (
        quillRef.current.options.placeholder ===
        "Ajouter une description à cette tâche"
      ) {
        setWritting("description");
      }
    });
  }, [writting]); // Exécuté une seule fois après le montage

  return <div ref={containerRef}></div>;
}
