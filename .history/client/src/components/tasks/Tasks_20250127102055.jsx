"use client";
import styles from "@/styles/components/tasks/tasks.module.css";
import Task from "./Task";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { useActionState, useEffect, useState } from "react";
import { saveTask } from "@/actions/task";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

const initialState = {
  status: "pending",
  payload: null,
  message: "",
  errors: null,
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

  // Configuration des sensors pour le drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (state?.status === "success") setIsWritting(false);
  }, [state]);

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setTasks((items) => {
        const oldIndex = items.findIndex((item) => item._id === active.id);
        const newIndex = items.findIndex((item) => item._id === over.id);

        const newOrder = arrayMove(items, oldIndex, newIndex);
        // Ici vous pouvez appeler votre API pour sauvegarder le nouvel ordre
        // updateTaskOrder(newOrder);
        return newOrder;
      });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div
        className={styles["tasks"]}
        style={{
          borderLeft: `2px solid ${optimisticColor}`,
        }}
      >
        <SortableContext
          items={tasks?.map((task) => task._id)}
          strategy={verticalListSortingStrategy}
        >
          <div className={styles["tasks__list"]}>
            {tasks?.map((task) => (
              <Task key={task._id} task={task} project={project} />
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
        </SortableContext>
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
