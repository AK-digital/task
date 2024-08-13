import React, { useState, useRef, useCallback } from "react";
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
  initialValue = "",
  onSave,
  onCancel,
  placeholder,
  saveButtonText,
  initialFiles = [],
  onUploadFiles,
}) => {
  const [content, setContent] = useState(initialValue);
  const [files, setFiles] = useState(
    Array.isArray(initialFiles) ? initialFiles : []
  );
  const fileInputRef = useRef(null);

  const handleSave = () => {
    if (content && content.trim() !== "") {
      onSave(content, files);
    }
    setContent("");
    setFiles([]);
  };

  const handleFileUpload = useCallback(
    async (event) => {
      const newFiles = Array.from(event.target.files);
      if (newFiles.length > 0 && onUploadFiles) {
        try {
          const uploadedFiles = await onUploadFiles(newFiles);

          // Vérifier si uploadedFiles est un tableau ou un objet unique
          const filesToAdd = Array.isArray(uploadedFiles)
            ? uploadedFiles
            : [uploadedFiles];

          setFiles((prevFiles) => [
            ...prevFiles,
            ...filesToAdd.map((file) => ({
              id: file.id,
              name: file.name || `File ${file.id}`,
              // Ajoutez d'autres propriétés si nécessaire
            })),
          ]);
        } catch (error) {
          console.error("Erreur lors de l'upload des fichiers:", error);
        }
      }
    },
    [onUploadFiles]
  );

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
              <li className="attached-file" key={file.id || index}>
                {file.name || `File ${file.id}`}
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
