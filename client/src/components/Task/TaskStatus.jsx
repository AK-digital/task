"use client";
import { updateTaskStatus } from "@/actions/task";
import { useCallback, useMemo, useState } from "react";
import socket from "@/utils/socket";
import { useUserRole } from "../../../hooks/useUserRole";
import { getFloating, usePreventScroll } from "@/utils/floating";
import { Pen, Plus, Save } from "lucide-react";
import { useProjectContext } from "@/context/ProjectContext";
import TaskEditStatus from "./TaskEditStatus";
import { saveStatus } from "@/api/status";
import { colors } from "@/utils/utils";
import FloatingMenu from "@/shared/components/FloatingMenu";
import Sidebar from "../Sidebar/Sidebar";

export default function TaskStatus({ task, uid }) {
  const { project, mutateTasks, statuses, mutateStatuses } =
    useProjectContext();
  const [currentStatus, setCurrentStatus] = useState(task?.status);
  const [isEdit, setIsEdit] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const maxStatuses = statuses?.length === 12;

  const { refs, floatingStyles } = getFloating(isOpen, setIsOpen);

  usePreventScroll({
    elementRef: refs.floating,
    shouldPrevent: true,
    mode: "element",
  });

  const canEdit = useUserRole(project || task?.projectId, [
    "owner",
    "manager",
    "team",
    "customer",
  ]);

  async function handleTaskUpdateStatus(status) {
    if (!canEdit) return;
    setCurrentStatus(status);
    setIsOpen(false);

    const res = await updateTaskStatus(
      task?._id,
      project?._id || task?.projectId?._id,
      status?._id
    );

    if (!res?.success) {
      setCurrentStatus(task?.status);
      return;
    }

    socket.emit("update task", project?._id || task?.projectId?._id);
    mutateTasks();
    mutateStatuses();
  }

  async function handleAddStatus() {
    if (!canEdit) return;

    // Get a random color for the new status and prevent duplicates colors from statuses
    const existingColors = statuses.map((status) => status?.color);
    const availableColors = colors.filter(
      (color) => !existingColors.includes(color)
    );
    const randomColor =
      availableColors[Math.floor(Math.random() * availableColors?.length)];

    const response = await saveStatus(project?._id || task?.projectId?._id, {
      name: "Nouveau statut",
      color: randomColor,
    });

    if (!response?.success) {
      console.error("Failed to save status:", response.message);
      return;
    }

    mutateStatuses();
  }

  const handleIsOpen = useCallback(() => {
    if (!canEdit) return;

    setIsOpen((prev) => !prev);
    setIsEdit(false);
  }, [project, uid]);

  function handleEditStatus() {
    if (!canEdit) return;

    setIsOpen(false);
    setIsSidebarOpen(true);
  }

  useMemo(() => {
    setCurrentStatus(task?.status);
  }, [task?.status]);

  const hasStatus = currentStatus?.name;
  const currentBackgroundColor = hasStatus ? currentStatus?.color : "#b3bcc0";

  function listWidth() {
    if (isEdit && statuses?.length > 5) {
      return true;
    } else if (!isEdit && statuses?.length > 6) {
      return true;
    }

    return false;
  }

  return (
    <div className="task-col-status task-content-col  select-none text-xs lg:text-normal text-foreground">
      <div
        className="relative w-full min-w-[70px] lg:min-w-[110px] text-center cursor-pointer p-1.5 rounded-[5px] mx-2 lg:mx-3 text-white whitespace-nowrap text-ellipsis overflow-hidden text-[14px]"
        style={{ backgroundColor: currentBackgroundColor }}
        onClick={handleIsOpen}
        ref={refs.setReference}
      >
        <span>{currentStatus?.name || "En attente"}</span>
      </div>

      {isOpen && (
        <FloatingMenu
          setIsOpen={setIsOpen}
          className={listWidth() ? "w-[380px]" : "w-[190px]"}
          refs={refs}
          floatingStyles={floatingStyles}
        >
          <ul className="grid grid-flow-col grid-rows-[repeat(6,auto)] gap-1.5 pt-3 px-3 pb-1 border-b border-color-border-color">
            {statuses?.map((status) => {
              if (!isEdit) {
                return (
                  <li
                    key={status?._id}
                    className="p-2 min-w-[110px] cursor-pointer text-white text-[14px] rounded-[5px] flex items-center justify-center transition-all duration-[60ms] linear hover:opacity-80"
                    data-value={status?.name}
                    onClick={() => handleTaskUpdateStatus(status)}
                    style={{ backgroundColor: status?.color }}
                  >
                    {status?.name}
                  </li>
                );
              } else {
                return (
                  <TaskEditStatus
                    key={status?._id}
                    status={status}
                    currentStatus={currentStatus}
                    setCurrentStatus={setCurrentStatus}
                  />
                );
              }
            })}
            {isEdit && !maxStatuses && (
              <li
                className="flex items-center gap-1 border-none py-2 px-4 rounded-3xl bg-text-lighter-color text-[15px] text-text-dark-color transition-all duration-[120ms] ease-in-out min-w-[135px] max-w-[150px] cursor-pointer hover:bg-text-light-color"
                onClick={handleAddStatus}
              >
                <Plus size={16} />
                Ajouter
              </li>
            )}
          </ul>
          <div className="flex items-center p-1.5 justify-center gap-1 my-1">
          <span
              className="secondary-button text-[12px]"
            onClick={handleEditStatus}
          >
            <Pen size={15} /> Modifier les statuts
          </span>
          </div>
        </FloatingMenu>
      )}
      
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        title="Modifier les statuts"
        width="500px"
      >
        <div className="space-y-4">
          <p className="text-text-color-muted text-sm">
            Gérez les statuts de votre projet. Vous pouvez modifier les noms, couleurs et ajouter de nouveaux statuts.
          </p>
          
          <ul className="space-y-3 sidebar-edit-container">
            {statuses?.map((status) => (
              <TaskEditStatus
                key={status?._id}
                status={status}
                currentStatus={currentStatus}
                setCurrentStatus={setCurrentStatus}
              />
            ))}
            
            {!maxStatuses && (
              <li
                className="secondary-button w-fit"
                onClick={handleAddStatus}
              >
                <Plus size={16} />
                Ajouter un nouveau statut
              </li>
            )}
          </ul>
        </div>
      </Sidebar>
    </div>
  );
}
