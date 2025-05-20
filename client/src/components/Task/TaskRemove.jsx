import { useEffect, useRef, useState } from "react";
import ConfirmDialog from "../Modals/ConfirmDialog";
import Portal from "../Portal/Portal";
import styles from "@/styles/components/task/task-remove.module.css";
import { Trash } from "lucide-react";
import { useUserRole } from "@/app/hooks/useUserRole";
import { deleteTask } from "@/api/task";
import socket from "@/utils/socket";

export default function TaskRemove({ task, archive, mutate }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [dialogPos, setDialogPos] = useState(null);
  const btnRef = useRef(null);

  const project = task?.projectId;
  const canDelete = useUserRole(project, [
    "owner",
    "manager",
    "team",
    "customer",
  ]);

  function handleOpenDialog() {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setDialogPos({
        top: rect.top + rect.height,
        left: rect.left,
      });
    }
    setShowConfirm(true);
  }

  useEffect(() => {
    if (!showConfirm) return;

    const handleScrollOrResize = () => {
      setShowConfirm(false);
    };

    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [showConfirm]);

  async function handleDeleteTask() {
    const res = await deleteTask([task?._id], project?._id);

    if (!res.success) return;

    await mutate();

    socket.emit("update task", project?._id);
  }

  if (!canDelete) return null;

  return (
    <div className={styles.container} id="task-row" ref={btnRef}>
      <Trash size={20} onClick={handleOpenDialog} />
      <Portal>
        {showConfirm && dialogPos && (
          <ConfirmDialog
            isOpen={showConfirm}
            onClose={() => setShowConfirm(false)}
            onConfirm={handleDeleteTask}
            message="Supprimer cette tâche ?"
            position={dialogPos}
          />
        )}
      </Portal>
    </div>
  );
}
