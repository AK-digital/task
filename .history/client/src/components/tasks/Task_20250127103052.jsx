"use client";
import styles from "@/styles/components/tasks/task.module.css";
import { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faListUl, faMessage } from "@fortawesome/free-solid-svg-icons";
import TaskMore from "./TaskMore";
import TaskStatus from "./TaskStatus";
import TaskPriority from "./TaskPriority";
import TaskDeadline from "./TaskDeadline";
import TaskText from "./TaskText";
import TaskRemove from "./TaskRemove";
import TaskResponsibles from "./TaskResponsibles";

const ItemType = {
  TASK: "task",
};

export default function Task({ task, project, index, moveTask }) {
  const ref = useRef(null);

  const [, drop] = useDrop({
    accept: ItemType.TASK,
    hover: (item, monitor) => {
      if (!ref.current) return;

      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      moveTask(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemType.TASK,
    item: { type: ItemType.TASK, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      className={`${styles["task"]} ${
        isDragging ? styles["task--dragging"] : ""
      }`}
    >
      <div className={styles["task__content"]}>
        <FontAwesomeIcon icon={faListUl} />
        <TaskText task={task} />
        <div className={styles["task__modal"]}>
          <FontAwesomeIcon icon={faMessage} />
        </div>
        <TaskResponsibles task={task} project={project} />
        <TaskStatus task={task} />
        <TaskPriority task={task} />
        <TaskDeadline task={task} />
      </div>
      <TaskRemove task={task} />
    </div>
  );
}
