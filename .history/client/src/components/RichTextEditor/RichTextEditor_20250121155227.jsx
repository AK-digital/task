import { instrumentSans } from "@/utils/font";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

// Importer Quill dynamiquement pour éviter les erreurs côté serveur
const QuillNoSSRWrapper = dynamic(() => import("react-quill"), { ssr: false });
import "quill/dist/quill.snow.css";

export default function RichTextEditor({ placeholder, type }) {
  const [writting, setWritting] = useState(false);
  const btnMessage = placeholder.includes("description")
    ? "Enregistrer la description"
    : "Envoyer un message";

  const modules = {
    toolbar: [
      [{ header: "1" }, { header: "2" }, { font: [] }],
      [{ size: [] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [
        { list: "ordered" },
        { list: "bullet" },
        { indent: "-1" },
        { indent: "+1" },
      ],
      ["link", "image", "video"],
      ["clean"],
    ],
    clipboard: {
      // toggle to add extra line breaks when pasting HTML:
      matchVisual: false,
    },
  };
  /*
   * Quill editor formats
   * See https://quilljs.com/docs/formats/
   */
  const formats = [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
    "video",
  ];

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
      <QuillNoSSRWrapper theme="snow" />

      {writting && (
        <div>
          <button className={instrumentSans.className}>{btnMessage}</button>
          <button className={instrumentSans.className}>Annuler</button>
        </div>
      )}
    </>
  );
}
