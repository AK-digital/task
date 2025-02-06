"use client";
import styles from "@/styles/components/tasks/tasks.module.css";
import Task from "./Task";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { useActionState, useEffect, useState } from "react";
import { saveTask } from "@/actions/task";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const initialState = {
  status: "pending",
  payload: null,
  message: "",
  errors: null,
};

const ItemType = {
  TASK: "task",
};

export default function Tasks({
  tasks: initialTasks,
  project,
  boardId,
  optimisticColor,
}) {
  const saveTaskWithProjectId = saveTask.bind(null, project?._id);
  const [state, formAction, pending] = useActionState(
    saveTaskWithProjectId,
    initialState
  );
  const [tasks, setTasks] = useState(initialTasks);
  const [isWritting, setIsWritting] = useState(false);

  useEffect(() => {
    if (state?.status === "success") setIsWritting(false);
  }, [state]);

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const moveTask = (dragIndex, hoverIndex) => {
    const updatedTasks = [...tasks];
    const [draggedTask] = updatedTasks.splice(dragIndex, 1);
    updatedTasks.splice(hoverIndex, 0, draggedTask);
    setTasks(updatedTasks);
    // Here you would typically call your API to update the task order
    // updateTaskOrder(updatedTasks);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div
        className={styles["tasks"]}
        style={{
          borderLeft: `2px solid ${optimisticColor}`,
        }}
      >
        <div className={styles["tasks__list"]}>
          {tasks?.map((task, index) => (
            <Task
              key={task?._id}
              task={task}
              project={project}
              index={index}
              moveTask={moveTask}
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
    </DndProvider>
  );
}
