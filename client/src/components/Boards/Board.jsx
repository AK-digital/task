"use client";
import styles from "@/styles/components/boards/board.module.css";
import { useState, useEffect, useRef, useActionState } from "react";
import BoardHeader from "./BoardHeader";
import { Plus } from "lucide-react";
import { saveTask } from "@/actions/task";
import socket from "@/utils/socket";
import { useUserRole } from "@/app/hooks/useUserRole";
import { useDroppable } from "@dnd-kit/core";
import { TaskPending } from "../Task/TaskPending";
import Tasks from "../tasks/Tasks";

const initialState = {
  success: null,
  payload: null,
  message: "",
  errors: null,
};

export default function Board({
  tasks,
  displayedElts,
  mutateTasks,
  project,
  board,
  activeId,
  selectedTasks,
  setSelectedTasks,
  archive,
  isOverlay = false, // Nouvelle prop pour indiquer si le board est dans un DragOverlay
}) {
  const { setNodeRef } = useDroppable({
    id: board?._id,
  });
  const inputRef = useRef(null);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(true);
  const [isWritting, setIsWritting] = useState(false);
  const [optimisticColor, setOptimisticColor] = useState(board?.color);

  const canPost = useUserRole(project, [
    "owner",
    "manager",
    "team",
    "customer",
  ]);

  // Load the stored value after component mounts
  useEffect(() => {
    // Ne pas charger l'état du localStorage si c'est un overlay
    if (!isOverlay) {
      const storedValue = localStorage.getItem(`board-${board?._id}`);
      if (storedValue !== null) {
        setOpen(JSON.parse(storedValue));
      }
    }
  }, [board?._id, isOverlay]);

  const saveTaskWithProjectId = saveTask.bind(null, project?._id);
  const [state, formAction, pending] = useActionState(
    saveTaskWithProjectId,
    initialState
  );

  useEffect(() => {
    async function handleTaskCreated() {
      if (state?.success === true) {
        setIsLoading(true);
        inputRef?.current?.focus();
        setIsWritting(false);

        await mutateTasks();

        socket.emit("update task", project?._id);

        setIsLoading(false);
      }
    }

    handleTaskCreated();
  }, [state]);

  useEffect(() => {
    if (isOverlay === true) {
      setOpen(false);
    }
  }, [isOverlay]);

  // Appliquer une classe spéciale si c'est un overlay
  const boardClasses = `${styles.container} ${
    isOverlay ? styles.overlayBoard : ""
  }`;

  return (
    <div
      className={boardClasses}
      data-board={board?._id}
      style={{ borderLeft: `solid 3px ${optimisticColor}` }}
      ref={setNodeRef}
      data-board-id={board?._id}
    >
      {/* Board header - Utilisation de la classe sticky */}
      <BoardHeader
        board={board}
        open={open}
        setOpen={setOpen}
        tasks={tasks}
        project={project}
        setOptimisticColor={setOptimisticColor}
        optimisticColor={optimisticColor}
        selectedTasks={selectedTasks}
        setSelectedTasks={setSelectedTasks}
        archive={archive}
        isOverlay={isOverlay}
      />
      {/* Board content */}
      {open && !isOverlay && (
        <div className={styles.tasks}>
          <Tasks
            tasks={tasks}
            project={project}
            mutateTasks={mutateTasks}
            activeId={activeId}
            displayedElts={displayedElts}
            selectedTasks={selectedTasks}
            setSelectedTasks={setSelectedTasks}
            archive={archive}
          />
        </div>
      )}
      {isLoading && <TaskPending text={inputValue} />}
      {canPost && !archive && (
        <div className={styles.footer}>
          <div className={styles.add}>
            <Plus size={18} />
            <form action={formAction}>
              <input
                type="text"
                name="board-id"
                id="board-id"
                defaultValue={board?._id}
                hidden
              />
              <input
                type="text"
                name="new-task"
                id="new-task"
                placeholder=" Ajouter une tâche"
                autoComplete="off"
                minLength={2}
                maxLength={255}
                ref={inputRef}
                onChange={(e) => {
                  setInputValue(e.target.value);
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
          {isWritting && (
            <div className={styles.info}>
              <p>
                Appuyer sur <span>entrée</span> pour ajouter une tâche
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
