"use client";
import { useState, useEffect, useRef, useActionState } from "react";
import BoardHeader from "./BoardHeader";
import { Plus } from "lucide-react";
import { saveTask } from "@/actions/task";
import socket from "@/utils/socket";
import { useUserRole } from "@/app/hooks/useUserRole";
import { useDroppable } from "@dnd-kit/core";
import { TaskPending } from "../Task/TaskPending";
import Tasks from "../tasks/Tasks";
import { useProjectContext } from "@/context/ProjectContext";

const initialState = {
  success: null,
  payload: null,
  message: "",
  errors: null,
};

export default function Board({
  tasks,
  displayedElts,
  board,
  activeId,
  selectedTasks,
  setSelectedTasks,
  isOverlay = false, // Nouvelle prop pour indiquer si le board est dans un DragOverlay
}) {
  const { project, mutateTasks, archive } = useProjectContext();

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

  return (
    <div
      data-board={board?._id}
      ref={setNodeRef}
      data-board-id={board?._id}
      style={{ borderColor: `${optimisticColor}` }}
      className={`relative flex flex-col min-w-[1050px] rounded-2xl shadow-shadow-box-small border-background-secondary-color bg-background-secondary-color border-r-[3px] border-l-[3px] ${isOverlay ? 'overlayBoard' : ''}`}
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
        <div className="bg-background-secondary-color px-5">
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
        <div>
          <div className="flex items-center gap-0.5 h-[45px] px-3 bg-[#F6F4E9] shadow-[inset_0_3px_3px_0_rgba(0,0,0,0.063)] rounded-bl-[calc(var(--radius-border-radius-medium)-1px)] rounded-br-[calc(var(--radius-border-radius-medium)-1px)]">
            <Plus size={18} className="text-text-color-muted" />
            <form action={formAction} className="w-full">
              <input
                type="text"
                name="board-id"
                id="board-id"
                defaultValue={board?._id}
                hidden
                className="border-none bg-inherit py-1.5 px-1 text-text-size-normal"
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
                className="font-bricolage border-none bg-inherit py-1.5 px-1 text-text-size-normal"
              />
              <button
                type="submit"
                hidden
                className="font-bricolage"
              >
                Ajouter une tâche
              </button>
            </form>
          </div>
          {isWritting && (
            <div className="absolute mt-1 ml-[25px] text-text-color-muted text-text-size-small">
              <p>
                Appuyer sur <span className="text-text-accent-color">entrée</span> pour ajouter une tâche
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
