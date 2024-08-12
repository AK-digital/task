import React, { useState, useRef } from "react";
import "../../assets/css/task-details.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperclip } from "@fortawesome/free-solid-svg-icons";
import {
  BtnBold,
  BtnItalic,
  BtnUnderline,
  BtnStrikeThrough,
  BtnBulletList,
  BtnNumberedList,
  BtnLink,
  BtnClearFormatting,
  BtnUndo,
  BtnRedo,
  Toolbar,
  EditorProvider,
  Editor,
} from "react-simple-wysiwyg";

const RichTextEditor = ({
  initialValue,
  onSave,
  onCancel,
  placeholder,
  saveButtonText,
  initialFiles = [],
}) => {
  const [content, setContent] = useState(initialValue);
  const [files, setFiles] = useState(initialFiles);
  const fileInputRef = useRef(null);

  const handleSave = () => {
    if (content && content.trim() !== "") {
      onSave(content, files);
    }
    setContent("");
    setFiles([]);
  };

  const handleFileUpload = (event) => {
    const newFiles = Array.from(event.target.files);
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  };

  const removeFile = (index) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  return (
    <div className="rich-text-editor">
      <EditorProvider>
        <Editor value={content} onChange={(e) => setContent(e.target.value)}>
          <Toolbar>
            <BtnUndo /> <BtnRedo />
            <BtnBold /> <BtnItalic /> <BtnUnderline /> <BtnStrikeThrough />
            <BtnBulletList /> <BtnNumberedList />
            <BtnLink /> <BtnClearFormatting />
          </Toolbar>
        </Editor>
      </EditorProvider>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileUpload}
        multiple
      />
      {files.length > 0 && (
        <div className="attached-files">
          <h4>Fichiers attachés:</h4>
          <ul>
            {files.map((file, index) => (
              <li className="attached-file" key={index}>
                {file.name}
                <button onClick={() => removeFile(index)}>Supprimer</button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="editor-actions">
        <button className="confirm-btn" onClick={handleSave}>
          {saveButtonText}
        </button>
        <button className="cancel-btn" onClick={onCancel}>
          Annuler
        </button>
        <button
          className="add-files-btn"
          onClick={() => fileInputRef.current.click()}
        >
          <FontAwesomeIcon icon={faPaperclip} /> Joindre des fichiers
        </button>
      </div>
    </div>
  );
};

export default RichTextEditor;
