"use client";
import { instrumentSans } from "@/utils/font";
// import Quill from "quill";
import "quill/dist/quill.snow.css";
import Quill from "react-quill";
import { useEffect, useRef, useState } from "react";

export default function RichTextEditor({ placeholder, type }) {
  const QuillNoSSRWrapper = dynamic(import("react-quill"), {
    ssr: false,
    loading: () => <p>Loading ...</p>,
  });
  const [writting, setWritting] = useState(false);
  const btnMessage = placeholder.includes("description")
    ? "Enregistrer la description"
    : "Envoyer un message";

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
