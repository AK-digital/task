import { deleteStatus, updateStatus } from "@/api/status";
import { Palette, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import ColorsPopup from "../Popups/ColorsPopup";
import { colors } from "@/utils/utils";
import { useProjectContext } from "@/context/ProjectContext";
import { useUserRole } from "../../../hooks/useUserRole";

export default function TaskEditStatus({
  status,
  currentStatus,
  setCurrentStatus,
}) {
  const { project, mutateTasks, statuses, mutateStatuses } =
    useProjectContext();
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
    mutateTasks();
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
    mutateTasks();
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
    mutateTasks();
  }

  const handleUpdateStatusNameDebouced = useDebouncedCallback(() => {
    handleUpdateStatusName();
  }, 600);

  return (
    <li
      className="relative flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      <div
        className="flex justify-center items-center text-white h-8 w-8 rounded-full cursor-pointer hover:opacity-80 transition-opacity"
        style={{ backgroundColor: color }}
        onClick={() => setMoreColor(true)}
      >
        <Palette size={16} />
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
        className="flex-1 border border-gray-200 py-2 px-3 rounded-md bg-white text-[15px] font-bricolage focus:border-accent-color focus:outline-none"
        placeholder="Nom du statut"
      />
      
      {!status?.default && (
        <span
          className={`text-gray-400 hover:text-danger-color transition-colors p-1 rounded ${
            isHover ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={handleDeleteStatus}
          title="Supprimer ce statut"
        >
          <Trash size={18} />
        </span>
      )}
    </li>
  );
}
