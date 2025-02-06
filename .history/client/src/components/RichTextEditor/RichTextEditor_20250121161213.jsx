"use client";
import { instrumentSans } from "@/utils/font";
import { useCallback, useState } from "react";
import { Slate, Editable, withReact } from "slate-react";
import { createEditor } from "slate";

export default function RichTextEditor({ placeholder, type }) {
  const editor = useState(() => withReact(createEditor()))[0];
  const [value, setValue] = useState([
    {
      type: "paragraph",
      children: [{ text: "" }],
    },
  ]);

  const btnMessage = placeholder.includes("description")
    ? "Enregistrer la description"
    : "Envoyer un message";

  const renderElement = useCallback((props) => {
    switch (props.element.type) {
      case "heading":
        return <h1 {...props.attributes}>{props.children}</h1>;
      default:
        return <p {...props.attributes}>{props.children}</p>;
    }
  }, []);

  return (
    <div style={{ fontFamily: instrumentSans }}>
      <Slate
        editor={editor}
        value={value}
        onChange={(newValue) => setValue(newValue)}
      >
        <Editable
          placeholder={placeholder}
          renderElement={renderElement}
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            minHeight: "150px",
            borderRadius: "5px",
          }}
        />
      </Slate>
      <button
        style={{
          marginTop: "10px",
          padding: "10px 15px",
          backgroundColor: "#007BFF",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        {btnMessage}
      </button>
    </div>
  );
}
