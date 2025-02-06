"use client";

import dynamic from "next/dynamic";
import("quill/dist/quill.snow.css"); // Importer les styles dynamiquement
import { Instrument_Sans } from "@next/font/google";
import { useEffect, useRef, useState } from "react";

// Import dynamique pour Quill
const Quill = dynamic(() => import("quill"), { ssr: false });

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "600"],
});

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
  const quillRef = useRef(null);

  useEffect(() => {
    let quillInstance;

    if (
      typeof window !== "undefined" &&
      containerRef.current &&
      !quillRef.current
    ) {
      Quill.then((Quill) => {
        quillInstance = new Quill(containerRef.current, options);
        quillRef.current = quillInstance;

        quillInstance.on("text-change", () => {
          const htmlContent = quillInstance.root.innerHTML;
          setWritting(htmlContent.trim().length > 0);
        });
      });
    }

    return () => {
      if (quillRef.current) {
        quillRef.current.off("text-change");
        quillRef.current = null;
      }
    };
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
