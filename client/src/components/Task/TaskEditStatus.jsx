import { deleteStatus, updateStatus } from "@/api/status";
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
      className="relative flex items-center gap-0.5 min-w-[135px] max-w-[150px]"
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      <div 
        className="absolute flex justify-center items-center text-text-light-color h-5.5 w-5.5 left-1 rounded-border-radius-large"
        style={{ backgroundColor: color }}
      >
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
        className="border-none py-2 pr-4 !pl-7.5 rounded-border-radius-large bg-text-lighter-color text-[15px] whitespace-nowrap text-ellipsis font-bricolage"
      />
      {!status?.default && (
        <X
          className="opacity-0 absolute text-text-dark-color -right-4.5 data-[show=true]:opacity-100"
          data-show={isHover}
          size={18}
          onClick={handleDeleteStatus}
        />
      )}
    </li>
  );
}
