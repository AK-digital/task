"use client";
import styles from "@/styles/components/tasks/task.module.css";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faListUl, faMessage } from "@fortawesome/free-solid-svg-icons";
import TaskMore from "./TaskMore";
import TaskStatus from "./TaskStatus";
import TaskPriority from "./TaskPriority";
import TaskDeadline from "./TaskDeadline";
import TaskText from "./TaskText";
import TaskRemove from "./TaskRemove";
import TaskResponsibles from "./TaskResponsibles";
import { Draggable } from "@hello-pangea/dnd";

export default function Task({ task, project, index }) {
  const [isHover, setIsHover] = useState(false);
  const [taskMore, setTaskMore] = useState(false);

  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => (
        <div
          className={`${styles["task"]} ${
            snapshot.isDragging ? styles["task--dragging"] : ""
          }`}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onMouseEnter={() => setIsHover(true)}
          onMouseLeave={() => setIsHover(false)}
        >
          <div className={styles["task__content"]}>
            <FontAwesomeIcon icon={faListUl} />
            <TaskText task={task} />
            <div
              className={styles["task__modal"]}
              onClick={() => setTaskMore(true)}
            >
              <FontAwesomeIcon icon={faMessage} />
            </div>
            <TaskResponsibles task={task} project={project} />
            <TaskStatus task={task} />
            <TaskPriority task={task} />
            <TaskDeadline task={task} />
          </div>
          {isHover && <TaskRemove task={task} />}
          {taskMore && <TaskMore task={task} setTaskMore={setTaskMore} />}
        </div>
      )}
    </Draggable>
  );
}
