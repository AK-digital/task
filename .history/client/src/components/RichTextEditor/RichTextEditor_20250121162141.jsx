"use client";

import { useState, forwardRef } from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

// Créer un composant wrapper pour React-Quill
const QuillNoSSRWrapper = dynamic(import("react-quill"), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});

export default function RichTextEditor({ placeholder, type }) {
  const [value, setValue] = useState("");
  const [isWriting, setIsWriting] = useState(false);

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "clean"],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "link",
  ];

  const handleChange = (content) => {
    setValue(content);
    setIsWriting(content.length > 0);
  };

  const btnMessage = placeholder?.includes("description")
    ? "Enregistrer la description"
    : "Envoyer un message";

  return (
    <div className="flex flex-col gap-4">
      <div className="h-48">
        <QuillNoSSRWrapper
          theme="snow"
          value={value}
          onChange={handleChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
        />
      </div>
      {isWriting && (
        <button className="px-4 py-2 bg-blue-500 text-white rounded">
          {btnMessage}
        </button>
      )}
    </div>
  );
}
