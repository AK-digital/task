"use client";
import styles from "@/styles/components/tasks/task.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGripVertical } from "@fortawesome/free-solid-svg-icons";
import { faComment } from "@fortawesome/free-regular-svg-icons";
import TaskStatus from "./TaskStatus";
import TaskPriority from "./TaskPriority";
import TaskDeadline from "./TaskDeadline";
import TaskText from "./TaskText";
import TaskRemove from "./TaskRemove";
import TaskResponsibles from "./TaskResponsibles";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import TaskTimer from "./TaskTimer";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import TaskMore from "./TaskMore";
import TaskEstimate from "./TaskEstimate";
import { AuthContext } from "@/context/auth";
import { checkRole } from "@/utils/utils";

export default function Task({
  task,
  project,
  isDragging,
  setSelectedTasks,
  archive,
}) {
  const { uid, user } = useContext(AuthContext);
  const pathname = usePathname();
  const taskId = pathname.split("/").pop();
  const [openedTask, setOpenedTask] = useState(taskId);

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: task?._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleTaskClick = useCallback(
    (e) => {
      e.preventDefault();

      window.history.pushState(
        {},
        "",
        archive
          ? `/projects/${project?._id}/archive/task/${task?._id}`
          : `/projects/${project?._id}/task/${task?._id}`
      );
    },
    [archive, project?._id, task?._id]
  );

  useEffect(() => {
    if (pathname?.includes("/task/")) {
      const taskId = pathname.split("/").pop();
      setOpenedTask(taskId);
    }
  }, [pathname]);

  function handleSelectedTask(e) {
    setSelectedTasks((prev) => {
      if (e.target.checked) {
        return [...prev, task?._id];
      } else {
        return prev.filter((id) => id !== task?._id);
      }
    });
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.container} ${isDragging ? styles.dragging : ""}`}
      suppressHydrationWarning
      data-openned={openedTask === task?._id}
      data-done={task?.status === "Terminée"}
    >
      <div className={styles.content}>
        <div className={styles.wrapper}>
          {checkRole(
            project,
            ["owner", "manager", "team", "customer"],
            uid
          ) && (
            <div>
              <input
                type="checkbox"
                name="task"
                id={`task-${task?._id}`}
                data-value={task?._id}
                defaultValue={task?._id}
                className={styles.checkbox}
                onClick={handleSelectedTask}
              />
            </div>
          )}
          {checkRole(project, ["owner", "manager", "team"], uid) && (
            <div {...attributes} {...listeners} suppressHydrationWarning>
              {/* <GripVertical width={60} height={60} /> */}
              <FontAwesomeIcon icon={faGripVertical} />
            </div>
          )}
          <TaskText task={task} project={project} uid={uid} archive={archive} />

          <div className={styles.comment} onClick={handleTaskClick}>
            <FontAwesomeIcon icon={faComment} />
            {task?.messages?.length > 0 && (
              <span className={styles.count}>{task?.messages?.length}</span>
            )}
          </div>

          <TaskResponsibles task={task} project={project} archive={archive} />
          <div className={styles.options}>
            <TaskStatus task={task} project={project} uid={uid} />
            <TaskPriority task={task} project={project} uid={uid} />
          </div>
          <TaskDeadline task={task} project={project} uid={uid} />
          <TaskEstimate task={task} project={project} uid={uid} />
          {!archive && <TaskTimer task={task} project={project} uid={uid} />}
          <TaskRemove
            task={task}
            project={project}
            uid={uid}
            archive={archive}
          />
        </div>
      </div>
      {openedTask === task?._id && (
        <TaskMore
          task={task}
          project={project}
          setOpennedTask={setOpenedTask}
          archive={archive}
          uid={uid}
        />
      )}
    </div>
  );
}
