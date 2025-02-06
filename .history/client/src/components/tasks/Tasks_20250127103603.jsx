"use client";
import styles from "@/styles/components/tasks/tasks.module.css";
import Task from "./Task";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { useActionState, useEffect, useState } from "react";
import { saveTask } from "@/actions/task";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";

const initialState = {
  status: "pending",
  payload: null,
  message: "",
  errors: null,
};

export default function Tasks({
  tasks: initialTasks = [],
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

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(tasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setTasks(items);
    // Ici vous pouvez appeler votre API pour sauvegarder le nouvel ordre
    // updateTaskOrder(items);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div
        className={styles["tasks"]}
        style={{
          borderLeft: `2px solid ${optimisticColor}`,
        }}
      >
        <Droppable droppableId={boardId || "board"}>
          {(provided) => (
            <div
              className={styles["tasks__list"]}
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {tasks?.map((task, index) => (
                <Task
                  key={task._id}
                  task={task}
                  project={project}
                  index={index}
                />
              ))}
              {provided.placeholder}
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
          )}
        </Droppable>
        {isWritting && (
          <div className={styles["tasks__info"]}>
            <p>
              Appuyer sur <span>entrée</span> pour ajouter une tâche
            </p>
          </div>
        )}
      </div>
    </DragDropContext>
  );
}
