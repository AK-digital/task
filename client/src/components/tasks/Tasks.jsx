"use client";
import styles from "@/styles/components/tasks/tasks.module.css";
import Task from "./Task";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { useActionState, useEffect, useRef, useState } from "react";
import { saveTask } from "@/actions/task";
import { useDroppable } from "@dnd-kit/core";
import socket from "@/utils/socket";
import SelectedTasks from "./SelectedTasks";
import TasksHeader from "./TasksHeader"; // Assurez-vous que cette importation existe
import { Plus } from "lucide-react";

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
  activeId,
  selectedTasks,
  setSelectedTasks,
  archive,
}) {
  const inputRef = useRef(null);
  const [isWritting, setIsWritting] = useState(false);

  const saveTaskWithProjectId = saveTask.bind(null, project?._id);
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
      data-board-id={boardId}
    >
      {tasks && tasks?.length > 0 && <TasksHeader />}
      <div className={styles.list} ref={setNodeRef}>
        {tasks?.map((task) => (
          <Task
            key={task?._id}
            task={task}
            project={project}
            isDragging={task?._id === activeId}
            setSelectedTasks={setSelectedTasks}
            archive={archive}
          />
        ))}
        {!archive && (
          <div className={styles.add}>
            <Plus size={18} />
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
        )}
      </div>

      {isWritting && (
        <div className={styles.info}>
          <p>
            Appuyer sur <span>entrée</span> pour ajouter une tâche
          </p>
        </div>
      )}
      {selectedTasks?.length > 0 && (
        <SelectedTasks
          project={project}
          tasks={selectedTasks}
          setSelectedTasks={setSelectedTasks}
          archive={archive}
        />
      )}
    </div>
  );
}
