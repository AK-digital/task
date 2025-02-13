"use client";
import styles from "@/styles/components/tasks/tasks.module.css";
import Task from "./Task";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { useActionState, useEffect, useRef, useState } from "react";
import { saveTask } from "@/actions/task";

const initialState = {
  status: "pending",
  payload: null,
  message: "",
  errors: null,
};

export default function Tasks({ tasks, project, boardId, optimisticColor }) {
  const inputRef = useRef(null);
  const [isWritting, setIsWritting] = useState(false);
  const [items, setItems] = useState(tasks || []);

  useEffect(() => {
    setItems(tasks);
  }, [tasks]);

  const saveTaskWithProjectId = saveTask.bind(null, project?._id);
  const [state, formAction, pending] = useActionState(
    saveTaskWithProjectId,
    initialState
  );

  useEffect(() => {
    if (state?.status === "success") {
      inputRef?.current?.focus();
      setIsWritting(false);
    }
  }, [state]);

  return (
    <div
      className={styles["tasks"]}
      suppressHydrationWarning
      style={{
        borderLeft: `3px solid ${optimisticColor}`,
      }}
      data-board-id={boardId}
    >
      <div className={styles["tasks__list"]}>
        {items?.map((task, index) => (
          <Task
            key={task._id}
            task={task}
            project={project}
            index={index}
            boardId={boardId}
          />
        ))}
        <div className={styles["task__add"]}>
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
        <div className={styles["tasks__info"]}>
          <p>
            Appuyer sur <span>entrée</span> pour ajouter une tâche
          </p>
        </div>
      )}
    </div>
  );
}
