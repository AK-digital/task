"use client";
import Quill from "quill";
import { useRef } from "react";
const options = {
  placeholder: "Hello, World!",
  theme: "snow",
};

export default function RichTextEditor() {
  const containerRef = useRef(null);

  const quill = new Quill(containerRef.current, options);

  return <div ref={containerRef}></div>;
}
