import { deleteTask } from "@/api/task";
import { Trash } from "lucide-react";
import { useState } from "react";
import ConfirmDialog from "../Modals/ConfirmDialog";
import socket from "@/utils/socket";
import { useUserRole } from "@/app/hooks/useUserRole";
import { useTranslation } from "react-i18next";

export default function TaskRemove({ task, archive, mutate }) {
  const { t } = useTranslation();
  const [showConfirm, setShowConfirm] = useState(false);
  const project = task?.projectId;
  const canDelete = useUserRole(project, [
    "owner",
    "manager",
    "team",
    "customer",
  ]);

  async function handleDeleteTask() {
    const res = await deleteTask([task?._id], project?._id);

    if (!res.success) return;

    await mutate();

    socket.emit("update task", project?._id);
  }

  if (!canDelete) return null;

  return (
    <div className="flex items-center h-full cursor-pointer text-[#41435f] transition-colors duration-150 ease-in-out relative px-[6px] hover:text-danger-color">
      <Trash size={20} onClick={() => setShowConfirm(true)} />
      {showConfirm && (
        <>
          <ConfirmDialog
            isOpen={showConfirm}
            onClose={() => setShowConfirm(false)}
            onConfirm={handleDeleteTask}
            message={t("tasks.confirm_delete")}
          />
          <div
            className="modal-layout-opacity"
            onClick={() => setShowConfirm(false)}
          ></div>
        </>
      )}
    </div>
  );
}
