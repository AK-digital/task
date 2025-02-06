"use client";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import styles from "@/styles/components/tasks/tasks.module.css";
import Task from "./Task";

export default function Tasks({
  tasks = [], // Défaut: tableau vide si tasks est undefined
  project,
  boardId,
  optimisticColor,
}) {
  const [taskList, setTaskList] = useState([]); // Commence avec un tableau vide
  const [isMounted, setIsMounted] = useState(false);

  // Synchroniser le taskList après le rendu initial côté client
  useEffect(() => {
    setTaskList(tasks); // Met à jour taskList avec les tasks passées une fois le composant monté côté client
    setIsMounted(true); // Signale que le composant est monté
  }, [tasks]);

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

  // Si le composant n'est pas encore monté (SSR), ne pas afficher
  if (!isMounted) {
    return null; // ou un chargement
  }

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
            {taskList?.map((task) => (
              <Task
                task={task}
                project={project}
                key={task._id}
                id={task._id}
              />
            ))}
            <div className={styles["task__add"]}>
              <FontAwesomeIcon icon={faPlus} />
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
