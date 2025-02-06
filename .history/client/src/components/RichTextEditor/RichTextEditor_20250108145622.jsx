"use client";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { useEffect, useRef } from "react";

export default function RichTextEditor({ placeholder }) {
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
        console.log("ça écrit");
      });
    }
  }, []); // Exécuté une seule fois après le montage

  return <div ref={containerRef}></div>;
}
