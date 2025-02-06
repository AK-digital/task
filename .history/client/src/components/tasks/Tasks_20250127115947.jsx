"use client";
import styles from "@/styles/components/tasks/tasks.module.css";
import Task from "./Task";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { useActionState, useEffect, useState } from "react";
import { saveTask } from "@/actions/task";
import { DndContext } from "@dnd-kit/core";

const initialState = {
  status: "pending",
  payload: null,
  message: "",
  errors: null,
};

export default function Tasks({ tasks, project, boardId, optimisticColor }) {
  const [isDropped, setIs]
  const saveTaskWithProjectId = saveTask.bind(null, project?._id);
  const [state, formAction, pending] = useActionState(
    saveTaskWithProjectId,
    initialState
  );

  const [isWritting, setIsWritting] = useState(false);

  useEffect(() => {
    if (state?.status === "success") setIsWritting(false);
  }, [state]);

  return (
    <DndContext>
      <div
        className={styles["tasks"]}
        style={{
          borderLeft: `2px solid ${optimisticColor}`,
        }}
      >
        <div className={styles["tasks__list"]}>
          {tasks?.map((task) => {
            return <Task task={task} project={project} key={task?._id} />;
          })}
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
                placeholder="Nouvelle tâche"
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
    </DndContext>
  );
}
