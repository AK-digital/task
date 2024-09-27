import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
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
  const descriptionEditorRef = useRef(null);

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

  useEffect(() => {
    if (!editedTask.description) {
      setIsEditingDescription(true);
    }
  }, [editedTask.description]);

  useEffect(() => {
    if (isEditingDescription && descriptionEditorRef.current) {
      descriptionEditorRef.current.focusEditor();
    }
  }, [isEditingDescription]);

  const handleUploadFiles = useCallback(
    async (files) => {
      if (!files || files.length === 0 || !currentUser || !task) {
        return [];
      }

      try {
        const uploadedFiles = await onUploadFiles({
          files,
          currentUser,
          currentProject: { id: task.projectId },
          boardId: task.boardId,
          taskId: task.id,
        });
        return Array.isArray(uploadedFiles) ? uploadedFiles : [];
      } catch (error) {
        console.error("Erreur lors de l'upload des fichiers:", error);
        return [];
      }
    },
    [currentUser, task, onUploadFiles]
  );

  const handleSaveDescription = useCallback(
    async (newDescription, files) => {
      const sanitizedHtml = DOMPurify.sanitize(newDescription);
      let uploadedFiles = [];
      try {
        if (files && files.length > 0) {
          uploadedFiles = await handleUploadFiles(files);
        }
        const updatedTask = {
          ...task,
          description: sanitizedHtml,
          descriptionFiles: uploadedFiles,
        };
        setEditedTask(updatedTask);
        onSave(updatedTask);
        setIsEditingDescription(false);
      } catch (error) {
        console.error("Erreur lors de la sauvegarde de la description:", error);
      }
    },
    [task, onSave, handleUploadFiles]
  );

  const handleAddResponse = useCallback(
    async (responseText, uploadedFiles) => {
      if (responseText.trim() === "" || !currentUser || !task) return;

      const sanitizedHtml = DOMPurify.sanitize(responseText);
      let files = [];
      if (uploadedFiles && uploadedFiles.length > 0) {
        files = await handleUploadFiles(uploadedFiles);
      }

      const newResponse = {
        id: Date.now(),
        text: sanitizedHtml,
        date: new Date().toLocaleString(),
        author_id: currentUser.id,
        files: files,
      };

      onAddResponse(task.id, newResponse);
      setLocalResponses((prevResponses) => [...prevResponses, newResponse]);
    },
    [task, currentUser, onAddResponse, handleUploadFiles]
  );

  const handleDeleteResponse = useCallback(
    (responseId) => {
      onDeleteResponse(task.id, responseId);
      setLocalResponses((prevResponses) =>
        prevResponses.filter((response) => response.id !== responseId)
      );
    },
    [task, onDeleteResponse]
  );

  const handleEditResponse = useCallback(
    async (responseId, newText, newFiles) => {
      const sanitizedHtml = DOMPurify.sanitize(newText);
      let uploadedFiles = [];
      if (newFiles && newFiles.length > 0) {
        uploadedFiles = await handleUploadFiles(newFiles);
      }
      const updatedResponse = {
        id: responseId,
        text: sanitizedHtml,
        files: uploadedFiles,
      };
      onEditResponse(task.id, responseId, updatedResponse);
      setLocalResponses((prevResponses) =>
        prevResponses.map((response) =>
          response.id === responseId
            ? { ...response, ...updatedResponse }
            : response
        )
      );
      setEditingResponseId(null);
    },
    [task, handleUploadFiles, onEditResponse]
  );

  const getAuthorInfo = useMemo(
    () => (authorId) => {
      const author = users.find((user) => user.id === authorId);
      return (
        author || {
          name: "Utilisateur inconnu",
          profilePicture: "default-profile-pic.svg",
        }
      );
    },
    [users]
  );

  const taskAuthor = getAuthorInfo(editedTask.createdBy);

  return (
    <div ref={taskDetailsRef} className={`task-details ${task ? "open" : ""}`}>
      <button className="close-slider" onClick={onClose}>
        &#x2715;
      </button>
      <div className="task-title">{editedTask.text}</div>
      <h3>Description</h3>
      <div className="task-description">
        <div className="task-description-header">
          <img
            src={`/public/assets/img/${taskAuthor.profilePicture}`}
            alt={taskAuthor.name}
            className="author-avatar"
          />
          <span className="author-name">{taskAuthor.name}</span>
          <span className="response-date">{editedTask.createdAt}</span>
        </div>

        {isEditingDescription ? (
          <RichTextEditor
            ref={descriptionEditorRef} // Attacher la référence à l'éditeur
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
                    src={`/public/assets/img/${author.profilePicture}`}
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
                    onUploadFiles={handleUploadFiles}
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
          onUploadFiles={handleUploadFiles}
        />
      </div>
    </div>
  );
};

export default TaskDetails;
