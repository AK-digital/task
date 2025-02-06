"use client";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import styles from "@/styles/components/tasks/tasks.module.css";
import Task from "./Task";
import { saveTask } from "@/actions/task";

export default function Tasks({
  tasks = [],
  project,
  boardId,
  optimisticColor,
}) {
  console.log(tasks);
  const saveTaskWithProjectId = saveTask.bind(null, project?._id);
  const [state, formAction, pending] = useActionState(
    saveTaskWithProjectId,
    initialState
  );

  const [taskList, setTaskList] = useState(tasks); // State pour gérer l'ordre des tâches

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setTaskList((prev) => {
        const oldIndex = prev.findIndex((task) => task._id === active.id);
        const newIndex = prev.findIndex((task) => task._id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext
        items={taskList.map((task) => task._id)}
        strategy={rectSortingStrategy}
      >
        <div
          className={styles["tasks"]}
          style={{
            borderLeft: `2px solid ${optimisticColor}`,
          }}
        >
          <div className={styles["tasks__list"]}>
            {taskList.map((task) => (
              <Task
                task={task}
                project={project}
                key={task._id}
                id={task._id}
              />
            ))}
            <div className={styles["task__add"]}>
              <FontAwesomeIcon icon={faPlus} />
              {/* Formulaire pour ajouter une nouvelle tâche */}
              <form>
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
                />
                <button type="submit" hidden>
                  Ajouter une tâche
                </button>
              </form>
            </div>
          </div>
        </div>
      </SortableContext>
    </DndContext>
  );
}
