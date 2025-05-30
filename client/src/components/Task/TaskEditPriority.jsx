import { deletePriority, updatePriority } from "@/api/priority";
import styles from "@/styles/components/task/task-edit-status.module.css";
import { bricolageGrostesque } from "@/utils/font";
import { Palette, X } from "lucide-react";
import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import ColorsPopup from "../Popups/ColorsPopup";
import { useProjectContext } from "@/context/ProjectContext";
import { useUserRole } from "@/app/hooks/useUserRole";
import { priorityColors } from "@/utils/utils";

export default function TaskEditPriority({
  priority,
  currentPriority,
  setCurrentPriority,
}) {
  const { project, mutateTasks, priorities, mutatePriorities } =
    useProjectContext();
  const [isHover, setIsHover] = useState(false);
  const [name, setName] = useState(priority?.name || "");
  const [moreColor, setMoreColor] = useState(false);
  const [color, setColor] = useState(priority?.color || "");
  const prioritiesColors = priorities.map((p) => p.color);
  const availableColors = priorityColors.filter(
    (color) => !prioritiesColors.includes(color)
  );

  const canEdit = useUserRole(project, [
    "owner",
    "manager",
    "team",
    "customer",
  ]);

  async function handleUpdatePriorityName() {
    if (!canEdit) return;

    if (!name) return;

    if (currentPriority?._id === priority?._id) {
      setCurrentPriority({
        ...priority,
        name: name,
      });
    }

    const res = await updatePriority(priority?._id, priority?.projectId, {
      name: name,
      color: priority?.color,
    });

    if (!res.success) {
      console.error("Failed to update priority:", res.message);
      setCurrentPriority(priority);
      return;
    }

    mutatePriorities();
    mutateTasks();
  }

  async function handleUpdatePriorityColor(newColor = color) {
    if (!canEdit) return;

    if (currentPriority?._id === priority?._id) {
      setCurrentPriority({
        ...priority,
        color: newColor,
      });
    }

    setMoreColor(false);

    const res = await updatePriority(priority?._id, priority?.projectId, {
      name: priority?.name,
      color: newColor,
    });

    if (!res.success) {
      console.error("Failed to update priority color:", res.message);

      setCurrentPriority(priority);

      return;
    }

    mutatePriorities();
    mutateTasks();
  }

  async function handleDeletePriority() {
    if (!canEdit) return;

    if (priorities.length === 1) return;

    const response = await deletePriority(priority?._id, priority?.projectId);

    if (!response.success) {
      console.error("Failed to delete priority:", response.message);
      return;
    }

    mutatePriorities();
    mutateTasks();
  }

  const handleUpdatePriorityNameDebouced = useDebouncedCallback(() => {
    handleUpdatePriorityName();
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
            updateStatus={(newColor) => handleUpdatePriorityColor(newColor)}
          />
        )}
      </div>
      <input
        type="text"
        id="priority-name"
        name="priority-name"
        value={name}
        onBlur={handleUpdatePriorityName}
        onChange={(e) => {
          setName(e.target.value);
          handleUpdatePriorityNameDebouced();
        }}
        className={bricolageGrostesque.className}
      />
      {!priority?.default && (
        <X
          className={styles.delete}
          data-show={isHover}
          size={18}
          onClick={handleDeletePriority}
        />
      )}
    </li>
  );
}
