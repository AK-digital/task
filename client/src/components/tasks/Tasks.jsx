"use client";
import styles from "@/styles/components/tasks/tasks.module.css";
import Task from "./Task";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { useActionState, useEffect, useRef, useState } from "react";
import { saveTask } from "@/actions/task";
import { useDroppable } from "@dnd-kit/core";
import socket from "@/utils/socket";
import { revalidateBoards } from "@/api/board";
import TasksHeader from "./TasksHeader";
import SelectedTasks from "./SelectedTasks";

const initialState = {
  status: "pending",
  payload: null,
  message: "",
  errors: null,
};

export default function Tasks({
  tasks,
  project,
  boardId,
  optimisticColor,
  activeId,
}) {
  const inputRef = useRef(null);
  const [isWritting, setIsWritting] = useState(false);

  const saveTaskWithProjectId = saveTask.bind(null, project?._id);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [state, formAction, pending] = useActionState(
    saveTaskWithProjectId,
    initialState
  );

  useEffect(() => {
    if (state?.status === "success") {
      inputRef?.current?.focus();
      setIsWritting(false);

      socket.emit("update task", project?._id);
    }
  }, [state]);

  const { setNodeRef } = useDroppable({
    id: boardId,
  });
  return (
    <div
      className={styles.container}
      suppressHydrationWarning
      style={{
        borderLeft: `3px solid ${optimisticColor}`,
      }}
      data-board-id={boardId}
    >
      <div className={styles.list} ref={setNodeRef}>
        {/* Task headers */}
        {/* <TasksHeader /> */}
        {tasks?.map((task) => (
          <Task
            key={task._id}
            task={task}
            project={project}
            isDragging={task?._id === activeId}
            selectedTasks={selectedTasks}
            setSelectedTasks={setSelectedTasks}
          />
        ))}
        <div className={styles.add}>
          <FontAwesomeIcon icon={faPlus} />
          <form action={formAction}>
            <input
              type="text"
              name="board-id"
              id="board-id"
              defaultValue={boardId}
              hidden
            />
            <input
              type="text"
              name="new-task"
              id="new-task"
              placeholder=" Ajouter une tâche"
              autoComplete="off"
              ref={inputRef}
              onChange={(e) => {
                if (e.target.value.length > 0) {
                  setIsWritting(true);
                } else {
                  setIsWritting(false);
                }
              }}
            />
            <button type="submit" hidden>
              Ajouter une tâche
            </button>
          </form>
        </div>
      </div>

      {isWritting && (
        <div className={styles.info}>
          <p>
            Appuyer sur <span>entrée</span> pour ajouter une tâche
          </p>
        </div>
      )}
      {selectedTasks.length > 0 && <SelectedTasks tasks={selectedTasks} />}
    </div>
  );
}
