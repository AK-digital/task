import { instrumentSans } from "@/utils/font";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

// Importer Quill dynamiquement pour éviter les erreurs côté serveur
const Quill = dynamic(() => import("react-quill"), { ssr: false });
import "quill/dist/quill.snow.css";

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
  const quillRef = useRef(null); // Pour stocker l'instance de Quill

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      containerRef.current &&
      !quillRef.current
    ) {
      // Initialiser Quill uniquement si non encore initialisé
      Quill.then((QuillConstructor) => {
        quillRef.current = new QuillConstructor(containerRef.current, options);

        quillRef.current.on("text-change", () => {
          const htmlContent = quillRef.current.root.innerHTML; // Obtenir le contenu HTML
          console.log(htmlContent);
          setWritting(htmlContent.trim().length > 0);
        });
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
