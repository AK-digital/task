"use client";

import dynamic from "next/dynamic";
import { instrumentSans } from "@/utils/font";
import "quill/dist/quill.snow.css";
import { useEffect, useRef, useState } from "react";

// Charger Quill dynamiquement (pour éviter les problèmes SSR)
const Quill = dynamic(() => import("quill"), { ssr: false });

export default function RichTextEditor({ placeholder, type }) {
  const [writting, setWritting] = useState(false);
  const btnMessage = placeholder.includes("description")
    ? "Enregistrer la description"
    : "Envoyer un message";

  const containerRef = useRef(null);
  const quillRef = useRef(null); // Pour stocker l'instance de Quill

  useEffect(() => {
    // Vérifier que Quill est bien chargé et le conteneur est prêt
    if (containerRef.current && !quillRef.current) {
      const options = {
        placeholder: placeholder,
        theme: "snow",
      };

      quillRef.current = new Quill(containerRef.current, options);

      quillRef.current.on("text-change", () => {
        const htmlContent = quillRef.current.root.innerHTML; // Obtenir le contenu HTML
        setWritting(htmlContent.trim().length > 0);
      });
    }
  }, [placeholder]);

  return (
    <div>
      <div
        ref={containerRef}
        style={{ minHeight: "150px", border: "1px solid #ccc" }}
      ></div>

      {writting && (
        <div>
          <button className={instrumentSans.className}>{btnMessage}</button>
          <button className={instrumentSans.className}>Annuler</button>
        </div>
      )}
    </div>
  );
}
