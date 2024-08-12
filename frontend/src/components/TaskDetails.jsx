import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import RichTextEditor from "./shared/RichTextEditor.jsx";
import "../assets/css/task-details.css";
import DOMPurify from "dompurify";

const TaskDetails = ({
  task,
  onClose,
  onSave,
  onAddResponse,
  onEditResponse,
  onDeleteResponse,
  currentUser,
  users,
  onUploadFiles,
}) => {
  const [editedTask, setEditedTask] = useState(task || {});
  const [localResponses, setLocalResponses] = useState(task?.responses || []);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editingResponseId, setEditingResponseId] = useState(null);
  const [showIcons, setShowIcons] = useState(null);
  const taskDetailsRef = useRef(null);

  if (!task || !task.id || !task.projectId || !task.boardId) {
    console.error("Task information is incomplete", task);
    return null; // ou affichez un message d'erreur
  }

  useEffect(() => {
    if (task) {
      setEditedTask(task);
      setLocalResponses(task.responses || []);
    }
  }, [task]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        taskDetailsRef.current &&
        !taskDetailsRef.current.contains(event.target)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  if (!task) return null;

  const handleSaveDescription = async (newDescription, files) => {
    const sanitizedHtml = DOMPurify.sanitize(newDescription);
    let uploadedFiles = [];
    if (files.length > 0) {
      uploadedFiles = await onUploadFiles(
        files,
        currentUser,
        { id: task.projectId },
        task.boardId,
        task.id
      );
    }
    const updatedTask = {
      ...task,
      description: sanitizedHtml,
      descriptionFiles: uploadedFiles,
    };
    setEditedTask(updatedTask);
    onSave(updatedTask);
    setIsEditingDescription(false);
  };

  const handleAddResponse = async (responseText, files) => {
    console.log("handleAddResponse called with:", {
      responseText,
      files,
      currentUser,
      editedTask,
    });
    if (responseText.trim() !== "" && currentUser) {
      const sanitizedHtml = DOMPurify.sanitize(responseText);
      let uploadedFiles = [];
      if (files && files.length > 0) {
        if (
          !editedTask ||
          !editedTask.projectId ||
          !editedTask.boardId ||
          !editedTask.id
        ) {
          console.error("Task information is incomplete", editedTask);
          return;
        }
        try {
          uploadedFiles = await onUploadFiles(
            files,
            currentUser,
            { id: editedTask.projectId },
            editedTask.boardId,
            editedTask.id
          );
        } catch (error) {
          console.error("Erreur lors de l'upload des fichiers:", error);
        }
      }
      const newResponse = {
        id: Date.now(),
        text: sanitizedHtml,
        date: new Date().toLocaleString(),
        author_id: currentUser.id,
        files: uploadedFiles,
      };

      // Validation avant d'ajouter la réponse
      if (!editedTask.id || !newResponse.text) {
        console.error(
          "Impossible d'ajouter la réponse : informations manquantes",
          { editedTask, newResponse }
        );
        return;
      }

      onAddResponse(editedTask.id, newResponse);
      setLocalResponses((prevResponses) => [...prevResponses, newResponse]);
    }
  };

  const handleEditResponse = async (responseId, newText, newFiles) => {
    const sanitizedHtml = DOMPurify.sanitize(newText);
    let uploadedFiles = [];
    if (newFiles.length > 0) {
      uploadedFiles = await onUploadFiles(newFiles);
    }
    const updatedResponse = {
      ...localResponses.find((response) => response.id === responseId),
      text: sanitizedHtml,
      files: uploadedFiles,
    };
    onEditResponse(editedTask.id, responseId, updatedResponse);
    setLocalResponses((prevResponses) =>
      prevResponses.map((response) =>
        response.id === responseId ? updatedResponse : response
      )
    );
    setEditingResponseId(null);
  };

  const handleDeleteResponse = (responseId) => {
    onDeleteResponse(editedTask.id, responseId);
    setLocalResponses((prevResponses) =>
      prevResponses.filter((response) => response.id !== responseId)
    );
  };

  const getAuthorInfo = (authorId) => {
    const author = users.find((user) => user.id === authorId);
    return (
      author || {
        name: "Utilisateur inconnu",
        profile_picture: "default-profile-pic.svg",
      }
    );
  };

  return (
    <div ref={taskDetailsRef} className={`task-details ${task ? "open" : ""}`}>
      <button className="close-slider" onClick={onClose}>
        &#x2715;
      </button>
      <div className="task-title">{editedTask.text}</div>

      <h3>Description</h3>
      <div className="task-description">
        {isEditingDescription ? (
          <RichTextEditor
            initialValue={editedTask.description || ""}
            initialFiles={editedTask.descriptionFiles || []}
            onSave={handleSaveDescription}
            onCancel={() => setIsEditingDescription(false)}
            placeholder="Description de la tâche"
            saveButtonText="Enregistrer la description"
          />
        ) : (
          <div
            className="description-container"
            onClick={() => setIsEditingDescription(true)}
            onMouseEnter={() => setShowIcons("description")}
            onMouseLeave={() => setShowIcons(null)}
          >
            <div
              className="description-text"
              dangerouslySetInnerHTML={{
                __html: editedTask.description || "Pas de description",
              }}
            />
            {showIcons === "description" && (
              <FontAwesomeIcon
                icon={faPen}
                className="edit-icon"
                onClick={() => setIsEditingDescription(true)}
              />
            )}
            {editedTask.descriptionFiles &&
              editedTask.descriptionFiles.length > 0 && (
                <div className="description-files">
                  <h4>Fichiers attachés:</h4>
                  <ul>
                    {editedTask.descriptionFiles.map((file, index) => (
                      <li key={index}>
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {file.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        )}
      </div>

      <div className="task-discuss">
        <h3>Conversation</h3>
        <ul>
          {localResponses.map((response) => {
            const author = getAuthorInfo(response.author_id);
            return (
              <li
                className="task-chatbox"
                key={response.id}
                onMouseEnter={() => setShowIcons(response.id)}
                onMouseLeave={() => setShowIcons(null)}
              >
                <div className="response-header">
                  <img
                    src={`/src/assets/img/${author.profile_picture}`}
                    alt={author.name}
                    className="author-avatar"
                  />
                  <span className="author-name">{author.name}</span>
                  <span className="response-date">{response.date}</span>
                </div>
                {editingResponseId === response.id ? (
                  <RichTextEditor
                    initialValue={response.text}
                    initialFiles={response.files}
                    onSave={(newText, newFiles) =>
                      handleEditResponse(response.id, newText, newFiles)
                    }
                    onCancel={() => setEditingResponseId(null)}
                    placeholder="Modifier la réponse"
                    saveButtonText="Enregistrer les modifications"
                  />
                ) : (
                  <div className="response-text-container">
                    <div
                      className="response-text"
                      dangerouslySetInnerHTML={{ __html: response.text }}
                    />
                    {response.files && response.files.length > 0 && (
                      <div className="response-files">
                        <h4>Fichiers attachés:</h4>
                        <ul>
                          {response.files.map((file, index) => (
                            <li key={index}>
                              <a
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {file.name}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {showIcons === response.id &&
                      currentUser.id === response.author_id && (
                        <div className="response-icons">
                          <FontAwesomeIcon
                            icon={faPen}
                            className="edit-icon"
                            onClick={() => setEditingResponseId(response.id)}
                          />
                          <FontAwesomeIcon
                            icon={faTrash}
                            className="delete-icon"
                            onClick={() => handleDeleteResponse(response.id)}
                          />
                        </div>
                      )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
        <RichTextEditor
          onSave={handleAddResponse}
          onCancel={() => {}}
          placeholder="Ajouter une nouvelle réponse"
          saveButtonText="Ajouter une réponse"
        />
      </div>
    </div>
  );
};

export default TaskDetails;
