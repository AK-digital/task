import React, { useState, useEffect } from "react";
import TaskList from "./TaskList";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { Droppable } from "react-beautiful-dnd";

function Board({
  board,
  onUpdateTitle,
  onDeleteBoard,
  onAddTask,
  onEditTask,
  onDeleteTask,
  handleOpenTaskDetails,
  users,
  onUpdateColor,
}) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState(board.title);
  const [newTask, setNewTask] = useState({
    text: "",
    status: "idle",
    priority: "medium",
    deadline: "",
    assignedTo: "",
  });

  const [titleColor, setTitleColor] = useState(board.titleColor || "#ffffff");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const colors = [
    "#ffffff",
    "#bb928f",
    "#c19e34",
    "#dfd66e",
    "#70e578",
    "#a7ffeb",
    "#aecbfa",
    "#d7aefb",
    "#fdcfe8",
    "#e08a9f",
  ];

  const handleTitleSubmit = () => {
    onUpdateTitle(board.id, newTitle);
    setIsEditingTitle(false);
  };

  const handleNewTaskChange = (field, value) => {
    setNewTask((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddNewTask = () => {
    if (newTask.text.trim() !== "") {
      onAddTask(board.id, { ...newTask, description: "", responses: [] });
      setNewTask({
        text: "",
        status: "idle",
        priority: "medium",
        deadline: "",
        assignedTo: "",
      });
    }
  };

  const handleDeleteBoard = () => {
    const isConfirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer le tableau "${board.title}" ? Toutes les tâches seront également supprimées.`
    );
    if (isConfirmed) {
      onDeleteBoard(board.id);
    }
  };

  const handleColorChange = (color) => {
    setTitleColor(color);
    onUpdateColor(color);
    setShowColorPicker(false);
  };

  return (
    <Droppable droppableId={board.id.toString()}>
      {(provided) => (
        <div
          className="board"
          ref={provided.innerRef}
          {...provided.droppableProps}
          style={{
            borderLeft: titleColor ? `2px solid ${titleColor}` : "none",
          }}
        >
          <div className="board-header">
            <div className="board-title-wrapper">
              {isEditingTitle ? (
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onBlur={handleTitleSubmit}
                  onKeyDown={(e) => e.key === "Enter" && handleTitleSubmit()}
                  autoFocus
                />
              ) : (
                <h3
                  className="board-title"
                  onClick={() => setIsEditingTitle(true)}
                >
                  <span style={{ color: titleColor }}>{board.title}</span>
                </h3>
              )}
              <div
                className="color-picker-container"
                onMouseEnter={() => setShowColorPicker(true)}
                onMouseLeave={() => setShowColorPicker(false)}
              >
                <span
                  className="color-circle"
                  style={{ backgroundColor: titleColor }}
                ></span>
                {showColorPicker && (
                  <div className="color-picker">
                    {colors.map((color, index) => (
                      <div
                        key={index}
                        className="color-option"
                        style={{ backgroundColor: color }}
                        onClick={() => handleColorChange(color)}
                      ></div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="delete-icon-wrapper">
              <button onClick={handleDeleteBoard} className="delete-btn">
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>
          </div>

          <TaskList
            tasks={board.tasks}
            onEditTask={(taskId, updatedTask) =>
              onEditTask(board.id, taskId, updatedTask)
            }
            onDeleteTask={(taskId) => onDeleteTask(board.id, taskId)}
            handleOpenTaskDetails={(task) =>
              handleOpenTaskDetails(task, board.id)
            }
            users={users}
            boardId={board.id}
          />
          <div className="add-task-form">
            <span className="plus-icon">+</span>
            <input
              type="text"
              value={newTask.text}
              onChange={(e) => handleNewTaskChange("text", e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddNewTask()}
              placeholder="Nouvelle tâche"
            />
            {newTask.text.trim() !== "" && (
              <button onClick={handleAddNewTask}>Ajouter</button>
            )}
          </div>
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
}

export default Board;
