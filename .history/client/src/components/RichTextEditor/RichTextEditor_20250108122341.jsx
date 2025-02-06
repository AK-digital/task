"use client";
import Quill from "quill";
import "quill/dist/quill.snow.css";

import { useEffect, useRef } from "react";

const options = {
  placeholder: "Hello, World!",
  theme: "snow",
};

export default function RichTextEditor() {
  const containerRef = useRef(null);
  const quillRef = useRef(null); // Pour stocker l'instance de Quill

  useEffect(() => {
    if (containerRef.current && !quillRef.current) {
      // Initialiser Quill uniquement si non encore initialisé
      quillRef.current = new Quill(containerRef.current, options);
    }
  }, []); // Exécuté une seule fois après le montage

  return <div ref={containerRef}></div>;
}
