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

export default function TaskPriority({ task }) {
  const { project, mutateTasks, priorities, mutatePriorities } =
    useProjectContext();
  const { priorities: prioritiesData, mutatePriorities: mutatePrioritiesData } =
    usePriorities(project?._id || task?.projectId?._id);
  const [currentPriority, setCurrentPriority] = useState(task?.priority);
  const [isEdit, setIsEdit] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

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

    setIsEdit((prev) => !prev);
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
    <div className="relative flex items-center select-none border-r border-text-light-color text-xs lg:text-normal text-text-color min-w-[80px] sm:min-w-[100px] lg:min-w-[120px] max-w-[150px] w-full h-full flex-shrink-0">
      <div
        className="relative w-full min-w-[70px] lg:min-w-[110px] text-center cursor-pointer py-1.5 lg:py-2 px-2 lg:px-4 rounded-3xl mx-2 lg:mx-3 text-white whitespace-nowrap text-ellipsis overflow-hidden"
        style={{ backgroundColor: currentBackgroundColor }}
        onClick={handleIsOpen}
        ref={refs.setReference}
      >
        <span>{currentPriority?.name || "Basse"}</span>
      </div>
      {isOpen && (
        <FloatingMenu
          setIsOpen={setIsOpen}
          className={listWidth() ? "w-[380px]" : "w-[220px]"}
          refs={refs}
          floatingStyles={floatingStyles}
        >
          <ul className="grid grid-flow-col grid-rows-[repeat(6,auto)] gap-2 p-3 border-b border-color-border-color">
            {prioritiesData?.map((priority) => {
              if (!isEdit) {
                return (
                  <li
                    key={priority?._id}
                    className="py-2 px-4 min-w-[135px] cursor-pointer text-white rounded-3xl text-center min-h-[34px]"
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
          {isEdit ? (
            <button
              className="bg-transparent w-full outline-none border-none text-text-dark-color p-1 mt-2 text-center flex items-center justify-center gap-2 text-[0.9rem] rounded-sm hover:bg-text-lighter-color hover:shadow-none"
              onClick={handleEditPriority}
            >
              <Save size={16} />
              Appliquer
            </button>
          ) : (
            <button
              className="bg-transparent w-full outline-none border-none text-text-dark-color p-1 mt-2 text-center flex items-center justify-center gap-2 text-[0.9rem] rounded-sm hover:bg-text-lighter-color hover:shadow-none"
              onClick={handleEditPriority}
            >
              <Pen size={16} /> Modifier les priorités
            </button>
          )}
        </FloatingMenu>
      )}
    </div>
  );
}
