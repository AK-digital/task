import React from "react";
import StatusSelect from "./shared/StatusSelect";
import PrioritySelect from "./shared/PrioritySelect";
import UserSelect from "./shared/UserSelect";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faGripVertical,
  faComment,
} from "@fortawesome/free-solid-svg-icons";

function TaskItem({
  task,
  onEditTask,
  onDeleteTask,
  provided,
  handleOpenTaskDetails,
  users,
  boardId,
}) {
  const handleEdit = (updatedTask) => {
    if (typeof onEditTask === "function") {
      onEditTask(task.id, updatedTask);
    } else {
      console.error("onEditTask is not a function");
    }
  };

  const handleOpenDetails = () => {
    if (typeof handleOpenTaskDetails === "function") {
      handleOpenTaskDetails(task, boardId);
    } else {
      console.error("handleOpenTaskDetails is not a function");
    }
  };

  return (
    <li
      className="task-item"
      ref={provided?.innerRef}
      {...provided?.draggableProps}
      {...provided?.dragHandleProps}
    >
      <span className="grab-handle">
        <FontAwesomeIcon icon={faGripVertical} />
      </span>
      <input
        type="text"
        value={task.text}
        onChange={(e) => handleEdit({ ...task, text: e.target.value })}
        placeholder="Tâche existante"
      />
      <button onClick={handleOpenDetails}>
        Éditer
        <FontAwesomeIcon icon={faComment} />
      </button>
      <StatusSelect
        value={task.status}
        onChange={(status) => handleEdit({ ...task, status })}
        className="select select-status"
      />
      <PrioritySelect
        value={task.priority}
        onChange={(priority) => handleEdit({ ...task, priority })}
        className="select select-priority"
      />
      <input
        type="date"
        value={task.deadline}
        onChange={(e) => handleEdit({ ...task, deadline: e.target.value })}
      />
      <UserSelect
        users={users}
        value={task.assignedTo}
        onChange={(assignedTo) => handleEdit({ ...task, assignedTo })}
        className="select select-user"
      />
      <button className="delete-btn" onClick={() => onDeleteTask(task.id)}>
        <FontAwesomeIcon icon={faTrash} />
      </button>
    </li>
  );
}

export default TaskItem;
