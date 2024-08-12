import React, { useState, useEffect } from "react";
import TaskList from "./TaskList";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import StatusSelect from "./shared/StatusSelect";
import PrioritySelect from "./shared/PrioritySelect";
import UserSelect from "./shared/UserSelect";
import { Droppable } from "react-beautiful-dnd";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";

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

  const [titleColor, setTitleColor] = useState(board.color || "#ffffff");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [colorPickerPosition, setColorPickerPosition] = useState({
    x: 0,
    y: 0,
  });
  const [colors, setColors] = useState(getRandomColors(8));

  function getRandomColors(count) {
    const colors = [];
    for (let i = 0; i < count; i++) {
      const color = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
      colors.push(color);
    }
    return colors;
  }

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
    onUpdateColor(board.id, color); // Sauvegarde la couleur dans la base de données
    setShowColorPicker(false); // Close the tooltip after color change
  };

  useEffect(() => {
    const handleMouseUp = () => {
      setShowColorPicker(false);
    };

    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <Droppable droppableId={board.id.toString()}>
      {(provided) => (
        <div
          className="board"
          ref={provided.innerRef}
          {...provided.droppableProps}
        >
          <div className="board-header">
            <div
              className="board-title-wrapper"
              onMouseEnter={() => setShowColorPicker(true)}
              onMouseLeave={() => setShowColorPicker(false)}
            >
              {isEditingTitle ? (
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onBlur={handleTitleSubmit}
                  onKeyDown={(e) => e.key === "Enter" && handleTitleSubmit()}
                  autoFocus
                  style={{ paddingRight: "30px" }}
                />
              ) : (
                <h3
                  className="board-title"
                  onClick={() => setIsEditingTitle(true)}
                >
                  <span style={{ color: titleColor }}>{board.title}</span>
                </h3>
              )}
              {/* Color Circle affiché seulement au survol */}
              {showColorPicker && (
                <div className="color-picker-container">
                  <span
                    data-tooltip-id={`color-tooltip-${board.id}`}
                    className="color-circle"
                    style={{ backgroundColor: titleColor }}
                    id={`color-circle-${board.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setColorPickerPosition({ x: e.clientX, y: e.clientY });
                      setShowColorPicker(true);
                    }}
                  ></span>
                  <Tooltip
                    id={`color-tooltip-${board.id}`}
                    clickable
                    style={{ backgroundColor: "#2c2e4a" }}
                  >
                    <div className="color-picker">
                      {colors.map((color, index) => (
                        <div
                          key={index}
                          className="color-option"
                          style={{ backgroundColor: color }}
                          onClick={() => handleColorChange(color)} // Mise à jour de la couleur
                        ></div>
                      ))}
                    </div>
                  </Tooltip>
                </div>
              )}
            </div>
            <button onClick={handleDeleteBoard} className="delete-btn">
              <FontAwesomeIcon icon={faTrash} />
            </button>
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
            <StatusSelect
              value={newTask.status}
              onChange={(status) => handleNewTaskChange("status", status)}
              className="select select-status"
            />
            <PrioritySelect
              value={newTask.priority}
              onChange={(priority) => handleNewTaskChange("priority", priority)}
              className="select select-priority"
            />
            <input
              type="date"
              value={newTask.deadline}
              onChange={(e) => handleNewTaskChange("deadline", e.target.value)}
            />
            <UserSelect
              users={users}
              value={newTask.assignedTo}
              onChange={(assignedTo) =>
                handleNewTaskChange("assignedTo", assignedTo)
              }
              className="select select-user"
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
