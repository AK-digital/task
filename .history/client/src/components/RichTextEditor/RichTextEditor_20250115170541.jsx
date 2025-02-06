"use client";
import { instrumentSans } from "@/utils/font";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { useEffect, useRef, useState } from "react";

export default function RichTextEditor({ placeholder, type }) {
  const [writting, setWritting] = useState(false);
  const btnMessage = placeholder.includes("description")
    ? "Enregistrer la description"
    : "Envoyer un message";

  const options = {
    placeholder: placeholder,
    theme: "snow",
  };

  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      // Initialiser Quill uniquement si non encore initialisé
      containerRef.current = new Quill(containerRef.current, options);

      containerRef.current.on("text-change", () => {
        const htmlContent = containerRef.current.root.innerHTML; // Obtenir le contenu HTML
        console.log(htmlContent);
        setWritting(htmlContent.trim().length > 0);
      });
    }
  }, []);

  return (
    <>
      <div ref={containerRef}></div>

      {writting && (
        <div>
          <button className={instrumentSans.className}>{btnMessage}</button>
          <button className={instrumentSans.className}>Annuler</button>
        </div>
      )}
    </>
  );
}
