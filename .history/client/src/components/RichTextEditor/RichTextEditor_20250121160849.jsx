"use client";
import { instrumentSans } from "@/utils/font";
// import Quill from "quill";
import dynamic from "next/dynamic";
import "quill/dist/quill.snow.css";
import "react-quill/dist/quill.snow.css";
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

  return <QuillNoSSRWrapper theme="snow" />;
}
