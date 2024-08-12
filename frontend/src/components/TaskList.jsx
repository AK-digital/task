import React from "react";
import { Draggable } from "react-beautiful-dnd";
import TaskItem from "./TaskItem";

const TaskList = ({
  tasks,
  onEditTask,
  onDeleteTask,
  handleOpenTaskDetails,
  users,
  boardId,
}) => {
  return (
    <ul>
      {tasks.map((task, index) => (
        <Draggable
          key={task.id.toString()}
          draggableId={task.id.toString()}
          index={index}
        >
          {(provided) => (
            <TaskItem
              task={task}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
              handleOpenTaskDetails={() => handleOpenTaskDetails(task, boardId)}
              provided={provided}
              users={users}
            />
          )}
        </Draggable>
      ))}
    </ul>
  );
};
export default TaskList;
