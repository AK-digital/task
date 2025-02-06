"use client";
import { instrumentSans } from "@/utils/font";
import dynamic from "next/dynamic";
import "quill/dist/quill.snow.css";
import { useEffect, useRef, useState } from "react";

// Import dynamique de Quill sans SSR
const Quill = dynamic(() => import("quill"), {
  ssr: false,
});

export default function RichTextEditor({ placeholder, type }) {
  const [writting, setWritting] = useState(false);
  const [quillLoaded, setQuillLoaded] = useState(false);
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
    if (
      typeof window !== "undefined" &&
      containerRef.current &&
      !quillRef.current
    ) {
      // Vérifier que nous sommes côté client
      const initQuill = async () => {
        quillRef.current = new Quill(containerRef.current, options);
        setQuillLoaded(true);

        // quillRef.current.on("text-change", () => {
        //   const htmlContent = quillRef.current.root.innerHTML;
        //   console.log(htmlContent);
        //   setWritting(htmlContent.trim().length > 0);
        // });
      };

      initQuill();
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
