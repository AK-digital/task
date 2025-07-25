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
import { useStatuses } from "../../../hooks/useStatus";

export default function TaskStatus({ task, uid }) {
  const { project, mutateTasks, statuses, mutateStatuses } =
    useProjectContext();
  const { statuses: statusesData, mutateStatuses: mutateStatusesData } =
    useStatuses(project?._id || task?.projectId?._id);
  const [currentStatus, setCurrentStatus] = useState(task?.status);
  const [isEdit, setIsEdit] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

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
    mutateStatusesData();
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

    setIsEdit((prev) => !prev);
  }

  useMemo(() => {
    setCurrentStatus(task?.status);
  }, [task?.status]);

  const hasStatus = currentStatus?.name;
  const currentBackgroundColor = hasStatus ? currentStatus?.color : "#b3bcc0";

  function listWidth() {
    if (isEdit && statusesData?.length > 5) {
      return true;
    } else if (!isEdit && statusesData?.length > 6) {
      return true;
    }

    return false;
  }

  return (
    <div className="flex items-center select-none border-r border-text-light-color text-xs lg:text-normal text-foreground min-w-[80px] sm:min-w-[100px] lg:min-w-[120px] max-w-[150px] w-full h-full flex-shrink-0">
      <div
        className="relative w-full min-w-[70px] lg:min-w-[110px] text-center cursor-pointer py-1.5 lg:py-2 px-2 lg:px-4 rounded-3xl mx-2 lg:mx-3 text-white whitespace-nowrap text-ellipsis overflow-hidden"
        style={{ backgroundColor: currentBackgroundColor }}
        onClick={handleIsOpen}
        ref={refs.setReference}
      >
        <span>{currentStatus?.name || "En attente"}</span>
      </div>

      {isOpen && (
        <FloatingMenu
          setIsOpen={setIsOpen}
          className={listWidth() ? "w-[380px]" : "w-[220px]"}
          refs={refs}
          floatingStyles={floatingStyles}
        >
          <ul className="grid grid-flow-col grid-rows-[repeat(6,auto)] gap-2 p-3 border-b border-color-border-color">
            {statusesData?.map((status) => {
              if (!isEdit) {
                return (
                  <li
                    key={status?._id}
                    className="py-2 px-4 min-w-[135px] cursor-pointer text-white rounded-3xl text-center min-h-[34px] transition-all duration-[60ms] linear hover:opacity-80"
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
                className="flex items-center gap-1 border-none py-2 px-4 rounded-3xl bg-text-lighter-color text-[15px] text-text-dark-color transition-all duration-[120ms] ease-in-out min-w-[135px] max-w-[150px] cursor-pointer"
                onClick={handleAddStatus}
              >
                <Plus size={16} />
                Ajouter
              </li>
            )}
          </ul>
          {isEdit ? (
            <button
              className="bg-transparent w-full outline-none border-none text-text-dark-color p-1 mt-2 text-center flex items-center justify-center gap-2 text-[0.9rem] rounded-[4px] hover:bg-text-lighter-color hover:shadow-none"
              onClick={handleEditStatus}
            >
              <Save size={16} />
              Appliquer
            </button>
          ) : (
            <button
              className="bg-transparent w-full outline-none border-none text-text-dark-color p-1 mt-2 text-center flex items-center justify-center gap-2 text-[0.9rem] rounded-[4px] hover:bg-text-lighter-color hover:shadow-none"
              onClick={handleEditStatus}
            >
              <Pen size={16} /> Modifier les statuts
            </button>
          )}
        </FloatingMenu>
      )}
    </div>
  );
}
