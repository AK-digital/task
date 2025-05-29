"use client";

import {
  addTaskToArchive,
  deleteTask,
  removeTaskFromArchive,
} from "@/api/task";
import { AuthContext } from "@/context/auth";
import socket from "@/utils/socket";
import { checkRole } from "@/utils/utils";
import { Archive, ArchiveRestore, Trash, X } from "lucide-react";
import { useContext } from "react";

export default function SelectedTasks({
  project,
  selectedTasks,
  setSelectedTasks,
  archive,
  mutate,
}) {
  const { uid } = useContext(AuthContext);

  function handleClose(e) {
    e.preventDefault();

    const inputs = document?.getElementsByName("task");
    const checkedInputs = Array.from(inputs).filter((input) => input.checked);

    for (const checkedInput of checkedInputs) {
      checkedInput.checked = false;
    }

    setSelectedTasks([]);
  }

  const handleAddToArchive = async (e) => {
    e.preventDefault();

    const confirmed = confirm(
      " Êtes-vous sûr de vouloir archiver cette tâche ?"
    );

    if (!confirmed) return;

    // Tasks is an array of task ids
    await addTaskToArchive(selectedTasks, project?._id);

    await mutate();

    socket.emit("update task", project?._id);

    setSelectedTasks([]);
  };

  const handleRemoveFromArchive = async (e) => {
    e.preventDefault();

    const confirmed = confirm(
      " Êtes-vous sûr de vouloir restaurer cette tâche ?"
    );

    if (!confirmed) return;

    // Tasks is an array of task ids
    await removeTaskFromArchive(selectedTasks, project?._id);

    await mutate();

    socket.emit("update task", project?._id);

    setSelectedTasks([]);
  };

  async function handleDelete(e) {
    e.preventDefault();

    const confirmed = confirm(
      " Êtes-vous sûr de vouloir supprimer cette tâche ?"
    );

    if (!confirmed) return;

    // Tasks is an array of task ids
    const res = await deleteTask(selectedTasks, project?._id);

    if (!res.success) return;

    await mutate();

    socket.emit("update task", project?._id);

    setSelectedTasks([]);
  }

  return (
    <div className="flex fixed z-2001 left-1/2 bottom-5 -translate-x-1/2 bg-background-secondary-color shadow-[0_2px_4px_rgba(0,0,0,0.25)] rounded-border-radius-small text-black animate-[showAnim_0.2s_ease-out]">
      {/* Main content */}
      <div className="flex items-center gap-3 pr-6">
        <div className="bg-[#007CFF] h-full text-text-color rounded-[8px_0_0_8px] font-bold text-text-size-large py-4.5 px-6">
          <span> {selectedTasks.length}</span>
        </div>
        <div className="text-[1.4rem]">
          <span>
            {selectedTasks?.length > 1
              ? "Tâches séléctionnées"
              : "Tâche séléctionnée"}
          </span>
        </div>
        {/* actions */}
        <div className="flex gap-6">
          {/* action */}
          {!archive &&
            checkRole(project, ["owner", "manager", "team"], uid) && (
              <div className="flex flex-col justify-center items-center cursor-pointer gap-0.5" onClick={handleAddToArchive}>
                <Archive size={20} />
                <span className="text-text-size-small">Archiver</span>
              </div>
            )}
          {archive && checkRole(project, ["owner", "manager", "team"], uid) && (
            <div className="flex flex-col justify-center items-center cursor-pointer gap-0.5" onClick={handleRemoveFromArchive}>
              <ArchiveRestore size={20} />
              <span className="text-text-size-small">Restaurer</span>
            </div>
          )}
          {checkRole(
            project,
            ["owner", "manager", "team", "customer"],
            uid
          ) && (
            <div className="flex flex-col justify-center items-center cursor-pointer gap-0.5 text-blocked-color" onClick={handleDelete}>
              <Trash size={20} />
              <span className="text-text-size-small">Supprimer</span>
            </div>
          )}
          <div className="flex flex-col justify-center items-center cursor-pointer gap-0.5 border-l border-[#007CFF] pl-3" onClick={handleClose}>
            <X size={22} />
          </div>
        </div>
      </div>
    </div>
  );
}
