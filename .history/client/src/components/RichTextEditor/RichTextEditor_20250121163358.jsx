"use client";
import { instrumentSans } from "@/utils/font";
import "quill/dist/quill.snow.css";
import { useEffect, useRef, useState } from "react";

export default function RichTextEditor({ placeholder, type }) {
  const [content, setContent] = useState("");
  const [writting, setWritting] = useState(false);
  const btnMessage = placeholder.includes("description")
    ? "Enregistrer la description"
    : "Envoyer un message";

  const options = {
    placeholder: placeholder,
    theme: "snow",
  };

  const containerRef = useRef(null);
  const quillRef = useRef(null);

  useEffect(() => {
    // On vérifie si nous sommes côté client
    if (typeof window !== "undefined" && !quillRef.current) {
      // Import dynamique de Quill uniquement côté client
      import("quill").then((Quill) => {
        if (containerRef.current && !quillRef.current) {
          quillRef.current = new Quill.default(containerRef.current, options);

          quillRef.current.on("text-change", () => {
            const htmlContent = quillRef.current.root.innerHTML;
            console.log(htmlContent);
            setWritting(htmlContent.trim().length > 0);
          });
        }
      });
    }
  }, []);

  function handleSendContent() {
    // if(placeholder)
  }

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
