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
import { SortableItem } from "@dnd-kit/sortable";

export default function Task({ task, project }) {
  const [isHover, setIsHover] = useState(false);
  const [taskMore, setTaskMore] = useState(false);

  return (
    <SortableItem id={task._id}>
      {({ attributes, listeners, setNodeRef, transform, transition }) => (
        <div
          className={styles["task"]}
          ref={setNodeRef}
          style={{
            transform: transform
              ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
              : undefined,
            transition,
          }}
          {...attributes}
          {...listeners}
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
    </SortableItem>
  );
}
