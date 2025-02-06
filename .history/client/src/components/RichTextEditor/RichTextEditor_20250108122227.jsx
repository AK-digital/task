"use client";
import Quill from "quill";
import { useRef } from "react";
const options = {
  placeholder: "Hello, World!",
  theme: "snow",
};
const quill = new Quill("#editor", options);
export default function RichTextEditor() {
  const containerRef = useRef(null);

  return <div></div>;
}
