import { deleteStatus, updateStatus } from "@/api/status";
import styles from "@/styles/components/task/task-edit-status.module.css";
import { bricolageGrostesque } from "@/utils/font";
import { Palette, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import ColorsPopup from "../Popups/ColorsPopup";
import { colors } from "@/utils/utils";
import { useProjectContext } from "@/context/ProjectContext";
import { useUserRole } from "@/app/hooks/useUserRole";

export default function TaskEditStatus({
  status,
  currentStatus,
  setCurrentStatus,
}) {
  const { project, statuses, mutateStatuses } = useProjectContext();
  const [isHover, setIsHover] = useState(false);
  const [name, setName] = useState(status?.name || "");
  const [moreColor, setMoreColor] = useState(false);
  const [color, setColor] = useState(status?.color || "");
  const statusesColors = statuses.map((s) => s.color);
  const availableColors = colors.filter(
    (color) => !statusesColors.includes(color)
  );

  const canEdit = useUserRole(project, [
    "owner",
    "manager",
    "team",
    "customer",
  ]);

  async function handleUpdateStatusName() {
    if (!canEdit) return;

    if (!name) {
      return;
    }

    if (currentStatus?._id === status?._id) {
      setCurrentStatus({
        ...status,
        name: name,
      });
    }
    const res = await updateStatus(status?._id, status?.projectId, {
      name: name,
      color: status?.color,
    });

    if (!res.success) {
      console.error("Failed to update status:", res.message);

      setCurrentStatus(status);

      return;
    }

    mutateStatuses();
  }
  async function handleUpdateStatusColor(newColor = color) {
    if (!canEdit) return;
    setMoreColor(false);

    if (currentStatus?._id === status?._id) {
      setCurrentStatus({
        ...status,
        color: newColor,
      });
    }

    const res = await updateStatus(status?._id, status?.projectId, {
      name: status?.name,
      color: newColor,
    });

    if (!res.success) {
      console.error("Failed to update status color:", res.message);

      setCurrentStatus(status);

      return;
    }

    mutateStatuses();
  }

  // Only authorized users can delete a status and there must be more than one status
  async function handleDeleteStatus() {
    if (!canEdit) return;

    if (statuses.length === 1) return;

    const response = await deleteStatus(status?._id, status?.projectId);

    if (!response.success) {
      console.error("Failed to delete status:", response.message);
      return;
    }

    mutateStatuses();
  }

  const handleUpdateStatusNameDebouced = useDebouncedCallback(() => {
    handleUpdateStatusName();
  }, 600);

  return (
    <li
      className={styles.container}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      <div className={styles.color} style={{ backgroundColor: color }}>
        <Palette size={14} onClick={(e) => setMoreColor(true)} />{" "}
        {moreColor && (
          <ColorsPopup
            colors={availableColors}
            setColor={setColor}
            setMoreColor={setMoreColor}
            updateStatus={(newColor) => handleUpdateStatusColor(newColor)}
          />
        )}
      </div>
      <input
        type="text"
        id="status-name"
        name="status-name"
        value={name}
        onBlur={handleUpdateStatusName}
        onChange={(e) => {
          setName(e.target.value);
          handleUpdateStatusNameDebouced();
        }}
        className={bricolageGrostesque.className}
      />
      {statuses.length > 1 && (
        <X
          className={styles.delete}
          data-show={isHover}
          size={18}
          onClick={handleDeleteStatus}
        />
      )}
    </li>
  );
}
