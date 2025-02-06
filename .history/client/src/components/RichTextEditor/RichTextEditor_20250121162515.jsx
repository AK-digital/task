"use client";
import { useCallback, useMemo } from "react";
import { createEditor, Editor, Text, Transforms } from "slate";
import { Slate, Editable, withReact } from "slate-react";
import { instrumentSans } from "@/utils/font";
import { useState } from "react";

const initialValue = [
  {
    type: "paragraph",
    children: [{ text: "" }],
  },
];

const RichTextEditor = ({ placeholder, type }) => {
  const [writting, setWritting] = useState(false);
  const editor = useMemo(() => withReact(createEditor()), []);
  const [value, setValue] = useState(initialValue);

  const btnMessage = placeholder.includes("description")
    ? "Enregistrer la description"
    : "Envoyer un message";

  const renderElement = useCallback((props) => {
    switch (props.element.type) {
      case "paragraph":
        return <p {...props.attributes}>{props.children}</p>;
      default:
        return <p {...props.attributes}>{props.children}</p>;
    }
  }, []);

  const renderLeaf = useCallback((props) => {
    return (
      <span
        {...props.attributes}
        style={{ fontWeight: props.leaf.bold ? "bold" : "normal" }}
      >
        {props.children}
      </span>
    );
  }, []);

  const handleChange = (newValue) => {
    setValue(newValue);
    // Check if there's any non-empty content
    const hasContent = newValue.some((node) =>
      node.children.some((child) => child.text.trim().length > 0)
    );
    setWritting(hasContent);
  };

  const handleKeyDown = (event) => {
    if (!event.ctrlKey) return;

    switch (event.key) {
      case "b": {
        event.preventDefault();
        const [match] = Editor.nodes(editor, {
          match: (n) => n.bold === true,
        });
        Transforms.setNodes(
          editor,
          { bold: !match },
          { match: (n) => Text.isText(n), split: true }
        );
        break;
      }
    }
  };

  const handleCancel = () => {
    setValue(initialValue);
    setWritting(false);
  };

  const handleSubmit = () => {
    // Handle the submit logic here
    console.log("Submitting:", value);
    // Reset the editor after submission
    handleCancel();
  };

  return (
    <div className="slate-editor">
      <Slate editor={editor} value={value} onChange={handleChange}>
        <Editable
          placeholder={placeholder}
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          onKeyDown={handleKeyDown}
          className={instrumentSans.className}
        />
      </Slate>

      {writting && (
        <div className="editor-buttons">
          <button className={instrumentSans.className} onClick={handleSubmit}>
            {btnMessage}
          </button>
          <button className={instrumentSans.className} onClick={handleCancel}>
            Annuler
          </button>
        </div>
      )}

      <style jsx>{`
        .slate-editor {
          border: 1px solid #ccc;
          border-radius: 4px;
          padding: 8px;
          margin-bottom: 8px;
        }
        .editor-buttons {
          display: flex;
          gap: 8px;
          margin-top: 8px;
        }
        .editor-buttons button {
          padding: 6px 12px;
          border-radius: 4px;
          border: 1px solid #ccc;
          background: white;
          cursor: pointer;
        }
        .editor-buttons button:hover {
          background: #f5f5f5;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
