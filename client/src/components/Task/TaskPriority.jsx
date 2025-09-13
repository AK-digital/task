import { updateTaskPriority } from "@/actions/task";
import { useCallback, useMemo, useState } from "react";
import socket from "@/utils/socket";
import { useUserRole } from "../../../hooks/useUserRole";
import { Pen, Plus, Save } from "lucide-react";
import { useProjectContext } from "@/context/ProjectContext";
import TaskEditPriority from "./TaskEditPriority";
import { savePriority } from "@/api/priority";
import { priorityColors } from "@/utils/utils";
import { getFloating, usePreventScroll } from "@/utils/floating";
import FloatingMenu from "@/shared/components/FloatingMenu";
import { usePriorities } from "../../../hooks/usePriorities";
import Sidebar from "../Sidebar/Sidebar";

export default function TaskPriority({ task }) {
  const { project, mutateTasks, priorities, mutatePriorities } =
    useProjectContext();
  const { priorities: prioritiesData, mutatePriorities: mutatePrioritiesData } =
    usePriorities(project?._id || task?.projectId?._id);
  const [currentPriority, setCurrentPriority] = useState(task?.priority);
  const [isEdit, setIsEdit] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const maxPriorities = priorities?.length === 12;

  const canEdit = useUserRole(project || task?.projectId, [
    "owner",
    "manager",
    "team",
    "customer",
  ]);

  const { refs, floatingStyles } = getFloating(isOpen, setIsOpen);

  usePreventScroll({
    elementRef: refs.floating,
    shouldPrevent: true,
    mode: "element",
  });

  async function handleTaskUpdatePriority(priority) {
    if (!canEdit) return;

    setCurrentPriority(priority);
    setIsOpen(false);

    const response = await updateTaskPriority(
      task?._id,
      project?._id || task?.projectId?._id,
      priority?._id
    );

    if (response?.status === "failure") {
      setCurrentPriority(task?.priority);
      return;
    }

    socket.emit("update task", project?._id);

    mutateTasks();
    mutatePriorities();
    mutatePrioritiesData();
  }

  async function handleAddPriority() {
    if (!canEdit) return;

    // Get a random color for the new priority and prevent duplicates colors from priorities
    const existingColors = priorities.map((priority) => priority?.color);
    const availableColors = priorityColors.filter(
      (color) => !existingColors.includes(color)
    );
    const randomColor =
      availableColors[Math.floor(Math.random() * availableColors?.length)];

    const response = await savePriority(project?._id || task?.projectId?._id, {
      name: "Nouvelle priorité",
      color: randomColor,
    });

    if (!response?.success) {
      console.error("Failed to save priority:", response.message);
      return;
    }

    mutatePriorities();
    mutatePrioritiesData();
  }

  const handleIsOpen = useCallback(() => {
    if (!canEdit) return;

    setIsOpen((prev) => !prev);
    setIsEdit(false);
  }, [canEdit]);

  function handleEditPriority() {
    if (!canEdit) return;

    setIsOpen(false);
    setIsSidebarOpen(true);
  }

  useMemo(() => {
    setCurrentPriority(task?.priority);
  }, [task?.priority]);

  const hasPriority = currentPriority?.name;
  const currentBackgroundColor = hasPriority
    ? currentPriority?.color
    : "#afbde9";

  function listWidth() {
    if (isEdit && prioritiesData?.length > 5) {
      return true;
    } else if (!isEdit && prioritiesData?.length > 6) {
      return true;
    }

    return false;
  }

  return (
    <div className="task-col-priority task-content-col  relative select-none text-xs lg:text-normal">
      <div
        className="relative w-full min-w-[70px] lg:min-w-[110px] text-center cursor-pointer p-1.5 rounded-3xl mx-2 lg:mx-3 text-white whitespace-nowrap text-ellipsis overflow-hidden text-[14px]"
        style={{ backgroundColor: currentBackgroundColor }}
        onClick={handleIsOpen}
        ref={refs.setReference}
      >
        <span>{currentPriority?.name || "Basse"}</span>
      </div>
      {isOpen && (
        <FloatingMenu
          setIsOpen={setIsOpen}
          className={listWidth() ? "w-[380px]" : "w-[240px]"}
          refs={refs}
          floatingStyles={floatingStyles}
        >
          <ul className="grid grid-flow-col grid-rows-[repeat(6,auto)] gap-2 p-3 border-b border-color-border-color">
            {prioritiesData?.map((priority) => {
              if (!isEdit) {
                return (
                  <li
                    key={priority?._id}
                    className="p-1.5 min-w-[110px] cursor-pointer text-white text-[14px] rounded-3xl flex items-center justify-center transition-all duration-[60ms] linear hover:opacity-80"
                    data-value={priority?.name}
                    onClick={() => handleTaskUpdatePriority(priority)}
                    style={{ backgroundColor: priority?.color }}
                  >
                    {priority?.name}
                  </li>
                );
              } else {
                return (
                  <TaskEditPriority
                    key={priority?._id}
                    priority={priority}
                    currentPriority={currentPriority}
                    setCurrentPriority={setCurrentPriority}
                  />
                );
              }
            })}
            {isEdit && !maxPriorities && (
              <li
                className="flex items-center gap-1 border-none py-2 px-4 rounded-3xl bg-text-lighter-color text-[15px] text-text-dark-color transition-all duration-[120ms] ease-in-out min-w-[135px] max-w-[150px] cursor-pointer hover:bg-text-light-color"
                onClick={handleAddPriority}
              >
                <Plus size={16} />
                Ajouter
              </li>
            )}
          </ul>
          <div className="flex items-center p-2 justify-center gap-2">
          <span
            className="secondary-button"
            onClick={handleEditPriority}
          >
            <Pen size={16} /> Modifier les priorités
          </span>
          </div>
        </FloatingMenu>
      )}
      
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        title="Modifier les priorités"
        width="500px"
      >
        <div className="space-y-4">
          <p className="text-text-color-muted text-sm">
            Gérez les priorités de votre projet. Vous pouvez modifier les noms, couleurs et ajouter de nouvelles priorités.
          </p>
          
          <ul className="space-y-3">
            {prioritiesData?.map((priority) => (
              <TaskEditPriority
                key={priority?._id}
                priority={priority}
                currentPriority={currentPriority}
                setCurrentPriority={setCurrentPriority}
              />
            ))}
            
            {!maxPriorities && (
              <li
                className="secondary-button w-fit"
                onClick={handleAddPriority}
              >
                <Plus size={16} />
                Ajouter une nouvelle priorité
              </li>
            )}
          </ul>
        </div>
      </Sidebar>
    </div>
  );
}
