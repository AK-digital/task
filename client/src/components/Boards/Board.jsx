"use client";
import { useState, useEffect, useRef, useActionState, startTransition } from "react";
import BoardHeader from "./BoardHeader";
import { Plus } from "lucide-react";
import { saveTask } from "@/actions/task";
import socket from "@/utils/socket";
import { useUserRole } from "../../../hooks/useUserRole";
import { useDroppable } from "@dnd-kit/core";
import { TaskPending } from "../Task/TaskPending";
import Tasks from "../tasks/Tasks";
import { useProjectContext } from "@/context/ProjectContext";
import { isNotEmpty } from "@/utils/utils";

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
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Fonction pour gérer le clic sur "Ajouter une tâche" depuis le header
  const handleAddTaskClick = () => {
    if (inputRef.current) {
      // Forcer l'ouverture du tableau si fermé
      if (!open) {
        setOpen(true);
      }
      
      // Utiliser requestAnimationFrame pour s'assurer que le DOM est mis à jour
      requestAnimationFrame(() => {
        if (inputRef.current) {
          // Scroll vers l'input avec animation fluide
          inputRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
          });
          
          // Focus avec délai pour laisser le temps au scroll
          setTimeout(() => {
            if (inputRef.current) {
              inputRef.current.focus();
            }
          }, 500);
        }
      });
    }
  };

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
        
        // Vider l'input et supprimer l'état d'édition
        setInputValue("");
        setIsWritting(false);
        setIsInputFocused(false);
        
        // Réinitialiser l'input
        if (inputRef.current) {
          inputRef.current.value = "";
        }

        await mutateTasks();

        socket.emit("update task", project?._id);

        setIsLoading(false);
        
        // Remettre le focus dans l'input après la création
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
            setIsInputFocused(true);
          }
        }, 100);
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
      className={` flex flex-col min-w-[1050px] rounded-[10px] shadow-small border-secondary bg-secondary border-l-[3px] ${
        isOverlay ? "relative translate-z-0 will-change-transform z-50000" : ""
      }`}
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
        displayedElts={displayedElts}
        onAddTask={handleAddTaskClick}
      />
      {/* Board content */}
      {open && !isOverlay && isNotEmpty(tasks) && (
        <div className="bg-secondary px-5 rounded-2xl">
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
          <div className={`flex items-center gap-0.5 py-2 px-3 transition-all duration-200 rounded-bl-[15px] rounded-br-[15px] select-none pl-10 ${
            isInputFocused 
              ? 'shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.1)]' 
              : 'shadow-[inset_0_3px_3px_0_rgba(0,0,0,0.063)]'
          }`}>
            <Plus size={18} className="text-text-color-muted" />
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                startTransition(() => {
                  formAction(formData);
                });
              }} 
              className="w-full"
            >
              <input
                type="text"
                name="board-id"
                id="board-id"
                defaultValue={board?._id}
                hidden
                className="border-none bg-inherit py-1.5 px-1 text-normal "
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
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  if (e.target.value.length > 0) {
                    setIsWritting(true);
                  } else {
                    setIsWritting(false);
                  }
                }}
                style={{ 
                  width: 'calc(15px + 0.375rem + 1rem + 36% + 1rem)', // checkbox + drag margin + drag width + text min-width + text margins
                  minWidth: 'calc(15px + 0.375rem + 1rem + 150px + 1rem)'
                }}
                className={`ml-2 font-bricolage p-1 text-normal transition-all duration-200 border rounded-sm hover:bg-third hover:border-gray-300 ${
                  isInputFocused 
                    ? 'border-accent-color bg-third focus:text-text-darker-color' 
                    : 'border-transparent bg-inherit'
                }`}
              />
              <button type="submit" hidden className="font-bricolage">
                Ajouter une tâche
              </button>
            </form>
          </div>
          {isWritting && (
            <div className="absolute mt-1 ml-[24px] text-text-color-muted text-small">
              <p>
                Appuyer sur{" "}
                <span className="text-accent-color-light">entrée</span> pour
                ajouter une tâche
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
