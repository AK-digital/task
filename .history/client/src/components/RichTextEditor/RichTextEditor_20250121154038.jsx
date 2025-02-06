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

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      containerRef.current &&
      !quillRef.current
    ) {
      // Import dynamique de Quill
      import("quill").then((Quill) => {
        const options = {
          placeholder: placeholder,
          theme: "snow",
        };

        // Initialiser Quill avec le module importé
        quillRef.current = new Quill.default(containerRef.current, options);

        quillRef.current.on("text-change", () => {
          const htmlContent = quillRef.current.root.innerHTML;
          console.log(htmlContent);
          setWritting(htmlContent.trim().length > 0);
        });
      });
    }
  }, [placeholder]);

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
