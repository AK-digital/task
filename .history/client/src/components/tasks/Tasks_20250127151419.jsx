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
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { updateTaskOrder } from "@/api/task";

const initialState = {
  status: "pending",
  payload: null,
  message: "",
  errors: null,
};

export default function Tasks({ tasks, project, boardId, optimisticColor }) {
  const [taskItems, setTaskItems] = useState(tasks || []);
  const [isWritting, setIsWritting] = useState(false);

  useEffect(() => {
    setTaskItems(tasks || []);
  }, [tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const saveTaskWithProjectId = saveTask.bind(null, project?._id);
  const [state, formAction, pending] = useActionState(
    saveTaskWithProjectId,
    initialState
  );

  useEffect(() => {
    if (state?.status === "success") setIsWritting(false);
  }, [state]);

  async function handleDragEnd(event) {
    const { active, over } = event;

    let newItems;

    if (active.id !== over.id) {
      setTaskItems((items) => {
        const oldIndex = items.findIndex((task) => task._id === active.id);
        const newIndex = items.findIndex((task) => task._id === over.id);

        newItems = arrayMove(items, oldIndex, newIndex);

        return newItems;
      });

      await updateTaskOrder(taskItems, project?._id);
      // Ici vous pouvez ajouter la logique pour sauvegarder le nouvel ordre
      // par exemple avec une fonction updateTaskOrder(taskItems)
    }
  }

  return (
    <div
      className={styles["tasks"]}
      suppressHydrationWarning
      style={{
        borderLeft: `2px solid ${optimisticColor}`,
      }}
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <div className={styles["tasks__list"]}>
          <SortableContext
            items={taskItems.map((task) => task._id)}
            strategy={verticalListSortingStrategy}
          >
            {taskItems?.map((task) => (
              <Task key={task._id} task={task} project={project} />
            ))}
          </SortableContext>

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
      </DndContext>

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
